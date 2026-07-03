import { PublicHomepageColumns } from '@/Components/widgets/HomepageWidgetRenderer';
import { homepageWidgets } from '@/data/homepageWidgets';

export function PublicHomeContent({ widgets = homepageWidgets, columnLayout = 'three-column' }) {
    return <PublicHomepageColumns widgets={widgets} columnLayout={columnLayout} />;
}
