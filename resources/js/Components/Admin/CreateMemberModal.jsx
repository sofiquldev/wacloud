import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import {
    DEFAULT_MEMBER_PHOTO_URL,
    memberPhotoForForm,
    memberPhotoForSubmit,
} from '@/constants/defaultMemberPhoto';
import { useCmsCatalog } from '@/hooks/useCmsCatalog';
import { Link } from '@inertiajs/react';
import { Save, UserPlus, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const field =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-civic focus:outline-none focus:ring-1 focus:ring-civic';

const labelCls = 'text-sm font-semibold text-slate-900';

const MAX_PHOTO_BYTES = 2_500_000;

/**
 * Shared directory member form (add or edit).
 *
 * @param {object} props
 * @param {boolean} props.show
 * @param {object|null} [props.member] — when set, form opens in edit mode for this row (must include `id`).
 * @param {() => void} props.onClose
 * @param {(row: object) => void} props.onSave — add: fields without `id`. edit: includes `id` and updated fields.
 */
export default function CreateMemberModal({ show, member, onClose, onSave }) {
    const { designations, sessions, wards } = useCmsCatalog();
    const defaultSessionId = useMemo(
        () => sessions.find((s) => s.current)?.id ?? sessions[0]?.id ?? '',
        [sessions],
    );
    const isEdit = Boolean(member?.id);
    const [tab, setTab] = useState('details');
    const [form, setForm] = useState({
        name: '',
        designation: designations[0] ?? '',
        ward: wards[0] ?? '',
        sessionId: defaultSessionId,
        phone: '',
        email: '',
        status: 'active',
        publicMessage: '',
    });
    const [photoUrl, setPhotoUrl] = useState('');
    const [photoFile, setPhotoFile] = useState(null);
    const [photoRemoved, setPhotoRemoved] = useState(false);
    const fileRef = useRef(null);

    useEffect(() => {
        if (!show) {
            return;
        }
        setTab('details');
        if (fileRef.current) {
            fileRef.current.value = '';
        }
        if (member?.id != null) {
            setForm({
                name: member.name ?? '',
                designation: member.designation ?? designations[0] ?? '',
                ward: member.ward ?? wards[0] ?? '',
                sessionId: member.sessionId ?? defaultSessionId,
                phone: member.phone ?? '',
                email: member.email ?? '',
                status: member.status ?? 'active',
                publicMessage: member.publicMessage ?? '',
            });
            setPhotoUrl(memberPhotoForForm(member.photoUrl));
            setPhotoFile(null);
            setPhotoRemoved(false);
            return;
        }
        setPhotoUrl('');
        setPhotoFile(null);
        setPhotoRemoved(false);
        setForm({
            name: '',
            designation: designations[0] ?? '',
            ward: wards[0] ?? '',
            sessionId: defaultSessionId,
            phone: '',
            email: '',
            status: 'active',
            publicMessage: '',
        });
    }, [show, member?.id, designations, wards, defaultSessionId]);

    const onFile = (e) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith('image/')) {
            return;
        }
        if (file.size > MAX_PHOTO_BYTES) {
            window.alert('Please choose an image under 2.5 MB.');
            e.target.value = '';
            return;
        }
        setPhotoFile(file);
        setPhotoRemoved(false);
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                setPhotoUrl(reader.result);
            }
        };
        reader.readAsDataURL(file);
    };

    const clearPhoto = () => {
        setPhotoUrl('');
        setPhotoFile(null);
        setPhotoRemoved(true);
        if (fileRef.current) {
            fileRef.current.value = '';
        }
    };

    const submit = () => {
        if (!form.name.trim() || !form.designation) {
            return;
        }
        const payload = {
            name: form.name.trim(),
            designation: form.designation,
            ward: form.ward || wards[0],
            sessionId: form.sessionId,
            phone: form.phone.trim() || undefined,
            email: form.email.trim() || undefined,
            status: form.status,
            publicMessage: form.publicMessage.trim() || undefined,
        };
        const photoPayload = photoFile
            ? { photoFile }
            : photoRemoved
              ? { photoRemoved: true }
              : { photoUrl: memberPhotoForSubmit(photoUrl) };

        if (isEdit) {
            onSave({
                id: member.id,
                ...payload,
                ...photoPayload,
                party: member.party,
            });
        } else {
            onSave({ ...payload, ...photoPayload });
        }
    };

    const selectWrap = (child) => (
        <div className="relative mt-1.5">
            {child}
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                ▾
            </span>
        </div>
    );

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl" variant="default">
            <div className="flex max-h-[90vh] flex-col rounded-xl bg-white p-6 text-slate-900">
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            {isEdit ? 'Edit member' : 'Add member'}
                        </h2>
                        <p className="mt-0.5 text-sm text-slate-500">
                            {isEdit
                                ? 'Update this directory profile. Changes are saved to the server.'
                                : 'Create a new council member or officer.'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Close"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <div className="mt-4 inline-flex rounded-lg bg-slate-200/80 p-1">
                    <button
                        type="button"
                        onClick={() => setTab('details')}
                        className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                            tab === 'details'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        Details
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab('history')}
                        className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                            tab === 'history'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        History
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto py-5">
                    {tab === 'history' && (
                        <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                            Term notes, election milestones and service history
                            will appear here once this profile is saved and the
                            backend is connected.
                        </p>
                    )}

                    {tab === 'details' && (
                        <div className="space-y-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                                <div className="relative mx-auto size-28 shrink-0 overflow-hidden rounded-full border-2 border-slate-200 bg-slate-50 sm:mx-0">
                                    <img
                                        src={photoUrl || DEFAULT_MEMBER_PHOTO_URL}
                                        alt=""
                                        className="size-full object-cover"
                                    />
                                </div>
                                <div className="flex min-w-0 flex-1 flex-col gap-2">
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                        className="hidden"
                                        onChange={onFile}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            fileRef.current?.click()
                                        }
                                        className="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 sm:w-auto"
                                    >
                                        Upload photo
                                    </button>
                                    {photoUrl ? (
                                        <button
                                            type="button"
                                            onClick={clearPhoto}
                                            className="text-left text-xs font-medium text-red-600 hover:underline"
                                        >
                                            Remove photo
                                        </button>
                                    ) : null}
                                    <p className="text-xs text-slate-500">
                                        JPEG, PNG, WebP or GIF. Max ~2.5 MB.
                                        Uploaded to server storage when you save.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="cm-name" className={labelCls}>
                                    Full name{' '}
                                    <span className="text-red-600">*</span>
                                </label>
                                <input
                                    id="cm-name"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            name: e.target.value,
                                        }))
                                    }
                                    placeholder="e.g. Md. Sharif Uddin"
                                    className={`${field} mt-1.5`}
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="cm-des" className={labelCls}>
                                        Designation{' '}
                                        <span className="text-red-600">*</span>
                                    </label>
                                    {selectWrap(
                                        <select
                                            id="cm-des"
                                            value={form.designation}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    designation:
                                                        e.target.value,
                                                }))
                                            }
                                            className={`${field} appearance-none pr-9`}
                                        >
                                            {designations.map((d) => (
                                                <option key={d} value={d}>
                                                    {d}
                                                </option>
                                            ))}
                                        </select>,
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="cm-ward" className={labelCls}>
                                        Ward / Position
                                    </label>
                                    {selectWrap(
                                        <select
                                            id="cm-ward"
                                            value={form.ward}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    ward: e.target.value,
                                                }))
                                            }
                                            className={`${field} appearance-none pr-9`}
                                        >
                                            {wards.map((w) => (
                                                <option key={w} value={w}>
                                                    {w}
                                                </option>
                                            ))}
                                        </select>,
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="cm-session"
                                        className={labelCls}
                                    >
                                        Session{' '}
                                        <span className="text-red-600">*</span>
                                    </label>
                                    {selectWrap(
                                        <select
                                            id="cm-session"
                                            value={form.sessionId}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    sessionId:
                                                        e.target.value,
                                                }))
                                            }
                                            className={`${field} appearance-none pr-9`}
                                        >
                                            {sessions.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.label}
                                                    {s.current ? ' ★' : ''}
                                                </option>
                                            ))}
                                        </select>,
                                    )}
                                </div>
                                <div>
                                    <label
                                        htmlFor="cm-status"
                                        className={labelCls}
                                    >
                                        Status
                                    </label>
                                    {selectWrap(
                                        <select
                                            id="cm-status"
                                            value={form.status}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    status: e.target.value,
                                                }))
                                            }
                                            className={`${field} appearance-none pr-9`}
                                        >
                                            <option value="active">
                                                Active
                                            </option>
                                            <option value="past">Past</option>
                                        </select>,
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="cm-phone" className={labelCls}>
                                        Phone
                                    </label>
                                    <input
                                        id="cm-phone"
                                        value={form.phone}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                phone: e.target.value,
                                            }))
                                        }
                                        placeholder="+8801…"
                                        className={`${field} mt-1.5`}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="cm-email" className={labelCls}>
                                        Email
                                    </label>
                                    <input
                                        id="cm-email"
                                        type="email"
                                        value={form.email}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                email: e.target.value,
                                            }))
                                        }
                                        placeholder="name@pabna.gov.bd"
                                        className={`${field} mt-1.5`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="cm-public-msg" className={labelCls}>
                                    Public message
                                </label>
                                <p className="mb-1.5 text-xs text-slate-500">
                                    Shown in the homepage &ldquo;Message from&rdquo; dialog when the person card widget
                                    has <strong>Show messages</strong> enabled and this member matches the card.
                                </p>
                                <textarea
                                    id="cm-public-msg"
                                    rows={5}
                                    value={form.publicMessage}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            publicMessage: e.target.value,
                                        }))
                                    }
                                    placeholder="Optional letter to citizens…"
                                    className={`${field} mt-1.5 resize-y`}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="border-t border-slate-100 pt-4">
                    <p className="text-xs text-slate-500">
                        Need a new designation, ward or session? Add it in{' '}
                        <Link
                            href={route('profile.edit')}
                            className="font-semibold text-civic hover:underline"
                        >
                            Settings
                        </Link>
                        .
                    </p>
                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <PrimaryButton
                            type="button"
                            variant="civic"
                            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold normal-case tracking-normal"
                            onClick={submit}
                        >
                            {isEdit ? (
                                <Save className="size-4" aria-hidden />
                            ) : (
                                <UserPlus className="size-4" aria-hidden />
                            )}
                            {isEdit ? 'Save changes' : 'Add member'}
                        </PrimaryButton>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
