import { PublicFooter } from '@/Components/Public/PublicFooter';
import { PublicNavbar } from '@/Components/Public/PublicNavbar';
import { mergePublicSite } from '@/utils/siteAppearance';
import { Head, usePage } from '@inertiajs/react';

export function PublicSiteLayout({ children, canLogin, canRegister }) {
    const site = mergePublicSite(usePage().props.site ?? {});

    return (
        <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
            <Head>
                {site?.faviconUrl ? <link rel="icon" href={site.faviconUrl} key="site-favicon" /> : null}
                <style
                    head-key="site-custom-head-css"
                    id="site-custom-head-css"
                    dangerouslySetInnerHTML={{ __html: site.customHeadCss || '' }}
                />
            </Head>
            <PublicNavbar canLogin={canLogin} canRegister={canRegister} />
            <main className="flex-1">{children}</main>
            <PublicFooter />
        </div>
    );
}
