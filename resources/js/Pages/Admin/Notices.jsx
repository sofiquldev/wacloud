import AdminContentManager from '@/Components/Admin/AdminContentManager';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { INITIAL_NOTICES } from '@/data/adminDummyData';
import { useCmsCatalog } from '@/hooks/useCmsCatalog';
import { Head, usePage } from '@inertiajs/react';

export default function Notices() {
    const { noticeCategories } = useCmsCatalog();
    const { items: serverItems } = usePage().props;
    const initial =
        Array.isArray(serverItems) && serverItems.length > 0
            ? serverItems
            : INITIAL_NOTICES;

    return (
        <AuthenticatedLayout>
            <Head title="Notices" />
            <div className="mx-auto w-full max-w-6xl space-y-6">
                <AdminContentManager
                    kind="Notice"
                    initial={initial}
                    categories={noticeCategories}
                />
            </div>
        </AuthenticatedLayout>
    );
}
