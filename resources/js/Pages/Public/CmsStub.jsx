import { PublicInnerPageLayout } from '@/Components/Public/PublicInnerPageLayout';
import { PublicSiteLayout } from '@/Components/Public/PublicSiteLayout';
import SeoHead from '@/Components/SeoHead';
import { Head, usePage } from '@inertiajs/react';

export default function CmsStub({
    kind,
    slug,
    title,
    contentHtml,
    layoutTemplate,
    seo,
    innerPageWidgets,
}) {
    const { canLogin } = usePage().props;

    return (
        <PublicSiteLayout canLogin={canLogin}>
            <SeoHead
                title={seo?.title}
                description={seo?.description}
                keywords={seo?.keywords}
                canonical={seo?.canonical}
            />
            <Head title={seo?.title ?? title} />
            <PublicInnerPageLayout
                kind={kind}
                slug={slug}
                title={title}
                contentHtml={contentHtml}
                layoutTemplate={layoutTemplate}
                innerPageWidgets={innerPageWidgets ?? null}
            />
        </PublicSiteLayout>
    );
}
