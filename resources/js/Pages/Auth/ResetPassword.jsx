import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Shield } from 'lucide-react';

const authLink =
    'text-sm font-medium text-civic underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-civic/30 focus:ring-offset-2 focus:ring-offset-surface-elevated rounded-sm';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Reset Password" />

            <div className="mb-8">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-civic/10 text-civic">
                    <Shield className="h-5 w-5" strokeWidth={2} aria-hidden />
                </div>
                <h1 className="mt-4 font-bangla text-2xl font-semibold tracking-tight text-foreground">
                    Choose a new password
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Pick a strong password you have not used elsewhere for this
                    account.
                </p>
            </div>

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
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password"
                        value="New password"
                        className="text-foreground"
                    />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        variant="civic"
                        className="mt-1.5 block w-full"
                        autoComplete="new-password"
                        isFocused={true}
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm new password"
                        className="text-foreground"
                    />

                    <TextInput
                        type="password"
                        id="password_confirmation"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        variant="civic"
                        className="mt-1.5 block w-full"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <PrimaryButton
                    type="submit"
                    variant="civic"
                    className="w-full"
                    disabled={processing}
                >
                    Reset password
                </PrimaryButton>
            </form>

            <p className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
                <Link href={route('login')} className={authLink}>
                    Back to sign in
                </Link>
            </p>
        </GuestLayout>
    );
}
