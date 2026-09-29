<?php

namespace Modules\Election\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\Election\Enums\VoteStatusEnum;
use Modules\Election\Http\Resources\FullCandidateResource;
use Modules\Election\Http\Resources\ShortCandidateResource;
use Modules\Election\Models\Candidate;
use Modules\Election\Models\Election;

class CandidateController extends Controller
{

    public function index(Request $request, Election $election)
    {
        $userId = auth()->id();

        // Фильтры и сортировка из запроса
        $search = $request->input('search');          // Поиск по имени/фамилии
        $countryCode = $request->input('country');    // Код страны (например, 'US', 'UA')
        $sortBy = $request->input('sort_by', 'votes_count');
        $sortOrder = strtolower($request->input('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';

        $candidates = $election->candidates()
            // 1. Поиск по имени и/или фамилии
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'LIKE', "%{$search}%")
                        ->orWhere('last_name', 'LIKE', "%{$search}%")
                        // Если передали полное имя "Иван Иванов" в один параметр
                        ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$search}%"]);
                });
            })
            // 2. Фильтр по 2-буквенному коду страны
            ->when($countryCode, function ($query, $countryCode) {
                $query->where('country_code', strtoupper($countryCode));
            })
            // 3. Подчет верифицированных голосов
            ->withCount(['votes' => function ($query) {
                $query->where('status', VoteStatusEnum::Verified->name);
            }])
            // 4. Проверка голоса текущего пользователя
            ->withExists(['votes as is_my' => function ($query) use ($userId) {
                $query->where('user_id', $userId)
                    ->where('status', VoteStatusEnum::Verified->name);
            }])
            // 5. Вычисление глобальной позиции (позиция считается среди ВСЕХ кандидатов выборов)
            ->selectSub(function ($query) {
                $query->selectRaw('DENSE_RANK() OVER (ORDER BY (
                SELECT COUNT(*) 
                FROM votes 
                WHERE votes.candidate_id = candidates.id 
                  AND votes.status = ?
            ) DESC, candidates.id ASC)', [VoteStatusEnum::Verified->name]);
            }, 'position')
            // 6. Динамическая сортировка
            ->when($sortBy === 'name', function ($query) use ($sortOrder) {
                $query->orderBy('first_name', $sortOrder)
                    ->orderBy('last_name', $sortOrder);
            }, function ($query) use ($sortOrder) {
                $query->orderBy('votes_count', $sortOrder)
                    ->orderBy('id', 'asc');
            })
            ->paginate(10)
            // Сохраняем все параметры фильтрации в ссылках пагинации
            ->appends($request->only(['search', 'country', 'sort_by', 'sort_order']));

        return ShortCandidateResource::collection($candidates);
    }

    public function show(Candidate $candidate)
    {
        return FullCandidateResource::make($candidate);
    }
}