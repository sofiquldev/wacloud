import { ConsoleTextInput } from '@/Components/Console/ConsoleFormRow';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { router, useForm, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    Cloud,
    HardDrive,
    Plus,
    Server,
    Star,
    TestTube2,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';

const CREDENTIAL_FIELDS = {
    s3: [
        { key: 'access_key_id', label: 'Access key ID' },
        { key: 'secret_access_key', label: 'Secret access key', type: 'password' },
    ],
    wasabi: [
        { key: 'access_key_id', label: 'Access key ID' },
        { key: 'secret_access_key', label: 'Secret access key', type: 'password' },
    ],
    google_drive: [
        { key: 'client_id', label: 'OAuth client ID' },
        { key: 'client_secret', label: 'OAuth client secret', type: 'password' },
        { key: 'refresh_token', label: 'Refresh token', type: 'password' },
    ],
    ftp: [
        { key: 'username', label: 'Username' },
        { key: 'password', label: 'Password', type: 'password' },
    ],
};

const OPTION_FIELDS = {
    s3: [
        { key: 'bucket', label: 'Bucket', required: true, span: 1 },
        { key: 'region', label: 'Region', placeholder: 'us-east-1', span: 1 },
        { key: 'endpoint', label: 'Endpoint', placeholder: 'Optional custom endpoint', span: 2 },
        { key: 'root_prefix', label: 'Root prefix', placeholder: 'wacloud/', span: 1 },
        { key: 'backup_path', label: 'Backup folder', placeholder: 'backups', span: 1 },
    ],
    wasabi: [
        { key: 'bucket', label: 'Bucket', required: true, span: 1 },
        { key: 'region', label: 'Region', placeholder: 'us-east-1', span: 1 },
        {
            key: 'endpoint',
            label: 'Endpoint',
            placeholder: 'https://s3.wasabisys.com',
            span: 2,
        },
        { key: 'root_prefix', label: 'Root prefix', placeholder: 'wacloud/', span: 1 },
        { key: 'backup_path', label: 'Backup folder', placeholder: 'backups', span: 1 },
    ],
    google_drive: [
        {
            key: 'folder_id',
            label: 'Folder ID',
            placeholder: 'Optional Drive folder for backups',
            span: 2,
        },
    ],
    ftp: [
        { key: 'host', label: 'Host', required: true, span: 1 },
        { key: 'port', label: 'Port', placeholder: '21', span: 1 },
        { key: 'root_path', label: 'Root path', placeholder: '/', span: 1 },
        { key: 'backup_path', label: 'Backup folder', placeholder: 'backups', span: 1 },
    ],
};

const PROVIDER_ICONS = {
    google_drive: Cloud,
    ftp: Server,
    default: HardDrive,
};

const STATUS_MESSAGES = {
    'filesystem-saved': 'Filesystem saved.',
    'filesystem-updated': 'Filesystem updated.',
    'filesystem-deleted': 'Filesystem removed.',
    'filesystem-default': 'Default filesystem updated.',
    'filesystem-verified': 'Connection verified successfully.',
};

function FieldLabel({ children, required }) {
    return (
        <label className="mb-1.5 block text-sm font-medium text-foreground">
            {children}
            {required ? <span className="text-destructive"> *</span> : null}
        </label>
    );
}

function FormSection({ title, description, children }) {
    return (
        <div className="rounded-lg border border-border bg-background p-4 sm:p-5">
            <div className="mb-4 border-b border-border pb-3">
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                {description ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                ) : null}
            </div>
            {children}
        </div>
    );
}

function Field({ label, required, span = 1, children }) {
    return (
        <div className={span === 2 ? 'sm:col-span-2' : ''}>
            <FieldLabel required={required}>{label}</FieldLabel>
            {children}
        </div>
    );
}

