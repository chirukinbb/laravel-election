<?php

namespace Modules\Election\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Modules\Election\Enums\RoleEnum;

class CandidateRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'firstName' => ['required', 'string', 'max:255'],
            'lastName' => ['required', 'string', 'max:255'],
            'country' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'activity' => ['required', 'string', 'max:1000'], // или array, если передается массив языков/тегов
            'reason' => ['required', 'string'],
            'nominatorName' => ['nullable', 'string', 'max:255'],
            'showNominator' => ['required', 'boolean'],

            // Валидация массива contributions: { what, when, forWhom }
            'contributions' => ['nullable', 'array'],
            'contributions.*.what' => ['required_with:contributions', 'string', 'max:255'],
            'contributions.*.when' => ['required_with:contributions', 'string', 'max:255'],
            'contributions.*.forWhom' => ['required_with:contributions', 'string', 'max:255'],

            // Валидация массива links: { label, url }
            'links' => ['nullable', 'array'],
            'links.*.label' => ['required_with:links', 'string', 'max:255'],
            'links.*.url' => ['required_with:links', 'url', 'max:255'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}