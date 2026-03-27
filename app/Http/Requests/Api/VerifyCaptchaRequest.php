<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class VerifyCaptchaRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'captcha_token' => 'required|string',
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
