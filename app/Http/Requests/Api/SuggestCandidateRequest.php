<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class SuggestCandidateRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'country_code' => 'required|in:' . implode(',', array_keys(config('election.countries'))),
            'city' => 'nullable|string|max:255',
            'profession' => 'nullable|string|max:255',
            'role' => 'nullable|string|max:255',
            'website' => 'nullable|url|max:255',
            'socials' => 'nullable|array',
            'socials.*' => 'nullable|string|max:255',
            'photo_url' => 'nullable|string|starts_with:https://',
            'reason_for_nomination' => 'required|min:50|max:1000',
            'captcha_token' => 'required|string',
        ];
    }

    public function authorize(): bool
    {
        return true;
    }

    public function messages(): array
    {
        return [
            'reason_for_nomination.min' => 'The reason for nomination must be at least 50 characters.',
            'reason_for_nomination.max' => 'The reason for nomination must not exceed 1000 characters.',
        ];
    }
}
