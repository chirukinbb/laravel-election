<?php

namespace Modules\Election\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Modules\Election\Enums\RoleEnum;
use Modules\Election\Enums\VoteStatusEnum;

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
            'status' => 'nullable|in:' . collect(VoteStatusEnum::cases())->map(fn($case) => $case->name)->join(',')
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}