import ConsoleCard from '@/Components/Console/ConsoleCard';
import ConsolePageShell from '@/Components/Console/ConsolePageShell';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

const endpoints = [
    { method: 'POST', path: '/api/v1/accounts', desc: 'Register a WhatsApp account slot' },
    { method: 'GET', path: '/api/v1/accounts/{id}/qr', desc: 'QR pairing status' },
    { method: 'POST', path: '/api/v1/messages', desc: 'Send a text message' },
    { method: 'GET', path: '/api/v1/messages', desc: 'List messages' },
    { method: 'GET', path: '/api/v1/conversations', desc: 'List inbox threads' },
    { method: 'POST', path: '/api/v1/api-keys', desc: 'Create API key' },
    { method: 'POST', path: '/api/v1/webhooks', desc: 'Register webhook endpoint' },
];

export default function ApiDocs() {
    return (
        <AuthenticatedLayout>
            <Head title="API Docs" />
            <ConsolePageShell
                title="API documentation"
                description="Versioned REST API for sending messages, managing accounts, and receiving webhooks."
            >
                <ConsoleCard>
                    <p className="text-sm text-muted-foreground">
                        Authenticate every request with{' '}
                        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                            Authorization: Bearer YOUR_API_KEY
                        </code>
                    </p>
                </ConsoleCard>

                <ConsoleCard padding={false} className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[32rem] text-left text-sm">
                            <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Method</th>
                                    <th className="px-4 py-3 font-semibold">Path</th>
                                    <th className="px-4 py-3 font-semibold">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {endpoints.map((e) => (
                                    <tr key={e.path} className="border-t border-border">
                                        <td className="px-4 py-3 font-mono text-xs font-semibold text-civic">
                                            {e.method}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-foreground">{e.path}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{e.desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ConsoleCard>

                <p className="text-xs text-muted-foreground">
                    Webhook signature header: <code className="rounded bg-muted px-1">X-WaCloud-Signature</code>{' '}
                    (HMAC-SHA256 of body)
                </p>
            </ConsolePageShell>
        </AuthenticatedLayout>
    );
}
