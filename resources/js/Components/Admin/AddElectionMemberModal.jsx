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
import { useEffect, useRef, useState } from 'react';

const STATUSES = ['Active', 'On leave', 'Completed term'];

const field =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-civic focus:outline-none focus:ring-1 focus:ring-civic';

const labelCls = 'text-sm font-semibold text-slate-900';

function seedStatusToUi(status) {
    if (!status) {
        return STATUSES[0];
    }
    const t = String(status).toLowerCase();
    if (t === 'past') {
        return 'Completed term';
    }
    if (t === 'on_leave' || t === 'on leave') {
        return 'On leave';
    }
    return 'Active';
}

/**
 * @param {object} props
 * @param {boolean} props.show
 * @param {'assign'|'edit'} props.mode
 * @param {object|null} props.editingMember — roster row when mode is edit
 * @param {object[]} props.directoryMembers — full members directory (for edit mode lookups)
 * @param {{ designation: string; seats: number }[]} props.categories
 * @param {string} props.currentSessionId
 * @param {string} props.sessionLabel
 * @param {object[]} props.assignableDirectoryMembers — directory rows not yet on this roster (assign mode)
 * @param {() => void} props.onClose
 * @param {(row: object) => void} props.onAssign — roster fields including directoryId, name, …
 * @param {(rosterId: number, patch: object) => void} props.onUpdate
 */
