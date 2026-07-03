import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { KeyRound } from 'lucide-react';

const authLink =
    'text-sm font-medium text-civic underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-civic/30 focus:ring-offset-2 focus:ring-offset-surface-elevated rounded-sm';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="mb-8">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/15 text-gold">
                    <KeyRound className="h-5 w-5" strokeWidth={2} aria-hidden />
                </div>
                <h1 className="mt-4 font-bangla text-2xl font-semibold tracking-tight text-foreground">
                    Reset your password
                </h1>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Enter the email address linked to your account. We will send
                    you a secure link to choose a new password.
                </p>
            </div>

            {status && (
                <div
                    role="status"
                    className="mb-6 rounded-lg border border-civic/25 bg-civic-muted px-3 py-2.5 text-sm text-civic"
                >
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel
                        htmlFor="email"
                        value="Email address"
                        className="text-foreground"
                    />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        variant="civic"
                        className="mt-1.5 block w-full"
                        isFocused={true}
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <PrimaryButton
                    type="submit"
                    variant="civic"
                    className="w-full"
                    disabled={processing}
                >
                    Email password reset link
                </PrimaryButton>
            </form>

            <p className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link href={route('login')} className={authLink}>
                    Back to sign in
                </Link>
            </p>
        </GuestLayout>
    );
}
