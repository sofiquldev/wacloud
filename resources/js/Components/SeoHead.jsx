import { Head } from '@inertiajs/react';

/**
 * SEO for Inertia navigations via @inertiaHead.
 * For the first HTML response without SSR, Blade reads the same fields from
 * shared props (see resources/views/app.blade.php + HandleInertiaRequests).
 */
export default function SeoHead({ title, description, keywords, canonical }) {
    return (
        <Head>
            {title ? <title head-key="title">{title}</title> : null}
            {description ? (
                <meta
                    head-key="description"
                    name="description"
                    content={description}
                />
            ) : null}
            {keywords ? (
                <meta head-key="keywords" name="keywords" content={keywords} />
            ) : null}
            {canonical ? <link head-key="canonical" rel="canonical" href={canonical} /> : null}
        </Head>
    );
}
