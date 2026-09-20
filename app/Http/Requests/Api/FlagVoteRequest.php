<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class FlagVoteRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'vote_id' => 'required|exists:votes,id',
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
