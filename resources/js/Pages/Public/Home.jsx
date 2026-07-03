import { PublicHomeContent } from '@/Components/Public/PublicHomeContent';
import { PublicSiteLayout } from '@/Components/Public/PublicSiteLayout';
import SeoHead from '@/Components/SeoHead';
import { usePage } from '@inertiajs/react';

export default function Home({ canLogin, canRegister }) {
    const { seo } = usePage().props;

    return (
        <>
            <SeoHead
                title={seo?.title}
                description={seo?.description}
                keywords={seo?.keywords}
                canonical={seo?.canonical}
            />
            <PublicSiteLayout canLogin={canLogin} canRegister={canRegister}>
                <PublicHomeContent canLogin={canLogin} canRegister={canRegister} />
            </PublicSiteLayout>
        </>
    );
}
