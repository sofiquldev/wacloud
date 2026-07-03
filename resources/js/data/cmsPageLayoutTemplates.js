/**
 * Page templates (mirrors config/cms_page_layouts.php).
 * Pick one of these when creating a template in /admin/templates.
 */
export const CMS_PAGE_LAYOUT_TEMPLATES = [
    {
        id: 'full',
        label: 'Full width',
        description: 'Single main column without sidebars.',
        icon: 'layout-template',
    },
    {
        id: 'content-left',
        label: 'Left sidebar + content',
        description: 'Left rail with widgets, main column on the right.',
        icon: 'panel-left',
    },
    {
        id: 'content-right',
        label: 'Content + right sidebar',
        description: 'Main column with a sticky right rail.',
        icon: 'panel-right',
    },
    {
        id: 'three-column',
        label: 'Left + content + right',
        description: 'Three-column homepage layout.',
        icon: 'columns-3',
    },
];

export const CMS_PAGE_LAYOUT_DEFAULT_ID = 'content-right';
