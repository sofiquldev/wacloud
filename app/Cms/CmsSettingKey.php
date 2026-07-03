<?php

namespace App\Cms;

/**
 * Primary keys for rows in the {@see \App\Models\CmsSetting} table.
 * Centralizes string literals so schema and application code stay aligned.
 */
final class CmsSettingKey
{
    public const NAV_MENU_DOCUMENT = 'nav_menu_document';

    public const HOMEPAGE_WIDGET_LAYOUT = 'homepage_widget_layout';

    public const CMS_PAGES_CATALOG = 'cms_pages_catalog';

    public const CMS_PAGE_BODIES = 'cms_page_bodies';

    public const CMS_CATALOG_TAXONOMIES = 'cms_catalog_taxonomies';

    /** @var list<array<string, mixed>> */
    public const CMS_NOTICES = 'cms_notices';

    /** @var list<array<string, mixed>> */
    public const CMS_SERVICES = 'cms_services';
}
