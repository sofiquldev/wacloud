import { Link } from '@inertiajs/react';
import { ArrowRight, Cloud, LayoutDashboard, Shield } from 'lucide-react';
import { PublicApiSection, PublicCtaStrip } from '@/Components/Public/PublicApiSection';

export function PublicHomeContent({ canLogin, canRegister }) {

    return (
        <div className="bg-background">
            <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-civic/5 via-background to-gold-muted/30">
                <div
                    aria-hidden
                    className="pointer-events-none absolute -right-24 top-0 h-96 w-96 rounded-full bg-civic/10 blur-3xl"
                />
                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-civic/20 bg-civic/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-civic">
                            <Cloud className="size-3.5" />
                            WaCloud WhatsApp API
                        </div>
                        <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                            WhatsApp messaging for your product
                        </h2>
                        <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                            Connect numbers, send and receive messages, and integrate with a clean REST API
                            and webhooks — built on Laravel with a polished operator console.
                        </p>
                        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                            {canRegister ? (
                                <Link
                                    href={route('register')}
                                    className="inline-flex items-center gap-2 rounded-lg bg-civic px-6 py-3 text-sm font-semibold text-civic-foreground shadow-sm transition hover:bg-civic/90"
                                >
                                    Start free trial
                                    <ArrowRight className="size-4" />
                                </Link>
                            ) : null}
                            <Link
                                href={route('pricing')}
                                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-elevated px-6 py-3 text-sm font-semibold text-foreground shadow-sm hover:bg-muted"
                            >
                                View pricing
                            </Link>
                            {canLogin ? (
                                <Link
                                    href={route('login')}
                                    className="text-sm font-medium text-civic hover:underline"
                                >
                                    Sign in
                                </Link>
                            ) : null}
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
                <div className="grid gap-6 md:grid-cols-3">
                    {[
                        {
                            icon: Cloud,
                            title: 'Hybrid WhatsApp stack',
                            body: 'Web bridge for fast onboarding today; path to official Meta Cloud API without changing your integration.',
                        },
                        {
                            icon: LayoutDashboard,
                            title: 'Operator console',
                            body: 'Accounts, inbox, API keys, and webhooks in one dashboard — with per-user browser data controls.',
                        },
                        {
                            icon: Shield,
                            title: 'Built for developers',
                            body: 'Bearer auth, signed webhooks, rate limits, and queue-backed delivery you can trust in production.',
                        },
                    ].map(({ icon: Icon, title, body }) => (
                        <article
                            key={title}
                            className="rounded-xl border border-border bg-surface-elevated p-6 shadow-sm"
                        >
                            <div className="mb-4 inline-flex rounded-lg bg-civic/10 p-2.5 text-civic">
                                <Icon className="size-5" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                        </article>
                    ))}
                </div>
            </section>

            <PublicApiSection canLogin={canLogin} />
            <PublicCtaStrip />
        </div>
    );
}
