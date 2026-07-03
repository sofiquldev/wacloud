import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { Lock } from 'lucide-react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Confirm Password" />

            <div className="mb-8">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-civic/10 text-civic">
                    <Lock className="h-5 w-5" strokeWidth={2} aria-hidden />
                </div>
                <h1 className="mt-4 font-bangla text-2xl font-semibold tracking-tight text-foreground">
                    Confirm it is you
                </h1>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    This is a secure area. Enter your password once more to
                    continue.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel
                        htmlFor="password"
                        value="Password"
                        className="text-foreground"
                    />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        variant="civic"
                        className="mt-1.5 block w-full"
                        isFocused={true}
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <PrimaryButton
                    type="submit"
                    variant="civic"
                    className="w-full"
                    disabled={processing}
                >
                    Confirm and continue
                </PrimaryButton>
            </form>
        </GuestLayout>
    );
}
