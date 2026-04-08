<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class RejectCandidateRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'candidate_id' => 'required|exists:candidates,id',
            'reason' => 'nullable|string|max:1000',
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
