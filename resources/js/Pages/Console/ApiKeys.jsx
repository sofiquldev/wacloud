import ConsoleCard from '@/Components/Console/ConsoleCard';
import ConsoleFormRow, { ConsoleTextInput } from '@/Components/Console/ConsoleFormRow';
import ConsolePageShell from '@/Components/Console/ConsolePageShell';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';

export default function ApiKeys({ apiKeys, newKey }) {
    const { data, setData, post, processing, reset } = useForm({ name: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('console.api-keys.store'), { onSuccess: () => reset() });
    };

    return (
        <AuthenticatedLayout>
            <Head title="API Keys" />
            <ConsolePageShell
                title="API keys"
                description="Create bearer tokens for the WaCloud REST API. Keys are scoped to your organization."
            >
                {newKey && (
                    <ConsoleCard className="border-amber-200 bg-amber-50">
                        <p className="text-sm font-semibold text-amber-900">
                            Copy your new key now — it won&apos;t be shown again:
                        </p>
                        <code className="mt-2 block break-all rounded-md bg-white/80 px-3 py-2 font-mono text-xs text-amber-950">
                            {newKey}
                        </code>
                    </ConsoleCard>
                )}

                <ConsoleCard>
                    <ConsoleFormRow
                        onSubmit={submit}
                        processing={processing}
                        buttonLabel="Create key"
                    >
                        <ConsoleTextInput
                            placeholder="Key name (e.g. Production server)"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                    </ConsoleFormRow>
                </ConsoleCard>

                <ConsoleCard padding={false}>
                    <ul className="divide-y divide-border">
                        {apiKeys.map((key) => (
                            <li
                                key={key.id}
                                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 text-sm sm:px-5"
                            >
                                <div>
                                    <p className="font-medium text-foreground">{key.name}</p>
                                    <p className="font-mono text-xs text-muted-foreground">
                                        {key.prefix}…
                                        {key.last_used_at && (
                                            <span className="ml-2 font-sans">
                                                · last used {key.last_used_at}
                                            </span>
                                        )}
                                    </p>
                                </div>
                                {!key.revoked_at && (
                                    <button
                                        type="button"
                                        className="rounded-md border border-destructive/30 px-3 py-1.5 text-destructive hover:bg-destructive/5"
                                        onClick={() =>
                                            router.delete(route('console.api-keys.destroy', key.id))
                                        }
                                    >
                                        Revoke
                                    </button>
                                )}
                            </li>
                        ))}
                        {apiKeys.length === 0 && (
                            <li className="px-5 py-8 text-center text-sm text-muted-foreground">
                                No API keys yet. Create one to call{' '}
                                <code className="rounded bg-muted px-1">/api/v1/*</code>.
                            </li>
                        )}
                    </ul>
                </ConsoleCard>
            </ConsolePageShell>
        </AuthenticatedLayout>
    );
}
