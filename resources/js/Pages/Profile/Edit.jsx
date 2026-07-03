import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SettingsSectionCard from '@/Components/Settings/SettingsSectionCard';
import { Head } from '@inertiajs/react';
import ConsolePageShell from '@/Components/Console/ConsolePageShell';
import DataManagementSettings from './Partials/DataManagementSettings';
import DeleteUserForm from './Partials/DeleteUserForm';
import FilesystemConfigsSettings from './Partials/FilesystemConfigsSettings';
import SettingsProfileForm from './Partials/SettingsProfileForm';

export default function Edit({ mustVerifyEmail, status, filesystemConfigs, filesystemProviders }) {
    return (
        <AuthenticatedLayout>
            <Head title="Settings" />

            <ConsolePageShell
                title="Settings"
                description="Manage your profile, per-user filesystem credentials, and browser cache."
            >
                {status && status !== 'verification-link-sent' ? (
                    <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-800">
                        {status}
                    </p>
                ) : null}

                <SettingsSectionCard>
                    <SettingsProfileForm mustVerifyEmail={mustVerifyEmail} status={status} />
                </SettingsSectionCard>

                <SettingsSectionCard>
                    <FilesystemConfigsSettings
                        filesystemConfigs={filesystemConfigs}
                        filesystemProviders={filesystemProviders}
                    />
                </SettingsSectionCard>

                <SettingsSectionCard>
                    <DataManagementSettings />
                </SettingsSectionCard>

                <SettingsSectionCard>
                    <DeleteUserForm />
                </SettingsSectionCard>
            </ConsolePageShell>
        </AuthenticatedLayout>
    );
}
