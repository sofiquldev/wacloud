import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useForm, usePage } from '@inertiajs/react';
import { Info, Save } from 'lucide-react';

/** Default true — false / 0 / string falsy stored in JSON turn off. */
function normalizeBooleanDefaultTrue(value) {
    if (value === false || value === 0 || value === '0' || value === 'false' || value === '') {
        return false;
    }

    return true;
}

export default function SiteBrandingForm({ settings }) {
    const { errors } = usePage().props;

    const form = useForm({
        appTitleBn: settings.appTitleBn ?? '',
        appTitleEn: settings.appTitleEn ?? '',
        logoMode: settings.logoMode === 'image' ? 'image' : 'builtin',
        logoSealLine1: settings.logoSealLine1 ?? 'POURA',
        logoSealLine2: settings.logoSealLine2 ?? 'SEAL',
        logoShowBanglaTitle: Boolean(settings.logoShowBanglaTitle ?? true),
        logoShowEnglishTitle: Boolean(settings.logoShowEnglishTitle ?? true),
        logoBuiltinPreset: settings.logoBuiltinPreset === 'classic' ? 'classic' : 'official',
        logoShowTitles: normalizeBooleanDefaultTrue(settings.logoShowTitles),
        logoAlign: ['left', 'center', 'right'].includes(settings.logoAlign) ? settings.logoAlign : 'left',
        noticeTickerEnabled: normalizeBooleanDefaultTrue(settings.noticeTickerEnabled),
        footerIntroTitle: settings.footerIntroTitle ?? '',
        footerIntroBody: settings.footerIntroBody ?? '',
        footerAddress: settings.footerAddress ?? '',
        footerPhone: settings.footerPhone ?? '',
        footerEmail: settings.footerEmail ?? '',
        footerCreditLine: settings.footerCreditLine ?? '',
        footerCopyrightTemplate: settings.footerCopyrightTemplate ?? '',
        footerOrganizationShort: settings.footerOrganizationShort ?? '',
        logoImage: null,
        favicon: null,
        removeLogoImage: false,
        removeFavicon: false,
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('profile.site-appearance.update'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.setData('logoImage', null);
                form.setData('favicon', null);
                form.setData('removeLogoImage', false);
                form.setData('removeFavicon', false);
            },
        });
    };

    const fieldClass =
        'mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-civic focus:outline-none focus:ring-1 focus:ring-civic';

    return (
        <form onSubmit={submit} className="space-y-10">
            {errors.site ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">{errors.site}</p>
            ) : null}

            {!settings.publicDiskLinked ? (
                <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                    <Info className="size-5 shrink-0" aria-hidden />
                    <p>
                        Run <code className="rounded bg-amber-100 px-1">php artisan storage:link</code> so uploaded logo
                        and favicon files are reachable at <code className="rounded bg-amber-100 px-1">/storage/…</code>.
                    </p>
                </div>
            ) : null}

            {!settings.storageWritable ? (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
                    <strong>storage/app</strong> is not writable — saving settings or uploads may fail until permissions are
                    fixed.
                </p>
            ) : null}

            <section>
                <h2 className="text-base font-semibold text-slate-900">Site titles</h2>
                <p className="mt-1 text-sm text-slate-500">Shown in the public header and browser title on the home page.</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-1">
                    <div>
                        <InputLabel htmlFor="appTitleBn" value="Bengali title" />
                        <textarea
                            id="appTitleBn"
                            value={form.data.appTitleBn}
                            onChange={(e) => form.setData('appTitleBn', e.target.value)}
                            rows={2}
                            className={fieldClass}
                        />
                        <InputError className="mt-1" message={form.errors.appTitleBn} />
                    </div>
                    <div>
                        <InputLabel htmlFor="appTitleEn" value="English title (uppercase recommended)" />
                        <textarea
                            id="appTitleEn"
                            value={form.data.appTitleEn}
                            onChange={(e) => form.setData('appTitleEn', e.target.value)}
                            rows={2}
                            className={fieldClass}
                        />
                        <InputError className="mt-1" message={form.errors.appTitleEn} />
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-base font-semibold text-slate-900">Notice ticker</h2>
                <p className="mt-1 text-sm text-slate-500">
                    The scrolling notice bar below the main menu on public pages (Home and other full-width public
                    screens).
                </p>
                <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/80 p-4">
                    <input
                        type="checkbox"
                        checked={form.data.noticeTickerEnabled}
                        onChange={(e) => form.setData('noticeTickerEnabled', e.target.checked)}
                        className="mt-1 rounded border-slate-300 text-civic focus:ring-civic"
                    />
                    <span>
                        <span className="block text-sm font-semibold text-slate-900">Show notice ticker</span>
                        <span className="mt-0.5 block text-xs text-slate-500">
                            Turn off to hide the marquee strip entirely. Notice text is still edited in code until a CMS
                            source is wired.
                        </span>
                    </span>
                </label>
            </section>

            <section>
                <h2 className="text-base font-semibold text-slate-900">Logo</h2>
                <p className="mt-1 text-sm text-slate-500">
                    Use the built-in seal + titles, or upload a single image of the full lockup (emblem + text).
                </p>
                <div className="mt-4 space-y-4">
                    <fieldset className="flex flex-wrap gap-4">
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-800">
                            <input
                                type="radio"
                                name="logoMode"
                                checked={form.data.logoMode === 'builtin'}
                                onChange={() => form.setData('logoMode', 'builtin')}
                                className="text-civic focus:ring-civic"
                            />
                            Built-in seal + titles
                        </label>
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-800">
                            <input
                                type="radio"
                                name="logoMode"
                                checked={form.data.logoMode === 'image'}
                                onChange={() => form.setData('logoMode', 'image')}
                                className="text-civic focus:ring-civic"
                            />
                            Upload full logo image
                        </label>
                    </fieldset>

                    <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 space-y-4">
                        <label className="flex cursor-pointer items-start gap-3">
                            <input
                                type="checkbox"
                                checked={form.data.logoShowTitles}
                                onChange={(e) => form.setData('logoShowTitles', e.target.checked)}
                                className="mt-1 rounded border-slate-300 text-civic focus:ring-civic"
                            />
                            <span>
                                <span className="block text-sm font-semibold text-slate-900">
                                    Show site titles next to the logo
                                </span>
                                <span className="mt-0.5 block text-xs text-slate-500">
                                    Turn off for a logo-only header. Titles remain saved for the browser tab and SEO.
                                </span>
                            </span>
                        </label>
                        <div>
                            <InputLabel htmlFor="logoAlign" value="Logo row alignment" />
                            <select
                                id="logoAlign"
                                value={form.data.logoAlign}
                                onChange={(e) => form.setData('logoAlign', e.target.value)}
                                className={fieldClass}
                            >
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </select>
                            <InputError className="mt-1" message={form.errors.logoAlign} />
                        </div>
                    </div>

                    {form.data.logoMode === 'builtin' ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="logoSealLine1" value="Seal line 1" />
                                <TextInput
                                    id="logoSealLine1"
                                    value={form.data.logoSealLine1}
                                    onChange={(e) => form.setData('logoSealLine1', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                <InputError className="mt-1" message={form.errors.logoSealLine1} />
                            </div>
                            <div>
                                <InputLabel htmlFor="logoSealLine2" value="Seal line 2" />
                                <TextInput
                                    id="logoSealLine2"
                                    value={form.data.logoSealLine2}
                                    onChange={(e) => form.setData('logoSealLine2', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                <InputError className="mt-1" message={form.errors.logoSealLine2} />
                            </div>
                            <div className="sm:col-span-2">
                                <InputLabel value="Built-in style" />
                                <select
                                    value={form.data.logoBuiltinPreset}
                                    onChange={(e) => form.setData('logoBuiltinPreset', e.target.value)}
                                    className={fieldClass}
                                >
                                    <option value="official">Official (green seal, sky ring, dashed inner ring)</option>
                                    <option value="classic">Classic (gold outer ring)</option>
                                </select>
                                <InputError className="mt-1" message={form.errors.logoBuiltinPreset} />
                            </div>
                            <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
                                <label className="flex items-center gap-2 text-sm text-slate-800">
                                    <input
                                        type="checkbox"
                                        checked={form.data.logoShowBanglaTitle}
                                        onChange={(e) => form.setData('logoShowBanglaTitle', e.target.checked)}
                                        className="rounded border-slate-300 text-civic focus:ring-civic"
                                    />
                                    Show Bengali title next to seal
                                </label>
                                <label className="flex items-center gap-2 text-sm text-slate-800">
                                    <input
                                        type="checkbox"
                                        checked={form.data.logoShowEnglishTitle}
                                        onChange={(e) => form.setData('logoShowEnglishTitle', e.target.checked)}
                                        className="rounded border-slate-300 text-civic focus:ring-civic"
                                    />
                                    Show English subtitle
                                </label>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {settings.logoImageUrl ? (
                                <div className="flex flex-wrap items-end gap-4">
                                    <img
                                        src={settings.logoImageUrl}
                                        alt="Current logo"
                                        className="max-h-24 rounded-lg border border-slate-200 bg-white object-contain p-2"
                                    />
                                    <label className="flex cursor-pointer items-center gap-2 text-sm text-red-700">
                                        <input
                                            type="checkbox"
                                            checked={form.data.removeLogoImage}
                                            onChange={(e) => form.setData('removeLogoImage', e.target.checked)}
                                            className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                                        />
                                        Remove uploaded logo
                                    </label>
                                </div>
                            ) : null}
                            <div>
                                <InputLabel htmlFor="logoImage" value="Logo image file" />
                                <input
                                    id="logoImage"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => form.setData('logoImage', e.target.files?.[0] ?? null)}
                                    className="mt-1 block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-civic file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-civic-foreground hover:file:bg-civic/90"
                                />
                                <InputError className="mt-1" message={form.errors.logoImage} />
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <section>
                <h2 className="text-base font-semibold text-slate-900">Favicon</h2>
                <p className="mt-1 text-sm text-slate-500">PNG, ICO, or SVG. Linked in the main HTML head and on client navigations.</p>
                <div className="mt-4 space-y-3">
                    {settings.faviconUrl ? (
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex size-10 items-center justify-center overflow-hidden rounded border border-slate-200 bg-white">
                                <img src={settings.faviconUrl} alt="" className="max-h-10 max-w-10 object-contain" />
                            </div>
                            <label className="flex cursor-pointer items-center gap-2 text-sm text-red-700">
                                <input
                                    type="checkbox"
                                    checked={form.data.removeFavicon}
                                    onChange={(e) => form.setData('removeFavicon', e.target.checked)}
                                    className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                                />
                                Remove favicon
                            </label>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">No favicon uploaded yet.</p>
                    )}
                    <div>
                        <InputLabel htmlFor="favicon" value="Upload favicon" />
                        <input
                            id="favicon"
                            type="file"
                            accept=".png,.ico,.svg,image/png,image/x-icon,image/svg+xml"
                            onChange={(e) => form.setData('favicon', e.target.files?.[0] ?? null)}
                            className="mt-1 block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700"
                        />
                        <InputError className="mt-1" message={form.errors.favicon} />
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-base font-semibold text-slate-900">Footer</h2>
                <p className="mt-1 text-sm text-slate-500">
                    Contact block and copyright. Use <code className="rounded bg-slate-100 px-1">{`{year}`}</code> and{' '}
                    <code className="rounded bg-slate-100 px-1">{`{org}`}</code> in the copyright line — the year updates
                    automatically on the public site.
                </p>
                <div className="mt-4 grid gap-4">
                    <div>
                        <InputLabel htmlFor="footerIntroTitle" value="Intro column title" />
                        <TextInput
                            id="footerIntroTitle"
                            value={form.data.footerIntroTitle}
                            onChange={(e) => form.setData('footerIntroTitle', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        <InputError className="mt-1" message={form.errors.footerIntroTitle} />
                    </div>
                    <div>
                        <InputLabel htmlFor="footerIntroBody" value="Intro column text" />
                        <textarea
                            id="footerIntroBody"
                            value={form.data.footerIntroBody}
                            onChange={(e) => form.setData('footerIntroBody', e.target.value)}
                            rows={4}
                            className={fieldClass}
                        />
                        <InputError className="mt-1" message={form.errors.footerIntroBody} />
                    </div>
                    <div>
                        <InputLabel htmlFor="footerAddress" value="Address" />
                        <textarea
                            id="footerAddress"
                            value={form.data.footerAddress}
                            onChange={(e) => form.setData('footerAddress', e.target.value)}
                            rows={2}
                            className={fieldClass}
                        />
                        <InputError className="mt-1" message={form.errors.footerAddress} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="footerPhone" value="Phone" />
                            <TextInput
                                id="footerPhone"
                                value={form.data.footerPhone}
                                onChange={(e) => form.setData('footerPhone', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError className="mt-1" message={form.errors.footerPhone} />
                        </div>
                        <div>
                            <InputLabel htmlFor="footerEmail" value="Email" />
                            <TextInput
                                id="footerEmail"
                                type="email"
                                value={form.data.footerEmail}
                                onChange={(e) => form.setData('footerEmail', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError className="mt-1" message={form.errors.footerEmail} />
                        </div>
                    </div>
                    <div>
                        <InputLabel htmlFor="footerCreditLine" value="Footer credit line (right side)" />
                        <TextInput
                            id="footerCreditLine"
                            value={form.data.footerCreditLine}
                            onChange={(e) => form.setData('footerCreditLine', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        <InputError className="mt-1" message={form.errors.footerCreditLine} />
                    </div>
                    <div>
                        <InputLabel htmlFor="footerOrganizationShort">
                            Short organization name (for <code className="text-xs">{`{org}`}</code> in copyright)
                        </InputLabel>
                        <TextInput
                            id="footerOrganizationShort"
                            value={form.data.footerOrganizationShort}
                            onChange={(e) => form.setData('footerOrganizationShort', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        <InputError className="mt-1" message={form.errors.footerOrganizationShort} />
                    </div>
                    <div>
                        <InputLabel htmlFor="footerCopyrightTemplate" value="Copyright template" />
                        <textarea
                            id="footerCopyrightTemplate"
                            value={form.data.footerCopyrightTemplate}
                            onChange={(e) => form.setData('footerCopyrightTemplate', e.target.value)}
                            rows={2}
                            className={fieldClass}
                        />
                        <InputError className="mt-1" message={form.errors.footerCopyrightTemplate} />
                    </div>
                </div>
            </section>

            <div className="flex items-center gap-3 border-t border-slate-100 pt-6">
                <PrimaryButton type="submit" disabled={form.processing} className="inline-flex items-center gap-2">
                    <Save className="size-4" aria-hidden />
                    {form.processing ? 'Saving…' : 'Save site appearance'}
                </PrimaryButton>
            </div>
        </form>
    );
}
