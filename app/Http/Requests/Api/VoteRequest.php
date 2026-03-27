<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class VoteRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'candidate_id' => 'required|exists:candidates,id',
            'captcha_token' => 'required|string',
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
