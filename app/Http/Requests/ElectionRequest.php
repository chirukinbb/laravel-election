<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ElectionRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => 'required|min:10|max:50',
            'date_start' => 'required|date|date_format:Y-m-d|after_or_equal:today|before:date_end',
            'date_end' => 'required|date|date_format:Y-m-d'
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}