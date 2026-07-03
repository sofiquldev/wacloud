import { Columns3, LayoutTemplate, PanelLeft, PanelRight } from 'lucide-react';

const MAP = {
    'layout-template': LayoutTemplate,
    'panel-right': PanelRight,
    'panel-left': PanelLeft,
    'columns-3': Columns3,
};

/**
 * @param {object} props
 * @param {string} props.icon — key from CMS_PAGE_LAYOUT_TEMPLATES
 * @param {string} [props.className]
 */
export function CmsPageLayoutTemplateIcon({ icon, className = 'size-5' }) {
    const Cmp = MAP[icon] ?? LayoutTemplate;

    return <Cmp className={className} aria-hidden />;
}
