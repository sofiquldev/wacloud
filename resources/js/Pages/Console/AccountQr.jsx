import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AccountQr({ account, status: initialStatus, bridgeError: initialBridgeError }) {
    const [status, setStatus] = useState(initialStatus);
    const [bridgeError, setBridgeError] = useState(initialBridgeError);

    useEffect(() => {
        if (bridgeError || status?.status === 'connected') {
            return undefined;
        }

        const id = setInterval(async () => {
            const res = await fetch(route('console.accounts.qr', account.id), {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (res.status === 503) {
                const json = await res.json();
                setBridgeError(json.message ?? 'Bridge unavailable');
                clearInterval(id);
                return;
            }
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
    }, [account.id, bridgeError, status?.status]);

    return (
        <AuthenticatedLayout>
            <Head title={`Connect ${account.label}`} />
            <div className="mx-auto max-w-lg space-y-6 text-center">
                <h1 className="text-2xl font-bold text-foreground">Connect {account.label}</h1>
                <p className="text-sm text-muted-foreground">Scan with WhatsApp → Linked devices</p>

                {bridgeError ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-left text-sm text-amber-950">
                        <div className="flex gap-3">
                            <AlertTriangle className="mt-0.5 size-5 shrink-0" />
                            <div>
                                <p className="font-semibold">Bridge not available</p>
                                <p className="mt-1 leading-relaxed">{bridgeError}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-xs capitalize text-muted-foreground">Status: {status?.status}</p>
                        {status?.qr ? (
                            <img
                                src={status.qr}
                                alt="WhatsApp QR code"
                                className="mx-auto rounded-lg border border-border"
                            />
                        ) : status?.status === 'connected' ? (
                            <p className="rounded-lg bg-emerald-50 p-4 text-emerald-800">
                                Connected as {status.phone}
                            </p>
                        ) : (
                            <p className="text-sm text-muted-foreground">Generating QR code…</p>
                        )}
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
