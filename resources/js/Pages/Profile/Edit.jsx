import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CatalogTaxonomyEditor from '@/Pages/Profile/Partials/CatalogTaxonomyEditor';
import { useCmsCatalog } from '@/hooks/useCmsCatalog';
import { Head, router } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import DeleteUserForm from './Partials/DeleteUserForm';
import SettingsProfileForm from './Partials/SettingsProfileForm';
import SiteBrandingForm from './Partials/SiteBrandingForm';
import SiteCustomCodeForm from './Partials/SiteCustomCodeForm';

const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'site', label: 'Site & branding' },
    { id: 'designations', label: 'Designations' },
    { id: 'wards', label: 'Wards' },
    { id: 'customCode', label: 'Custom code' },
    { id: 'general', label: 'General' },
];

export default function Edit({ mustVerifyEmail, status, siteSettings }) {
    const [tab, setTab] = useState('profile');
    const catalog = useCmsCatalog();
    const [designationRows, setDesignationRows] = useState(() => [...catalog.designations]);
    const [wardRows, setWardRows] = useState(() => [...catalog.wards]);
    const [savingTaxonomies, setSavingTaxonomies] = useState(false);

    useEffect(() => {
        setDesignationRows([...catalog.designations]);
        setWardRows([...catalog.wards]);
    }, [catalog]);

    const saveTaxonomies = useCallback(() => {
        setSavingTaxonomies(true);
        router.patch(
            route('profile.catalog-taxonomies.update'),
            {
                designations: designationRows,
                wards: wardRows,
            },
            {
                preserveScroll: true,
                onFinish: () => setSavingTaxonomies(false),
            },
        );
    }, [designationRows, wardRows]);

    return (
        <AuthenticatedLayout>
            <Head title="Settings" />

            <div className="mx-auto w-full max-w-5xl space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
                    <p className="mt-1 max-w-2xl text-sm text-slate-500">
                        Manage taxonomies that power members, elections and the public site.
                    </p>
                </div>

                {status && status !== 'verification-link-sent' ? (
                    <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                        {status}
                    </p>
                ) : null}

                <div className="inline-flex rounded-lg bg-slate-200/90 p-1 shadow-inner">
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setTab(t.id)}
                            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-civic focus-visible:ring-offset-2 ${
                                tab === t.id
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
                    {tab === 'profile' && (
                        <SettingsProfileForm mustVerifyEmail={mustVerifyEmail} status={status} />
                    )}
                    {tab === 'site' ? (
                        siteSettings ? (
                            <SiteBrandingForm settings={siteSettings} />
                        ) : (
                            <p className="text-sm text-red-600">Site settings could not be loaded.</p>
                        )
                    ) : null}
                    {tab === 'designations' && (
                        <CatalogTaxonomyEditor
                            field="designations"
                            rows={designationRows}
                            onRowsChange={setDesignationRows}
                            title="Designations"
                            description="Official titles and roles used when adding members and election rosters (Mayor, Councilor, CEO, etc.)."
                            onSave={saveTaxonomies}
                            saving={savingTaxonomies}
                        />
                    )}
                    {tab === 'wards' && (
                        <CatalogTaxonomyEditor
                            field="wards"
                            rows={wardRows}
                            onRowsChange={setWardRows}
                            title="Wards"
                            description="Ward names and reserved groupings shown on member profiles and citizen-facing filters."
                            onSave={saveTaxonomies}
                            saving={savingTaxonomies}
                        />
                    )}
                    {tab === 'customCode' ? (
                        siteSettings ? (
                            <SiteCustomCodeForm settings={siteSettings} />
                        ) : (
                            <p className="text-sm text-red-600">Site settings could not be loaded.</p>
                        )
                    ) : null}
                    {tab === 'general' && (
                        <div className="space-y-10">
                            <p className="text-sm text-slate-500">
                                Additional site-wide preferences will be available here.
                            </p>
                            <DeleteUserForm />
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
