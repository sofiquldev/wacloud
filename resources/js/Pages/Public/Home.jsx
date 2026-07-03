import { PublicHomeContent } from '@/Components/Public/PublicHomeContent';
import { PublicSiteLayout } from '@/Components/Public/PublicSiteLayout';
import SeoHead from '@/Components/SeoHead';
import { usePage } from '@inertiajs/react';

export default function Home({ canLogin, homepageWidgets, homepageColumnLayout }) {
    const { seo } = usePage().props;
    const widgets = Array.isArray(homepageWidgets) ? homepageWidgets : [];

    return (
        <>
            <SeoHead
                title={seo?.title}
                description={seo?.description}
                keywords={seo?.keywords}
                canonical={seo?.canonical}
            />
            <PublicSiteLayout canLogin={canLogin}>
                <PublicHomeContent widgets={widgets} columnLayout={homepageColumnLayout} />
            </PublicSiteLayout>
        </>
    );
}
