<?php

namespace Modules\Profile\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProfileRequest extends FormRequest
{
    public function rules()
    {
        return [
            'name' => 'required|string|max:255',
            'avatar' => 'file|image|mimes:webp|max:2048|nullable',
            'avatar_url' => 'string|max:255|nullable',
            'languages' => 'required|array',
            'bio' => 'required|string'
        ];
    }
}
