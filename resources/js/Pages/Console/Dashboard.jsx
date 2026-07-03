import ConsoleCard from '@/Components/Console/ConsoleCard';
import ConsolePageShell from '@/Components/Console/ConsolePageShell';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Inbox, MessageSquare, Smartphone, TrendingUp } from 'lucide-react';

export default function Dashboard({ stats, accounts, recentMessages }) {
    const cards = [
        { label: 'Connected accounts', value: stats.accounts_connected, icon: Smartphone },
        { label: 'Inbound messages', value: stats.messages_inbound, icon: Inbox },
        { label: 'Outbound messages', value: stats.messages_outbound, icon: MessageSquare },
        { label: 'Success rate %', value: stats.delivery_success_rate, icon: TrendingUp },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />
            <ConsolePageShell
                wide
                title="WaCloud overview"
                description="Live metrics for your WhatsApp API workspace."
            >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {cards.map(({ label, value, icon: Icon }) => (
                        <ConsoleCard key={label}>
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    {label}
                                </p>
                                <Icon className="size-4 text-civic" />
                            </div>
                            <p className="mt-3 text-3xl font-bold text-foreground">{value}</p>
                        </ConsoleCard>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <ConsoleCard>
                        <h2 className="text-sm font-semibold text-foreground">WhatsApp accounts</h2>
                        <ul className="mt-4 space-y-3">
                            {accounts.map((a) => (
                                <li key={a.id} className="flex items-center justify-between text-sm">
                                    <span className="text-foreground">{a.label}</span>
                                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground">
                                        {a.status}
                                    </span>
                                </li>
                            ))}
                            {accounts.length === 0 && (
                                <li className="text-sm text-muted-foreground">
                                    No accounts yet.{' '}
                                    <Link href={route('console.accounts.index')} className="text-civic underline">
                                        Add one
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </ConsoleCard>

                    <ConsoleCard>
                        <h2 className="text-sm font-semibold text-foreground">Recent messages</h2>
                        <ul className="mt-4 space-y-3">
                            {recentMessages.map((m) => (
                                <li key={m.id} className="text-sm text-muted-foreground">
                                    <span className="font-medium capitalize text-foreground">{m.direction}</span>
                                    {' — '}
                                    {m.body?.slice(0, 80)}
                                </li>
                            ))}
                            {recentMessages.length === 0 && (
                                <li className="text-sm text-muted-foreground">No messages yet.</li>
                            )}
                        </ul>
                    </ConsoleCard>
                </div>
            </ConsolePageShell>
        </AuthenticatedLayout>
    );
}
