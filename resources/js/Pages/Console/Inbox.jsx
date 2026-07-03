import ConsoleCard from '@/Components/Console/ConsoleCard';
import ConsolePageShell from '@/Components/Console/ConsolePageShell';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Inbox({ conversations }) {
    const items = conversations.data ?? conversations;

    return (
        <AuthenticatedLayout>
            <Head title="Inbox" />
            <ConsolePageShell title="Inbox" description="Conversation threads across your connected accounts.">
                <ConsoleCard padding={false}>
                    <ul className="divide-y divide-border">
                        {items.map((c) => (
                            <li key={c.id}>
                                <Link
                                    href={route('console.inbox.show', c.id)}
                                    className="block px-4 py-3.5 transition-colors hover:bg-muted/50 sm:px-5"
                                >
                                    <p className="font-medium text-foreground">
                                        {c.contact_name || c.remote_jid}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {c.whatsapp_account?.label} · {c.last_message_at}
                                    </p>
                                </Link>
                            </li>
                        ))}
                        {items.length === 0 && (
                            <li className="px-5 py-8 text-center text-sm text-muted-foreground">
                                No conversations yet.
                            </li>
                        )}
                    </ul>
                </ConsoleCard>
            </ConsolePageShell>
        </AuthenticatedLayout>
    );
}
