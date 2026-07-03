import ConsoleCard from '@/Components/Console/ConsoleCard';
import ConsoleFormRow, { ConsoleTextInput } from '@/Components/Console/ConsoleFormRow';
import ConsolePageShell from '@/Components/Console/ConsolePageShell';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';

export default function Webhooks({ webhooks, availableEvents }) {
    const { data, setData, post, processing, reset } = useForm({
        url: '',
        events: availableEvents,
        enabled: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('console.webhooks.store'), { onSuccess: () => reset('url') });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Webhooks" />
            <ConsolePageShell
                title="Webhooks"
                description="Receive signed HTTP callbacks when messages arrive, send, or accounts change status."
            >
                <ConsoleCard>
                    <p className="mb-3 text-xs text-muted-foreground">
                        Events: {availableEvents?.join(', ')}. Signature header:{' '}
                        <code className="rounded bg-muted px-1">X-WaCloud-Signature</code>
                    </p>
                    <ConsoleFormRow
                        onSubmit={submit}
                        processing={processing}
                        buttonLabel="Add endpoint"
                    >
                        <ConsoleTextInput
                            type="url"
                            placeholder="https://your-app.com/webhooks/wacloud"
                            value={data.url}
                            onChange={(e) => setData('url', e.target.value)}
                            required
                        />
                    </ConsoleFormRow>
                </ConsoleCard>

                <ConsoleCard padding={false}>
                    <ul className="divide-y divide-border">
                        {webhooks.map((w) => (
                            <li
                                key={w.id}
                                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 text-sm sm:px-5"
                            >
                                <div className="min-w-0">
                                    <p className="break-all font-medium text-foreground">{w.url}</p>
                                    <p className="font-mono text-xs text-muted-foreground">
                                        secret {w.secret?.slice(0, 8)}…
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="rounded-md border border-destructive/30 px-3 py-1.5 text-destructive hover:bg-destructive/5"
                                    onClick={() => router.delete(route('console.webhooks.destroy', w.id))}
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                        {webhooks.length === 0 && (
                            <li className="px-5 py-8 text-center text-sm text-muted-foreground">
                                No webhook endpoints registered.
                            </li>
                        )}
                    </ul>
                </ConsoleCard>
            </ConsolePageShell>
        </AuthenticatedLayout>
    );
}
