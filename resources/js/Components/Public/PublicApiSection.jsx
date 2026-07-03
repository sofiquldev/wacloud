import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    Code2,
    MessageSquare,
    Shield,
    Webhook,
    Zap,
} from 'lucide-react';

const highlights = [
    {
        icon: MessageSquare,
        title: 'Send & receive WhatsApp',
        body: 'REST endpoints for accounts, messages, and conversations — web bridge today, Meta Cloud API path tomorrow.',
    },
    {
        icon: Webhook,
        title: 'Real-time webhooks',
        body: 'HMAC-signed events for message.received, message.sent, account.connected, and more.',
    },
    {
        icon: Shield,
        title: 'Multi-tenant & secure',
        body: 'Organization-scoped API keys, rate limits, audit logs, and per-user browser data isolation.',
    },
];

const endpoints = [
    { method: 'POST', path: '/api/v1/messages', note: 'Send text to any WhatsApp number' },
    { method: 'GET', path: '/api/v1/conversations', note: 'List inbox threads' },
    { method: 'POST', path: '/api/v1/accounts', note: 'Provision a WhatsApp account slot' },
    { method: 'POST', path: '/api/v1/webhooks', note: 'Register your callback URL' },
];

export function PublicApiSection({ canLogin }) {
    return (
        <section id="api" className="border-t border-border bg-muted/30 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="mx-auto max-w-2xl text-center">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-civic/20 bg-civic/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-civic">
                        <Code2 className="size-3.5" />
                        Developer API
                    </div>
                    <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                        One HTTP API for your WhatsApp workflows
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                        Integrate WaCloud with your CRM, support desk, or custom app. Bearer-token auth,
                        JSON payloads, and stable v1 routes designed for SDKs and no-code tools.
                    </p>
                </div>

                <div className="mt-12 grid gap-6 md:grid-cols-3">
                    {highlights.map(({ icon: Icon, title, body }) => (
                        <article
                            key={title}
                            className="rounded-xl border border-border bg-surface-elevated p-6 shadow-sm"
                        >
                            <div className="mb-3 inline-flex rounded-lg bg-civic/10 p-2 text-civic">
                                <Icon className="size-5" />
                            </div>
                            <h3 className="font-semibold text-foreground">{title}</h3>
                            <p className="mt-2 text-sm text-muted-foreground">{body}</p>
                        </article>
                    ))}
                </div>

                <div className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-sm">
                    <div className="border-b border-border bg-civic px-4 py-2 font-mono text-xs text-civic-foreground">
                        curl example
                    </div>
                    <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-foreground sm:text-sm">
{`curl -X POST https://your-domain.com/api/v1/messages \\
  -H "Authorization: Bearer wc_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "account_id": 1,
    "to": "8801712345678",
    "body": "Hello from WaCloud!"
  }'`}
                    </pre>
                </div>

                <div className="mx-auto mt-8 max-w-2xl">
                    <ul className="divide-y divide-border rounded-xl border border-border bg-surface-elevated">
                        {endpoints.map((e) => (
                            <li
                                key={e.path}
                                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3 text-sm sm:px-5"
                            >
                                <span className="font-mono text-xs font-bold text-civic">{e.method}</span>
                                <span className="font-mono text-xs text-foreground">{e.path}</span>
                                <span className="w-full text-muted-foreground sm:ml-auto sm:w-auto sm:text-right">
                                    {e.note}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-10 flex flex-wrap justify-center gap-4">
                    <Link
                        href={route('pricing')}
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-elevated px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:bg-muted"
                    >
                        View pricing
                    </Link>
                    {canLogin ? (
                        <Link
                            href={route('register')}
                            className="inline-flex items-center gap-2 rounded-lg bg-civic px-5 py-2.5 text-sm font-semibold text-civic-foreground shadow-sm hover:bg-civic/90"
                        >
                            Start building
                            <ArrowRight className="size-4" />
                        </Link>
                    ) : null}
                </div>
            </div>
        </section>
    );
}

export function PublicCtaStrip() {
    return (
        <section className="border-t border-border bg-civic py-12 text-civic-foreground">
            <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-center sm:px-6">
                <Zap className="size-8 opacity-90" />
                <h2 className="text-xl font-bold sm:text-2xl">Ready to ship WhatsApp in your product?</h2>
                <p className="max-w-lg text-sm opacity-90">
                    Create an account, connect a number, and send your first API message in minutes.
                </p>
                <Link
                    href={route('pricing')}
                    className="inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-gold-foreground shadow-sm hover:opacity-95"
                >
                    See plans &amp; pricing
                    <ArrowRight className="size-4" />
                </Link>
            </div>
        </section>
    );
}
