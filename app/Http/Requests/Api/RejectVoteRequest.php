<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class RejectVoteRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'vote_id' => 'required|exists:votes,id',
            'reason' => 'nullable|string|max:1000',
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
