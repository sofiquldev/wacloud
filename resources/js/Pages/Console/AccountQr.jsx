import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function AccountQr({ account, status: initialStatus }) {
    const [status, setStatus] = useState(initialStatus);

    useEffect(() => {
        if (status?.status === 'connected') return undefined;
        const id = setInterval(async () => {
            const res = await fetch(route('console.accounts.qr', account.id), {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (res.ok) {
                const json = await res.json();
                setStatus(json.data);
                if (json.data?.status === 'connected') {
                    clearInterval(id);
                    router.reload({ only: ['account'] });
                }
            }
        }, 3000);
        return () => clearInterval(id);
    }, [account.id, status?.status]);

    return (
        <AuthenticatedLayout>
            <Head title={`Connect ${account.label}`} />
            <div className="mx-auto max-w-lg space-y-6 text-center">
                <h1 className="text-2xl font-bold text-slate-900">Connect {account.label}</h1>
                <p className="text-sm text-slate-500">Scan with WhatsApp → Linked devices</p>
                <p className="text-xs capitalize text-slate-600">Status: {status?.status}</p>
                {status?.qr ? (
                    <img src={status.qr} alt="WhatsApp QR code" className="mx-auto rounded-lg border border-slate-200" />
                ) : status?.status === 'connected' ? (
                    <p className="rounded-lg bg-emerald-50 p-4 text-emerald-800">Connected as {status.phone}</p>
                ) : (
                    <p className="text-sm text-slate-500">Generating QR code…</p>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
