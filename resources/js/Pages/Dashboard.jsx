import AdminPageShell from '@/Components/Admin/AdminPageShell';
import AdminSectionCard from '@/Components/Admin/AdminSectionCard';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <AdminPageShell title="Dashboard">
                <AdminSectionCard>
                    <p className="text-sm text-slate-300">
                        You are logged in. Use the sidebar to open the admin
                        console or your profile.
                    </p>
                </AdminSectionCard>
            </AdminPageShell>
        </AuthenticatedLayout>
    );
}
