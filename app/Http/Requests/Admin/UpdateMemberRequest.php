<?php

namespace App\Http\Requests\Admin;

use App\Support\CmsCatalogResolver;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMemberRequest extends FormRequest
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
        $catalog = app(CmsCatalogResolver::class)->merged();
        $designations = $catalog['designations'] ?? [];
        $wards = $catalog['wards'] ?? [];
        $sessionIds = collect($catalog['sessions'] ?? [])->pluck('id')->all();

        return [
            'name' => ['required', 'string', 'max:255'],
            'designation' => ['required', 'string', 'max:255', Rule::in($designations)],
            'ward' => ['nullable', 'string', 'max:255', Rule::in($wards)],
            'sessionId' => ['required', 'string', 'max:64', Rule::in($sessionIds)],
            'phone' => ['nullable', 'string', 'max:64'],
            'email' => ['nullable', 'string', 'email', 'max:255'],
            'status' => ['required', 'string', Rule::in(['active', 'past'])],
            'publicMessage' => ['nullable', 'string', 'max:20000'],
            'party' => ['nullable', 'string', 'max:255'],
            'photo' => ['nullable', 'file', 'mimes:jpeg,jpg,png,gif,webp', 'max:2560'],
            'photoUrl' => ['nullable', 'string', 'max:5242880'],
        ];
    }
}
