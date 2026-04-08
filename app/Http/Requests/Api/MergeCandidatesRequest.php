<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class MergeCandidatesRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'source_candidate_id' => 'required|exists:candidates,id',
            'target_candidate_id' => 'required|exists:candidates,id|different:source_candidate_id',
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