export default function AddElectionMemberModal({
    show,
    mode,
    editingMember,
    categories,
    currentSessionId,
    sessionLabel,
    directoryMembers = [],
    assignableDirectoryMembers,
    onClose,
    onAssign,
    onUpdate,
}) {
    const { wards } = useCmsCatalog();
    const defaultWard = wards[0] ?? '';
    const [tab, setTab] = useState('details');
    const [pickedDirectoryId, setPickedDirectoryId] = useState('');
    const [form, setForm] = useState({
        name: '',
        designation: '',
        ward: defaultWard,
        status: STATUSES[0],
        phone: '',
        email: '',
        party: '',
    });
    const [photoUrl, setPhotoUrl] = useState('');
    const fileRef = useRef(null);

    useEffect(() => {
        if (!show) {
            return;
        }
        setTab('details');
        if (fileRef.current) {
            fileRef.current.value = '';
        }

        if (mode === 'assign') {
            const first = assignableDirectoryMembers[0];
            setPickedDirectoryId(first ? String(first.id) : '');
            if (first) {
                const des = categories.some(
                    (c) => c.designation === first.designation,
                )
                    ? first.designation
                    : (categories[0]?.designation ?? '');
                setForm({
                    name: first.name,
                    designation: des,
                    ward: first.ward,
                    phone: first.phone ?? '',
                    email: first.email ?? '',
                    status: seedStatusToUi(first.status),
                    party: '',
                });
            } else {
                setForm({
                    name: '',
                    designation: categories[0]?.designation ?? '',
                    ward: wards[0] ?? '',
                    phone: '',
                    email: '',
                    status: STATUSES[0],
                    party: '',
                });
            }
            setPhotoUrl('');
            return;
        }

        if (mode === 'edit' && editingMember) {
            setPickedDirectoryId('');
            const dir =
                editingMember.directoryId != null
                    ? directoryMembers.find(
                          (m) => m.id === editingMember.directoryId,
                      )
                    : null;
            setForm({
                name: editingMember.name,
                designation: editingMember.designation,
                ward: editingMember.ward,
                phone: editingMember.phone ?? dir?.phone ?? '',
                email: editingMember.email ?? dir?.email ?? '',
                status:
                    editingMember.status ?? seedStatusToUi(dir?.status),
                party: editingMember.party ?? '',
            });
            setPhotoUrl(memberPhotoForForm(editingMember.photoUrl));
        }
    }, [
        show,
        mode,
        editingMember,
        assignableDirectoryMembers,
        categories,
        wards,
        directoryMembers,
    ]);

    const onDirectoryPick = (idStr) => {
        setPickedDirectoryId(idStr);
        const seed = assignableDirectoryMembers.find(
            (m) => String(m.id) === idStr,
        );
        if (!seed) {
            return;
        }
        const des = categories.some(
            (c) => c.designation === seed.designation,
        )
            ? seed.designation
            : (categories[0]?.designation ?? '');
        setForm({
            name: seed.name,
            designation: des,
            ward: seed.ward,
            phone: seed.phone ?? '',
            email: seed.email ?? '',
            status: seedStatusToUi(seed.status),
            party: '',
        });
    };

    const onFile = (e) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith('image/')) {
            return;
        }
        if (file.size > 2_500_000) {
            window.alert('Please choose an image under 2.5 MB.');
            e.target.value = '';
            return;
        }
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
        if (fileRef.current) {
            fileRef.current.value = '';
        }
    };

    const submit = () => {
        if (!form.designation) {
            return;
        }
        const patch = {
            designation: form.designation,
            ward: form.ward,
            party: form.party.trim() || undefined,
            phone: form.phone.trim() || undefined,
            email: form.email.trim() || undefined,
            status: form.status,
            photoUrl: memberPhotoForSubmit(photoUrl),
        };

        if (mode === 'assign') {
            const dirId = Number(pickedDirectoryId);
            if (!dirId || !form.name.trim()) {
                return;
            }
            onAssign({
                directoryId: dirId,
                name: form.name.trim(),
                sessionId: currentSessionId,
                ...patch,
            });
            return;
        }

        if (mode === 'edit' && editingMember) {
            onUpdate(editingMember.id, patch);
        }
    };

    const isAssign = mode === 'assign';
    const heading = isAssign ? 'Add to roster' : 'Edit member';
    const sub = isAssign
        ? 'Choose someone already in the Members directory for this session. New profiles are not created here.'
        : 'Update this representative’s election details, contact info or photo.';

    const canSubmitAssign =
        categories.length > 0 &&
        assignableDirectoryMembers.length > 0 &&
        Boolean(pickedDirectoryId);

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl" variant="default">
            <div className="flex max-h-[90vh] flex-col rounded-xl bg-white p-6 text-slate-900 dark:bg-white dark:text-slate-900">
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            {heading}
                        </h2>
                        <p className="mt-0.5 text-sm text-slate-500">{sub}</p>
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
                            {isAssign
                                ? 'After someone is added to this roster, term notes and milestones can appear here once the backend is connected.'
                                : 'Term notes and election milestones for this representative will appear here once the backend is connected.'}
                        </p>
                    )}

                    {tab === 'details' && (
                        <div className="space-y-5">
                            {categories.length === 0 ? (
                                <p className="text-sm text-slate-600">
                                    Add at least one designation category before
                                    adding representatives to this election.
                                </p>
                            ) : (
                                <>
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                                        <div className="relative mx-auto size-28 shrink-0 overflow-hidden rounded-full border-2 border-slate-200 bg-slate-50 sm:mx-0">
                                            <img
                                                src={
                                                    photoUrl ||
                                                    DEFAULT_MEMBER_PHOTO_URL
                                                }
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
                                                JPEG, PNG, WebP or GIF. Max ~2.5
                                                MB. Stored in this browser until
                                                an upload API exists.
                                            </p>
                                        </div>
                                    </div>

                                    {isAssign ? (
                                        <div className="space-y-1.5">
                                            <label
                                                htmlFor="em-directory"
                                                className={labelCls}
                                            >
                                                Member from directory{' '}
                                                <span className="text-red-600">
                                                    *
                                                </span>
                                            </label>
                                            {assignableDirectoryMembers.length ===
                                            0 ? (
                                                <p className="rounded-lg border border-dashed border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
                                                    Everyone in the directory
                                                    for this session is already on
                                                    this roster, or the directory
                                                    is empty. Add people in{' '}
                                                    <Link
                                                        href={route(
                                                            'admin.members.index',
                                                        )}
                                                        className="font-semibold text-civic hover:underline"
                                                    >
                                                        Members
                                                    </Link>
                                                    .
                                                </p>
                                            ) : (
                                                <div className="relative">
                                                    <select
                                                        id="em-directory"
                                                        value={
                                                            pickedDirectoryId
                                                        }
                                                        onChange={(e) =>
                                                            onDirectoryPick(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className={`${field} appearance-none pr-9`}
                                                    >
                                                        {assignableDirectoryMembers.map(
                                                            (m) => (
                                                                <option
                                                                    key={m.id}
                                                                    value={
                                                                        m.id
                                                                    }
                                                                >
                                                                    {m.name} —{' '}
                                                                    {
                                                                        m.designation
                                                                    }
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                                                        ▾
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ) : null}

                                    <div className="space-y-1.5">
                                        <label
                                            htmlFor="em-name"
                                            className={labelCls}
                                        >
                                            Full name{' '}
                                            <span className="text-red-600">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            id="em-name"
                                            value={form.name}
                                            readOnly
                                            className={`${field} cursor-not-allowed bg-slate-50 text-slate-700`}
                                            title="Name comes from the Members directory"
                                        />
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <label
                                                htmlFor="em-des"
                                                className={labelCls}
                                            >
                                                Designation{' '}
                                                <span className="text-red-600">
                                                    *
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    id="em-des"
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
                                                    {categories.map((c) => (
                                                        <option
                                                            key={
                                                                c.designation
                                                            }
                                                            value={
                                                                c.designation
                                                            }
                                                        >
                                                            {c.designation}
                                                        </option>
                                                    ))}
                                                </select>
                                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                                                    ▾
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label
                                                htmlFor="em-ward"
                                                className={labelCls}
                                            >
                                                Ward / Position
                                            </label>
                                            <div className="relative">
                                                <select
                                                    id="em-ward"
                                                    value={form.ward}
                                                    onChange={(e) =>
                                                        setForm((f) => ({
                                                            ...f,
                                                            ward: e.target
                                                                .value,
                                                        }))
                                                    }
                                                    className={`${field} appearance-none pr-9`}
                                                >
                                                    {wards.map((w) => (
                                                        <option
                                                            key={w}
                                                            value={w}
                                                        >
                                                            {w}
                                                        </option>
                                                    ))}
                                                </select>
                                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                                                    ▾
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <label
                                                htmlFor="em-session"
                                                className={labelCls}
                                            >
                                                Session{' '}
                                                <span className="text-red-600">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                id="em-session"
                                                readOnly
                                                value={sessionLabel}
                                                className={`${field} cursor-not-allowed bg-slate-50 text-slate-700`}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label
                                                htmlFor="em-status"
                                                className={labelCls}
                                            >
                                                Status
                                            </label>
                                            <div className="relative">
                                                <select
                                                    id="em-status"
                                                    value={form.status}
                                                    onChange={(e) =>
                                                        setForm((f) => ({
                                                            ...f,
                                                            status: e.target
                                                                .value,
                                                        }))
                                                    }
                                                    className={`${field} appearance-none pr-9`}
                                                >
                                                    {STATUSES.map((s) => (
                                                        <option
                                                            key={s}
                                                            value={s}
                                                        >
                                                            {s}
                                                        </option>
                                                    ))}
                                                </select>
                                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                                                    ▾
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <label
                                                htmlFor="em-phone"
                                                className={labelCls}
                                            >
                                                Phone
                                            </label>
                                            <input
                                                id="em-phone"
                                                value={form.phone}
                                                onChange={(e) =>
                                                    setForm((f) => ({
                                                        ...f,
                                                        phone: e.target.value,
                                                    }))
                                                }
                                                placeholder="+8801…"
                                                className={field}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label
                                                htmlFor="em-email"
                                                className={labelCls}
                                            >
                                                Email
                                            </label>
                                            <input
                                                id="em-email"
                                                type="email"
                                                value={form.email}
                                                onChange={(e) =>
                                                    setForm((f) => ({
                                                        ...f,
                                                        email: e.target.value,
                                                    }))
                                                }
                                                placeholder="name@pabna.gov.bd"
                                                className={field}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label
                                            htmlFor="em-party"
                                            className={labelCls}
                                        >
                                            Party / affiliation
                                        </label>
                                        <input
                                            id="em-party"
                                            value={form.party}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    party: e.target.value,
                                                }))
                                            }
                                            placeholder="Optional"
                                            className={field}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className="border-t border-slate-100 pt-4">
                    <p className="text-xs text-slate-500">
                        New council profiles are added in{' '}
                        <Link
                            href={route('admin.members.index')}
                            className="font-semibold text-civic hover:underline"
                        >
                            Members
                        </Link>
                        . Designations and wards are configured in{' '}
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
                            disabled={
                                categories.length === 0 ||
                                (isAssign && !canSubmitAssign)
                            }
                            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold normal-case tracking-normal"
                            onClick={submit}
                        >
                            {isAssign ? (
                                <>
                                    <UserPlus className="size-4" />
                                    Add to roster
                                </>
                            ) : (
                                <>
                                    <Save className="size-4" />
                                    Save changes
                                </>
                            )}
                        </PrimaryButton>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
