<?php

namespace App\Http\Requests;

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
            'photo_url' => 'contains:https://',
            'reason_for_nomination' => 'required|min:50|max:1000'
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}