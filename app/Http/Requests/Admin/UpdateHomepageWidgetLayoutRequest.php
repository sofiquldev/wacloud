<?php

namespace App\Http\Requests\Admin;

use App\Support\CmsPageLayout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateHomepageWidgetLayoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $templates = $this->input('templates');
        if (! is_array($templates)) {
            return;
        }

        $normalized = [];
        foreach ($templates as $i => $tpl) {
            if (! is_array($tpl)) {
                continue;
            }
            $kind = $tpl['kind'] ?? 'custom';
            if (! in_array($kind, ['homepage', 'inner-page', 'custom'], true)) {
                $kind = 'custom';
            }
            $id = isset($tpl['id']) && is_string($tpl['id']) && trim($tpl['id']) !== ''
                ? trim($tpl['id'])
                : 'tpl-'.($i + 1);
            $name = isset($tpl['name']) && is_string($tpl['name']) && trim($tpl['name']) !== ''
                ? trim($tpl['name'])
                : ($kind === 'homepage' ? 'Homepage' : ($kind === 'inner-page' ? 'Inner page' : 'Template'));
            $tpl['id'] = $id;
            $tpl['name'] = $name;
            $tpl['kind'] = $kind;
            $tpl['columnLayout'] = CmsPageLayout::normalize($tpl['columnLayout'] ?? null);
            $instances = $tpl['instances'] ?? [];
            if (is_object($instances)) {
                $instances = (array) $instances;
            }
            $tpl['instances'] = is_array($instances) ? $instances : [];
            $normalized[] = $tpl;
        }
        $this->merge(['templates' => $normalized]);
    }

    /**
     * Full layout document for cms_settings (after validation).
     *
     * @return array<string, mixed>
     */
    public function layoutPayload(): array
    {
        return [
            'templates' => $this->input('templates', []),
            'activeTemplateId' => (string) $this->input('activeTemplateId', ''),
            'applyToPublicHome' => $this->boolean('applyToPublicHome'),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $layoutIds = CmsPageLayout::allowedIds();
        if ($layoutIds === []) {
            $layoutIds = ['content-right'];
        }

        return [
            'templates' => ['required', 'array', 'min:1'],
            'templates.*.id' => ['required', 'string', 'max:64'],
            'templates.*.name' => ['required', 'string', 'max:128'],
            'templates.*.kind' => ['required', Rule::in(['homepage', 'inner-page', 'custom'])],
            'templates.*.columnLayout' => ['required', 'string', Rule::in($layoutIds)],
            'templates.*.zones' => ['required', 'array'],
            'templates.*.zones.left' => ['present', 'array'],
            'templates.*.zones.main' => ['present', 'array'],
            'templates.*.zones.right' => ['present', 'array'],
            // Inner-page templates may have zero widgets; `present` allows an empty array (required does not).
            'templates.*.instances' => ['present', 'array'],
            'activeTemplateId' => ['required', 'string'],
            'applyToPublicHome' => ['required', 'boolean'],
        ];
    }

    protected function withValidator($validator): void
    {
        $validator->after(function ($v) {
            $templates = (array) $this->input('templates', []);
            $ids = collect($templates)->pluck('id')->filter()->all();
            if (count($ids) !== count(array_unique($ids))) {
                $v->errors()->add('templates', 'Template ids must be unique.');
            }
            $kinds = collect($templates)->pluck('kind')->all();
            if (in_array('homepage', $kinds, true) && count(array_keys($kinds, 'homepage', true)) > 1) {
                $v->errors()->add('templates', 'Only one template can be marked as Homepage.');
            }
            if (in_array('inner-page', $kinds, true) && count(array_keys($kinds, 'inner-page', true)) > 1) {
                $v->errors()->add('templates', 'Only one template can be marked as Inner page.');
            }
            $activeId = (string) $this->input('activeTemplateId', '');
            if ($activeId !== '' && ! in_array($activeId, $ids, true)) {
                $v->errors()->add('activeTemplateId', 'Active template must exist in templates.');
            }
        });
    }
}
