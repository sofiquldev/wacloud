import ConsoleCard from '@/Components/Console/ConsoleCard';
import ConsoleFormRow, { ConsoleTextInput } from '@/Components/Console/ConsoleFormRow';
import ConsolePageShell from '@/Components/Console/ConsolePageShell';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';

export default function Accounts({ accounts }) {
    const { data, setData, post, processing, reset } = useForm({ label: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('console.accounts.store'), { onSuccess: () => reset() });
    };

    return (
        <AuthenticatedLayout>
            <Head title="WhatsApp Accounts" />
            <ConsolePageShell
                title="WhatsApp accounts"
                description="Connect numbers via QR code. Unofficial Web sessions carry ban risk — use responsibly."
            >
                <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    <p>
                        Web sessions are unofficial. For production workloads, plan to migrate to the
                        official Meta Cloud API when available.
                    </p>
                </div>

                <ConsoleCard>
                    <ConsoleFormRow
                        onSubmit={submit}
                        processing={processing}
                        buttonLabel="Add account"
                    >
                        <ConsoleTextInput
                            placeholder="Account label (e.g. Support line)"
                            value={data.label}
                            onChange={(e) => setData('label', e.target.value)}
                            required
                        />
                    </ConsoleFormRow>
                </ConsoleCard>

                <div className="space-y-3">
                    {accounts.map((account) => (
                        <ConsoleCard key={account.id}>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="font-medium text-foreground">{account.label}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {account.phone_e164 || 'Not connected'} ·{' '}
                                        <span className="capitalize">{account.status}</span>
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href={route('console.accounts.qr', account.id)}
                                        className="rounded-lg bg-civic px-3 py-1.5 text-sm font-medium text-civic-foreground hover:bg-civic/90"
                                    >
                                        {account.status === 'connected' ? 'Status' : 'Connect QR'}
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            router.delete(route('console.accounts.destroy', account.id))
                                        }
                                        className="rounded-lg border border-border px-3 py-1.5 text-sm text-destructive hover:bg-destructive/5"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </ConsoleCard>
                    ))}
                    {accounts.length === 0 && (
                        <ConsoleCard>
                            <p className="text-center text-sm text-muted-foreground">
                                No accounts yet. Add a label above to create your first slot.
                            </p>
                        </ConsoleCard>
                    )}
                </div>
            </ConsolePageShell>
        </AuthenticatedLayout>
    );
}
