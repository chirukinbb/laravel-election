<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class ApproveCandidateRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'candidate_id' => 'required|exists:candidates,id',
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
