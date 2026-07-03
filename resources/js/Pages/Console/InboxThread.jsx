import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function InboxThread({ conversation, messages }) {
    const { data, setData, post, processing, reset } = useForm({ body: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('console.inbox.reply', conversation.id), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={conversation.contact_name || conversation.remote_jid} />
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">
                        {conversation.contact_name || conversation.remote_jid}
                    </h1>
                    <p className="text-xs text-slate-500">{conversation.whatsapp_account?.label}</p>
                </div>

                <div className="min-h-[320px] space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    {messages.map((m) => (
                        <div
                            key={m.id}
                            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                                m.direction === 'outbound'
                                    ? 'ml-auto bg-civic text-civic-foreground'
                                    : 'bg-slate-100 text-slate-900'
                            }`}
                        >
                            {m.body}
                        </div>
                    ))}
                </div>

                <form onSubmit={submit} className="flex gap-2">
                    <TextInput
                        className="flex-1"
                        value={data.body}
                        onChange={(e) => setData('body', e.target.value)}
                        placeholder="Type a reply…"
                    />
                    <PrimaryButton disabled={processing} variant="civic">
                        Send
                    </PrimaryButton>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
