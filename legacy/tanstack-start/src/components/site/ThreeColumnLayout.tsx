import type { WidgetConfig } from "../widgets/types";
import { WidgetZone } from "../widgets/WidgetRenderer";

type ThreeColumnLayoutProps = {
  widgets: WidgetConfig[];
};

/**
 * Splits widgets by `position` into Left / Main / Right columns.
 * The widget JSON drives placement — admin can move any widget
 * to any column without code changes.
 */
export function ThreeColumnLayout({ widgets }: ThreeColumnLayoutProps) {
  const left = widgets.filter((w) => w.position === "left");
  const main = widgets.filter((w) => w.position === "main");
  const right = widgets.filter((w) => w.position === "right");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <aside className="lg:col-span-3 order-2 lg:order-1 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-1 no-scrollbar">
          <WidgetZone widgets={left} />
        </aside>
        <section className="lg:col-span-6 order-1 lg:order-2">
          <WidgetZone widgets={main} />
        </section>
        <aside className="lg:col-span-3 order-3 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-1 no-scrollbar">
          <WidgetZone widgets={right} />
        </aside>
      </div>
    </div>
  );
}
