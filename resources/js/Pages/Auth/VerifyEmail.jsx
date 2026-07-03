import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Mail } from 'lucide-react';

const authLink =
    'text-sm font-medium text-civic underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-civic/30 focus:ring-offset-2 focus:ring-offset-surface-elevated rounded-sm';

const subtleLink =
    'text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline focus:outline-none focus:ring-2 focus:ring-civic/20 focus:ring-offset-2 focus:ring-offset-surface-elevated rounded-sm';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Email Verification" />

            <div className="mb-8">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/15 text-gold">
                    <Mail className="h-5 w-5" strokeWidth={2} aria-hidden />
                </div>
                <h1 className="mt-4 font-bangla text-2xl font-semibold tracking-tight text-foreground">
                    Verify your email
                </h1>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Thanks for registering. Please use the link in the email we
                    sent you. If it did not arrive, you can request a new one
                    below.
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <div
                    role="status"
                    className="mb-6 rounded-lg border border-civic/25 bg-civic-muted px-3 py-2.5 text-sm text-civic"
                >
                    A new verification link has been sent to the email address
                    you provided during registration.
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <PrimaryButton
                    type="submit"
                    variant="civic"
                    className="w-full"
                    disabled={processing}
                >
                    Resend verification email
                </PrimaryButton>

                <div className="text-center">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className={subtleLink}
                    >
                        Log out
                    </Link>
                </div>
            </form>

            <p className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
                Wrong inbox?{' '}
                <Link href={route('profile.edit')} className={authLink}>
                    Update email in settings
                </Link>
            </p>
        </GuestLayout>
    );
}
