<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'geo_json' => 'required|array',
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Project name is required.',
            'name.string' => 'Project name must be a string.',
            'name.max' => 'Project name cannot exceed 255 characters.',
            'geo_json.required' => 'Geo JSON data is required.',
            'geo_json.array' => 'Geo JSON must be an array.',
        ];
    }
}
