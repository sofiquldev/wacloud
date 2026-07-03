import { Link, usePage } from '@inertiajs/react';
import { User } from 'lucide-react';
import { useEffect, useState } from 'react';

function useLiveGregorianDates() {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const id = window.setInterval(() => setNow(new Date()), 60_000);
        return () => window.clearInterval(id);
    }, []);

    const bn = new Intl.DateTimeFormat('bn-BD-u-ca-gregory', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(now);

    const en = new Intl.DateTimeFormat('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(now);

    return { bn, en };
}

export function PublicTopBar({ canLogin }) {
    const user = usePage().props.auth?.user;
    const { bn: dateBn, en: dateEn } = useLiveGregorianDates();

    return (
        <div className="border-b border-border bg-secondary">
            <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-3 px-4 text-xs text-muted-foreground sm:px-6">
                <div className="flex min-w-0 items-center gap-3 truncate">
                    <span className="font-bangla truncate">{dateBn}</span>
                    <span className="hidden h-3 w-px bg-border sm:inline" />
                    <span className="hidden truncate sm:inline">{dateEn}</span>
                </div>
                <div className="flex shrink-0 items-center gap-3 sm:gap-4">
                    {user ? (
                        <Link
                            href={route('dashboard')}
                            aria-label="Admin dashboard"
                            title="Admin dashboard"
                            className="inline-flex size-7 items-center justify-center rounded-full bg-civic text-civic-foreground transition-colors hover:bg-civic/90"
                        >
                            <User className="size-3.5" />
                        </Link>
                    ) : canLogin ? (
                        <Link
                            href={route('login')}
                            aria-label="Login"
                            title="Login"
                            className="inline-flex size-7 items-center justify-center rounded-full bg-foreground text-background transition-colors hover:bg-civic"
                        >
                            <User className="size-3.5" />
                        </Link>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
