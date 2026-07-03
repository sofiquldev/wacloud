import AdminContentManager from '@/Components/Admin/AdminContentManager';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { INITIAL_SERVICES } from '@/data/adminDummyData';
import { useCmsCatalog } from '@/hooks/useCmsCatalog';
import { Head, usePage } from '@inertiajs/react';

export default function Services() {
    const { serviceCategories } = useCmsCatalog();
    const { items: serverItems } = usePage().props;
    const initial =
        Array.isArray(serverItems) && serverItems.length > 0
            ? serverItems
            : INITIAL_SERVICES;

    return (
        <AuthenticatedLayout>
            <Head title="Services" />
            <div className="mx-auto w-full max-w-6xl space-y-6">
                <AdminContentManager
                    kind="Service"
                    initial={initial}
                    categories={serviceCategories}
                    referenceUploads
                />
            </div>
        </AuthenticatedLayout>
    );
}
