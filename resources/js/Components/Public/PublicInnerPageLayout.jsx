import { HomepageWidgetZone } from '@/Components/widgets/HomepageWidgetRenderer';
import { Link } from '@inertiajs/react';

const railSticky =
    'lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto lg:pr-1 no-scrollbar';

function SidebarRail({ widgets, side = 'right' }) {
    if (!widgets || widgets.length === 0) {
        const label = side === 'left' ? 'Left sidebar' : 'Right sidebar';
        return (
            <div className="rounded-xl border border-border/80 bg-muted/20 p-5 text-center text-xs text-muted-foreground">
                {label} — add widgets to the Inner page template to fill this rail.
            </div>
        );
    }
    return (
        <div className={railSticky}>
            <HomepageWidgetZone widgets={widgets} />
        </div>
    );
}

function ArticlePanel({ kind, title, slug, contentHtml }) {
    const kicker =
        kind === 'page' ? 'Page' : kind === 'notice' ? 'Notice' : 'Service';

    return (
        <article className="min-w-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {kicker}
            </p>
            <h1 className="font-bangla text-pretty text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                {title}
            </h1>
            {contentHtml ? (
                <div
                    className="prose prose-neutral prose-lg mt-8 max-w-none text-foreground/90 prose-headings:font-semibold prose-a:text-civic dark:prose-invert prose-img:rounded-lg"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
            ) : (
                <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                    Slug{' '}
                    <code className="rounded-md bg-muted px-2 py-0.5 font-mono text-sm text-foreground">
                        {slug}
                    </code>{' '}
                    — detailed content will appear here when added in the CMS.
                </p>
            )}

            <Link
                href="/"
                className="mt-10 inline-flex items-center gap-1.5 text-sm font-medium text-civic hover:underline"
            >
                ← Back to home
            </Link>
        </article>
    );
}

const SUPPORTED_LAYOUTS = new Set([
    'full',
    'content-left',
    'content-right',
    'three-column',
]);

function normalizeInnerLayout(raw) {
    return SUPPORTED_LAYOUTS.has(raw) ? raw : 'content-right';
}

/**
 * Inner page layout. The column structure + sidebar widgets come from the
 * admin's "Inner page" template (see /admin/templates). Falls back to a default
 * right rail (mayor card + hotline + notice strip) when no template widgets
 * are configured.
 *
 * @param {object} props
 * @param {'page'|'service'|'notice'} props.kind
 * @param {string} props.slug
 * @param {string} props.title
 * @param {string|null|undefined} props.contentHtml
 * @param {'full'|'content-left'|'content-right'|'three-column'} [props.layoutTemplate]
 * @param {{ left?: Array<object>, right?: Array<object> } | null} [props.innerPageWidgets]
 */
export function PublicInnerPageLayout({
    kind,
    slug,
    title,
    contentHtml,
    layoutTemplate,
    innerPageWidgets = null,
}) {
    const layout = normalizeInnerLayout(layoutTemplate);
    const leftWidgets = Array.isArray(innerPageWidgets?.left) ? innerPageWidgets.left : [];
    const rightWidgets = Array.isArray(innerPageWidgets?.right) ? innerPageWidgets.right : [];

    const article = (
        <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-sm md:p-8">
            <ArticlePanel kind={kind} title={title} slug={slug} contentHtml={contentHtml} />
        </div>
    );

    const shell = (inner) => (
        <div className="border-b border-border/40 bg-gradient-to-b from-muted/30 to-background">
            <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:py-14">{inner}</div>
        </div>
    );

    if (layout === 'full') {
        return shell(<div className="mx-auto max-w-4xl">{article}</div>);
    }

    if (layout === 'content-left') {
        return shell(
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
                <aside className="order-2 lg:order-1 lg:col-span-4 lg:pt-1">
                    <SidebarRail widgets={leftWidgets} side="left" />
                </aside>
                <div className="order-1 min-w-0 lg:order-2 lg:col-span-8">{article}</div>
            </div>,
        );
    }

    if (layout === 'three-column') {
        return shell(
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
                <aside className="order-2 lg:order-1 lg:col-span-3 lg:pt-1">
                    <SidebarRail widgets={leftWidgets} side="left" />
                </aside>
                <div className="order-1 min-w-0 lg:order-2 lg:col-span-6">{article}</div>
                <aside className="order-3 lg:col-span-3 lg:pt-1">
                    <SidebarRail widgets={rightWidgets} side="right" />
                </aside>
            </div>,
        );
    }

    return shell(
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="min-w-0 lg:col-span-8">{article}</div>
            <aside className="lg:col-span-4 lg:pt-1">
                <SidebarRail widgets={rightWidgets} side="right" />
            </aside>
        </div>,
    );
}
