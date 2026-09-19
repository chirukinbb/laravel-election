<?php

namespace Modules\Election\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Modules\Election\Rules\ElectionRule;
use Modules\Election\Traits\AntiFraud;

class VoteRequest extends FormRequest
{
    use AntiFraud;

    public function rules(): array
    {
        return [
            'candidate_id' => 'required|exists:candidates,id',
            'election_id' => ['required', 'exists:elections,id', new ElectionRule($this->post('election_id'))],
            //'g-recaptcha-response' => 'required|captcha',
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
