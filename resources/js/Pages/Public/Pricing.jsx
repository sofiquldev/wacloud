import { PublicSiteLayout } from '@/Components/Public/PublicSiteLayout';
import { PRICING_PLANS } from '@/data/pricingPlans';
import SeoHead from '@/Components/SeoHead';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Check } from 'lucide-react';

export default function Pricing({ canLogin, canRegister }) {
    const { seo } = usePage().props;

    return (
        <>
            <SeoHead
                title={seo?.title ?? 'Pricing — WaCloud'}
                description={seo?.description}
                canonical={seo?.canonical}
            />
            <PublicSiteLayout canLogin={canLogin} canRegister={canRegister}>
                <Head title="Pricing" />

                <section className="border-b border-border bg-gradient-to-br from-civic/5 via-background to-gold-muted/20 py-14 sm:py-20">
                    <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
                        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
                            Simple pricing for WhatsApp API
                        </h1>
                        <p className="mt-4 text-base text-muted-foreground">
                            Start free, scale as your message volume grows. All plans include the REST API,
                            dashboard, and webhook delivery.
                        </p>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                        {PRICING_PLANS.map((plan) => (
                            <article
                                key={plan.id}
                                className={`relative flex flex-col rounded-2xl border p-6 shadow-sm ${
                                    plan.highlighted
                                        ? 'border-civic bg-surface-elevated ring-2 ring-civic/20'
                                        : 'border-border bg-surface-elevated'
                                }`}
                            >
                                {plan.highlighted && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-civic px-3 py-0.5 text-xs font-semibold text-civic-foreground">
                                        Popular
                                    </span>
                                )}
                                <h2 className="text-lg font-semibold text-foreground">{plan.name}</h2>
                                <div className="mt-3">
                                    <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                                    {plan.period && (
                                        <span className="ml-1 text-sm text-muted-foreground">
                                            / {plan.period}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-3 min-h-[3rem] text-sm text-muted-foreground">
                                    {plan.description}
                                </p>
                                <ul className="mt-6 flex-1 space-y-2.5">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex gap-2 text-sm text-foreground">
                                            <Check className="mt-0.5 size-4 shrink-0 text-civic" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <PlanCta
                                    plan={plan}
                                    canLogin={canLogin}
                                    canRegister={canRegister}
                                />
                            </article>
                        ))}
                    </div>

                    <p className="mt-10 text-center text-xs text-muted-foreground">
                        Prices shown in USD. Message limits reset monthly. Unofficial Web sessions subject to
                        WhatsApp terms — Cloud API available on Scale and Enterprise.
                    </p>
                </section>
            </PublicSiteLayout>
        </>
    );
}

function PlanCta({ plan, canLogin, canRegister }) {
    const baseClass =
        'mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition';
    const primaryClass = `${baseClass} bg-civic text-civic-foreground hover:bg-civic/90`;
    const secondaryClass = `${baseClass} border border-border bg-background text-foreground hover:bg-muted`;

    if (plan.id === 'enterprise') {
        return (
            <a href="mailto:hello@wacloud.app?subject=WaCloud%20Enterprise" className={secondaryClass}>
                {plan.cta}
            </a>
        );
    }

    if (canRegister) {
        return (
            <Link
                href={route('register', { plan: plan.id })}
                className={plan.highlighted ? primaryClass : secondaryClass}
            >
                {plan.cta}
                <ArrowRight className="size-4" />
            </Link>
        );
    }

    if (canLogin) {
        return (
            <Link href={route('login')} className={plan.highlighted ? primaryClass : secondaryClass}>
                Sign in to subscribe
            </Link>
        );
    }

    return null;
}
