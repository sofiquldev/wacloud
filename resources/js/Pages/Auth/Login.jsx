import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { LogIn } from 'lucide-react';

const authLink =
    'text-sm font-medium text-civic underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-civic/30 focus:ring-offset-2 focus:ring-offset-surface-elevated rounded-sm';

export default function Login({ status, canResetPassword, canRegister }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="mb-8">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-civic/10 text-civic">
                    <LogIn className="h-5 w-5" strokeWidth={2} aria-hidden />
                </div>
                <h1 className="mt-4 font-bangla text-2xl font-semibold tracking-tight text-foreground">
                    Sign in
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Enter your work email and password to access the dashboard.
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
                        value="Email"
                        className="text-foreground"
                    />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        variant="civic"
                        className="mt-1.5 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <div className="flex items-center justify-between gap-2">
                        <InputLabel
                            htmlFor="password"
                            value="Password"
                            className="text-foreground"
                        />
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className={authLink}
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        variant="civic"
                        className="mt-1.5 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <label className="flex cursor-pointer items-center gap-2">
                    <Checkbox
                        name="remember"
                        checked={data.remember}
                        onChange={(e) =>
                            setData('remember', e.target.checked)
                        }
                        className="rounded border-border text-civic focus:ring-civic/35 dark:border-border dark:bg-background"
                    />
                    <span className="text-sm text-muted-foreground">
                        Remember this device
                    </span>
                </label>

                <PrimaryButton
                    type="submit"
                    variant="civic"
                    className="w-full"
                    disabled={processing}
                >
                    Log in
                </PrimaryButton>
            </form>

            {canRegister && (
                <p className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
                    Need an account?{' '}
                    <Link href={route('register')} className={authLink}>
                        Create one
                    </Link>
                </p>
            )}
        </GuestLayout>
    );
}
