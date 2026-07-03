import AdminContentManager from '@/Components/Admin/AdminContentManager';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { INITIAL_PAGES } from '@/data/adminDummyData';
import { useCmsCatalog } from '@/hooks/useCmsCatalog';
import { Head, usePage } from '@inertiajs/react';

export default function Pages() {
    const { pageCategories } = useCmsCatalog();
    const { cmsPagesCatalog } = usePage().props;
    const initial =
        Array.isArray(cmsPagesCatalog) && cmsPagesCatalog.length > 0
            ? cmsPagesCatalog
            : INITIAL_PAGES;

    return (
        <AuthenticatedLayout>
            <Head title="Pages" />
            <div className="mx-auto w-full max-w-6xl space-y-6">
                <AdminContentManager
                    kind="Page"
                    initial={initial}
                    categories={pageCategories}
                />
            </div>
        </AuthenticatedLayout>
    );
}
