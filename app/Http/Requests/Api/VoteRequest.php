<?php

namespace App\Http\Requests\Api;

use App\Rules\ElectionRule;
use Illuminate\Foundation\Http\FormRequest;

class VoteRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'candidate_id' => 'required|exists:candidates,id',
            'election_id' => ['required', 'exists:elections,id', new ElectionRule($this->post('election_id'))],
            'g-recaptcha-response' => 'required|recaptcha',
        ];
    }

    public function messages()
    {
        return [
            'candidate_id.required' => 'Choose your candidate',
            'g-recaptcha-response.required' => 'Pass the reCaptcha'
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
