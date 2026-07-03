<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCatalogTaxonomiesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'designations' => ['required', 'array', 'min:1', 'max:200'],
            'designations.*' => ['required', 'string', 'max:255'],
            'wards' => ['required', 'array', 'min:1', 'max:300'],
            'wards.*' => ['required', 'string', 'max:255'],
        ];
    }
}
