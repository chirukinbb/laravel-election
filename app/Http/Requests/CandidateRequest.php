<?php

namespace App\Http\Requests;

use App\Enums\RoleEnum;
use App\Enums\VoteStatusEnum;
use Illuminate\Foundation\Http\FormRequest;

class CandidateRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'first_name' => 'required',
            'last_name' => 'required',
            'country_code' => 'in:' . implode(',', array_keys(config('election.countries'))),
            'city',
            'profession',
            'role',
            'website',
            'socials' => 'array',
            'photo_url' => 'nullable|string|starts_with:https://',
            'reason_for_nomination' => \Auth::user()->hasRole(RoleEnum::USER->name) ? 'required|min:50|max:1000' : '',
            'merge_with' => 'nullable|numeric|in:candidates,id',
            'status' => 'nullable|in:' . collect(VoteStatusEnum::cases())->map(fn($case) => $case->name)->join(',')
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}