export default function FilesystemConfigsSettings({ filesystemConfigs, filesystemProviders }) {
    const { errors, status } = usePage().props;
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, reset, errors: formErrors } = useForm({
        name: '',
        provider: filesystemProviders[0]?.value ?? 's3',
        credentials: {},
        options: {},
        is_default: filesystemConfigs.length === 0,
    });

    const closeForm = () => {
        reset();
        setShowForm(false);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('profile.filesystems.store'), {
            preserveScroll: true,
            onSuccess: closeForm,
        });
    };

    const backupStatus =
        typeof status === 'string' && status.startsWith('backup-stored:')
            ? `Backup saved: ${status.replace('backup-stored:', '')}`
            : null;

    const flashStatus =
        typeof status === 'string' && STATUS_MESSAGES[status] ? STATUS_MESSAGES[status] : null;

    const credFields = CREDENTIAL_FIELDS[data.provider] ?? [];
    const optFields = OPTION_FIELDS[data.provider] ?? [];
    const providerLabel =
        filesystemProviders.find((p) => p.value === data.provider)?.label ?? data.provider;

    return (
        <div>
            <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                    <h2 className="text-lg font-semibold text-foreground">Your filesystems</h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        Connect your own Wasabi, S3, Google Drive, or FTP storage. Credentials are
                        encrypted in the database and scoped to your account — not shared across users.
                    </p>
                </div>
                {!showForm && (
                    <PrimaryButton
                        type="button"
                        variant="civic"
                        className="inline-flex shrink-0 items-center gap-2 px-4 py-2.5 text-sm normal-case tracking-normal"
                        onClick={() => setShowForm(true)}
                    >
                        <Plus className="size-4" />
                        Add filesystem
                    </PrimaryButton>
                )}
            </header>

            {(flashStatus || backupStatus || errors?.filesystem) && (
                <div
                    className={`mb-5 rounded-lg border px-4 py-3 text-sm ${
                        errors?.filesystem
                            ? 'border-destructive/30 bg-destructive/5 text-destructive'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    }`}
                >
                    {errors?.filesystem ?? backupStatus ?? flashStatus}
                </div>
            )}

            {showForm && (
                <form
                    onSubmit={submit}
                    className="mb-8 overflow-hidden rounded-xl border border-border bg-muted/20 shadow-sm"
                >
                    <div className="flex items-center justify-between border-b border-border bg-surface-elevated px-4 py-3 sm:px-5">
                        <div>
                            <p className="text-sm font-semibold text-foreground">New filesystem</p>
                            <p className="text-xs text-muted-foreground">{providerLabel}</p>
                        </div>
                        <button
                            type="button"
                            onClick={closeForm}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        >
                            <X className="size-3.5" />
                            Close
                        </button>
                    </div>

                    <div className="space-y-4 p-4 sm:p-5">
                        <FormSection title="General" description="A friendly name and storage provider.">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="Display name" required>
                                    <ConsoleTextInput
                                        placeholder="e.g. My Wasabi bucket"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                </Field>
                                <Field label="Provider" required>
                                    <select
                                        className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground shadow-sm transition focus:border-civic focus:outline-none focus:ring-2 focus:ring-civic/25"
                                        value={data.provider}
                                        onChange={(e) =>
                                            setData((prev) => ({
                                                ...prev,
                                                provider: e.target.value,
                                                credentials: {},
                                                options:
                                                    e.target.value === 'wasabi'
                                                        ? {
                                                              endpoint: 'https://s3.wasabisys.com',
                                                              use_path_style_endpoint: true,
                                                          }
                                                        : {},
                                            }))
                                        }
                                    >
                                        {filesystemProviders.map((p) => (
                                            <option key={p.value} value={p.value}>
                                                {p.label}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                            </div>
                        </FormSection>

                        <FormSection
                            title="Credentials"
                            description="Stored encrypted. Never shown again after saving."
                        >
                            <div className="grid gap-4 sm:grid-cols-2">
                                {credFields.map((field) => (
                                    <Field key={field.key} label={field.label} required>
                                        <ConsoleTextInput
                                            type={field.type ?? 'text'}
                                            autoComplete="off"
                                            value={data.credentials[field.key] ?? ''}
                                            onChange={(e) =>
                                                setData('credentials', {
                                                    ...data.credentials,
                                                    [field.key]: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </Field>
                                ))}
                            </div>
                        </FormSection>

                        {optFields.length > 0 && (
                            <FormSection
                                title="Connection options"
                                description="Bucket, host, and paths used when writing backups."
                            >
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {optFields.map((field) => (
                                        <Field
                                            key={field.key}
                                            label={field.label}
                                            required={field.required}
                                            span={field.span ?? 1}
                                        >
                                            <ConsoleTextInput
                                                placeholder={field.placeholder}
                                                value={data.options[field.key] ?? ''}
                                                onChange={(e) =>
                                                    setData('options', {
                                                        ...data.options,
                                                        [field.key]: e.target.value,
                                                    })
                                                }
                                                required={field.required}
                                            />
                                        </Field>
                                    ))}
                                </div>
                            </FormSection>
                        )}

                        {formErrors.credentials && (
                            <p className="text-sm text-destructive">{formErrors.credentials}</p>
                        )}

                        <div className="flex flex-col gap-4 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
                                <input
                                    type="checkbox"
                                    checked={data.is_default}
                                    onChange={(e) => setData('is_default', e.target.checked)}
                                    className="size-4 rounded border-border text-civic focus:ring-civic"
                                />
                                Use as default for backups
                            </label>
                            <div className="flex flex-wrap gap-2 sm:justify-end">
                                <SecondaryButton
                                    type="button"
                                    onClick={closeForm}
                                    className="border-border px-4 py-2 text-sm normal-case tracking-normal text-foreground"
                                >
                                    Cancel
                                </SecondaryButton>
                                <PrimaryButton
                                    type="submit"
                                    variant="civic"
                                    disabled={processing}
                                    className="px-5 py-2 text-sm normal-case tracking-normal"
                                >
                                    {processing ? 'Saving…' : 'Save filesystem'}
                                </PrimaryButton>
                            </div>
                        </div>
                    </div>
                </form>
            )}

            <div className="space-y-3">
                {filesystemConfigs.map((fs) => {
                    const Icon = PROVIDER_ICONS[fs.provider] ?? PROVIDER_ICONS.default;

                    return (
                        <article
                            key={fs.id}
                            className="rounded-xl border border-border bg-surface-elevated p-4 shadow-sm sm:p-5"
                        >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex min-w-0 gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-civic/10 text-civic">
                                        <Icon className="size-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-semibold text-foreground">{fs.name}</h3>
                                            {fs.is_default && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-civic/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-civic">
                                                    <Star className="size-3" />
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-0.5 text-sm text-muted-foreground">
                                            {fs.provider_label}
                                        </p>
                                        <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                            <div>
                                                <dt className="inline font-medium text-foreground/70">
                                                    Key:{' '}
                                                </dt>
                                                <dd className="inline font-mono">{fs.credentials_hint}</dd>
                                            </div>
                                            {fs.options?.bucket && (
                                                <div>
                                                    <dt className="inline font-medium text-foreground/70">
                                                        Bucket:{' '}
                                                    </dt>
                                                    <dd className="inline">{fs.options.bucket}</dd>
                                                </div>
                                            )}
                                            {fs.options?.host && (
                                                <div>
                                                    <dt className="inline font-medium text-foreground/70">
                                                        Host:{' '}
                                                    </dt>
                                                    <dd className="inline">{fs.options.host}</dd>
                                                </div>
                                            )}
                                        </dl>
                                        {(fs.last_backup_at || fs.last_verified_at) && (
                                            <div className="mt-2 flex flex-wrap gap-3 text-xs">
                                                {fs.last_verified_at && (
                                                    <span className="inline-flex items-center gap-1 text-emerald-700">
                                                        <CheckCircle2 className="size-3.5" />
                                                        Verified{' '}
                                                        {new Date(fs.last_verified_at).toLocaleDateString()}
                                                    </span>
                                                )}
                                                {fs.last_backup_at && (
                                                    <span className="text-muted-foreground">
                                                        Last backup{' '}
                                                        {new Date(fs.last_backup_at).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex shrink-0 flex-wrap gap-2 border-t border-border pt-3 sm:border-0 sm:pt-0">
                                    {!fs.is_default && (
                                        <SecondaryButton
                                            type="button"
                                            className="border-border px-3 py-1.5 text-xs normal-case tracking-normal text-foreground"
                                            onClick={() =>
                                                router.post(
                                                    route('profile.filesystems.default', fs.id),
                                                    {},
                                                    { preserveScroll: true },
                                                )
                                            }
                                        >
                                            Make default
                                        </SecondaryButton>
                                    )}
                                    <SecondaryButton
                                        type="button"
                                        className="inline-flex items-center gap-1.5 border-border px-3 py-1.5 text-xs normal-case tracking-normal text-foreground"
                                        onClick={() =>
                                            router.post(
                                                route('profile.filesystems.test', fs.id),
                                                {},
                                                { preserveScroll: true },
                                            )
                                        }
                                    >
                                        <TestTube2 className="size-3.5" />
                                        Test
                                    </SecondaryButton>
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive transition hover:bg-destructive/5"
                                        onClick={() => {
                                            if (window.confirm(`Remove "${fs.name}"?`)) {
                                                router.delete(
                                                    route('profile.filesystems.destroy', fs.id),
                                                    { preserveScroll: true },
                                                );
                                            }
                                        }}
                                    >
                                        <Trash2 className="size-3.5" />
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </article>
                    );
                })}

                {filesystemConfigs.length === 0 && !showForm && (
                    <div className="rounded-xl border border-dashed border-border bg-muted/10 px-6 py-10 text-center">
                        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                            <HardDrive className="size-6 text-muted-foreground" />
                        </div>
                        <p className="font-medium text-foreground">No filesystem connected</p>
                        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                            Add your Wasabi, S3, Google Drive, or FTP credentials to enable encrypted
                            backups.
                        </p>
                        <PrimaryButton
                            type="button"
                            variant="civic"
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm normal-case tracking-normal"
                            onClick={() => setShowForm(true)}
                        >
                            <Plus className="size-4" />
                            Add your first filesystem
                        </PrimaryButton>
                    </div>
                )}
            </div>

            {filesystemConfigs.length > 0 && (
                <div className="mt-6 rounded-xl border border-border bg-muted/20 p-4 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-foreground">Run backup</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Uploads a JSON snapshot to your default filesystem. Credentials are never
                                included in the file.
                            </p>
                        </div>
                        <PrimaryButton
                            type="button"
                            variant="civic"
                            className="inline-flex shrink-0 items-center gap-2 px-4 py-2.5 text-sm normal-case tracking-normal"
                            onClick={() =>
                                router.post(route('profile.backup'), {}, { preserveScroll: true })
                            }
                        >
                            <Cloud className="size-4" />
                            Backup now
                        </PrimaryButton>
                    </div>
                </div>
            )}
        </div>
    );
}
