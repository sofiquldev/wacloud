import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Save } from 'lucide-react';

const labelClass = 'text-sm font-medium text-foreground';

export default function SettingsProfileForm({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
        });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                setData('password', '');
                setData('password_confirmation', '');
            },
        });
    };

    return (
        <div>
            <header className="mb-8">
                <h2 className="text-lg font-semibold text-foreground">
                    My profile
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Information shown across the WaCloud console.
                </p>
            </header>

            <form onSubmit={submit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                        <InputLabel
                            htmlFor="settings_name"
                            value="Display name"
                            className={labelClass}
                        />
                        <TextInput
                            id="settings_name"
                            variant="civic"
                            className="mt-1.5 block w-full"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoComplete="name"
                        />
                        <InputError
                            className="mt-2"
                            message={errors.name}
                        />
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="settings_email"
                            value="Email"
                            className={labelClass}
                        />
                        <TextInput
                            id="settings_email"
                            type="email"
                            variant="civic"
                            className="mt-1.5 block w-full"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />
                        <InputError
                            className="mt-2"
                            message={errors.email}
                        />
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="settings_password"
                            value="Change password"
                            className={labelClass}
                        />
                        <TextInput
                            id="settings_password"
                            type="password"
                            variant="civic"
                            className="mt-1.5 block w-full"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            autoComplete="new-password"
                            placeholder="Leave blank to keep"
                        />
                        <InputError
                            className="mt-2"
                            message={errors.password}
                        />
                    </div>
                </div>

                {data.password ? (
                    <div className="max-w-md sm:col-span-2">
                        <InputLabel
                            htmlFor="settings_password_confirmation"
                            value="Confirm new password"
                            className={labelClass}
                        />
                        <TextInput
                            id="settings_password_confirmation"
                            type="password"
                            variant="civic"
                            className="mt-1.5 block w-full"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData(
                                    'password_confirmation',
                                    e.target.value,
                                )
                            }
                            autoComplete="new-password"
                        />
                        <InputError
                            className="mt-2"
                            message={errors.password_confirmation}
                        />
                    </div>
                ) : null}

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
                        <p>
                            Your email address is unverified.{' '}
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="font-medium text-civic underline-offset-2 hover:underline"
                            >
                                Resend verification email
                            </Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <p className="mt-2 font-medium text-emerald-700">
                                A new verification link has been sent.
                            </p>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-end gap-4 pt-2">
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-muted-foreground">Saved.</p>
                    </Transition>
                    <PrimaryButton
                        type="submit"
                        variant="civic"
                        disabled={processing}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold normal-case tracking-normal"
                    >
                        <Save className="size-4 shrink-0" aria-hidden />
                        Save profile
                    </PrimaryButton>
                </div>
            </form>
        </div>
    );
}
