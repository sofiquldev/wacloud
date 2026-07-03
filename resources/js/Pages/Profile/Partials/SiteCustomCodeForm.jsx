import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { useForm, usePage } from '@inertiajs/react';
import { Save } from 'lucide-react';

function firstError(value) {
    if (value == null || value === '') {
        return null;
    }

    return Array.isArray(value) ? value[0] : value;
}

export default function SiteCustomCodeForm({ settings }) {
    const { errors } = usePage().props;

    const form = useForm({
        customHeadCss: settings.customHeadCss ?? '',
        customBodyJs: settings.customBodyJs ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.patch(route('profile.site-custom-code.update'), { preserveScroll: true });
    };

    const fieldClass =
        'mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-civic focus:outline-none focus:ring-1 focus:ring-civic';

    const topError = firstError(errors.custom_code);

    return (
        <form onSubmit={submit} className="space-y-8">
            <div>
                <h2 className="text-base font-semibold text-slate-900">Custom public code</h2>
                <p className="mt-1 text-sm text-slate-500">
                    Applied only on citizen-facing pages (not the admin console or auth screens). Paste raw CSS or HTML
                    with <code className="rounded bg-slate-100 px-1">&lt;script&gt;</code> tags. Only trusted staff
                    should edit this — it runs in visitors&apos; browsers.
                </p>
            </div>

            {topError ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">{topError}</p>
            ) : null}

            <div>
                <InputLabel htmlFor="customHeadCss" value="Custom CSS" />
                <p className="mt-0.5 text-xs text-slate-500">
                    Injected in the document head (after bundled assets). Updates on each page when navigating the public
                    site.
                </p>
                <textarea
                    id="customHeadCss"
                    value={form.data.customHeadCss}
                    onChange={(e) => form.setData('customHeadCss', e.target.value)}
                    rows={10}
                    spellCheck={false}
                    className={`${fieldClass} font-mono text-xs`}
                    placeholder={'/* e.g. .bg-background { ... } */'}
                />
                <InputError className="mt-1" message={firstError(form.errors.customHeadCss)} />
            </div>

            <div>
                <InputLabel htmlFor="customBodyJs" value="Custom HTML / JavaScript" />
                <p className="mt-0.5 text-xs text-slate-500">
                    Output before the closing <code className="rounded bg-slate-100 px-1">&lt;/body&gt;</code> on the
                    first load of a public page. Inline scripts typically run once per full page load, not on every
                    Inertia navigation.
                </p>
                <textarea
                    id="customBodyJs"
                    value={form.data.customBodyJs}
                    onChange={(e) => form.setData('customBodyJs', e.target.value)}
                    rows={10}
                    spellCheck={false}
                    className={`${fieldClass} font-mono text-xs`}
                    placeholder="e.g. analytics snippet or script tags"
                />
                <InputError className="mt-1" message={firstError(form.errors.customBodyJs)} />
            </div>

            <div className="flex items-center gap-3 border-t border-slate-100 pt-6">
                <PrimaryButton type="submit" disabled={form.processing} className="inline-flex items-center gap-2">
                    <Save className="size-4" aria-hidden />
                    {form.processing ? 'Saving…' : 'Save custom code'}
                </PrimaryButton>
            </div>
        </form>
    );
}
