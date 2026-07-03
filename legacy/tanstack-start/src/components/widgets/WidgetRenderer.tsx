import type { WidgetConfig } from "./types";
import { NavServicesWidget } from "./NavServicesWidget";
import { HotlineWidget } from "./HotlineWidget";
import { HeroWidget } from "./HeroWidget";
import { NoticeListWidget } from "./NoticeListWidget";
import { TenderListWidget } from "./TenderListWidget";
import { MemberCardWidget } from "./MemberCardWidget";
import { CareerTimelineWidget } from "./CareerTimelineWidget";
import { MembersGridWidget } from "./MembersGridWidget";
import { NewsGridWidget } from "./NewsGridWidget";
import { QuickLinksWidget } from "./QuickLinksWidget";

/**
 * WidgetRenderer — renders any widget from a JSON config.
 * Drop-in compatible with a Laravel/Inertia backend that returns
 * an array of WidgetConfig objects per page/position.
 */
export function WidgetRenderer({ widget }: { widget: WidgetConfig }) {
  const wrapperClass = widget.styling?.className ?? "";
  const wrapperStyle = widget.styling?.style;

  let content: React.ReactNode = null;
  switch (widget.type) {
    case "nav-services":
      content = <NavServicesWidget {...widget.data} />;
      break;
    case "hotline":
      content = <HotlineWidget {...widget.data} />;
      break;
    case "hero":
      content = <HeroWidget {...widget.data} />;
      break;
    case "notice-list":
      content = <NoticeListWidget {...widget.data} />;
      break;
    case "tender-list":
      content = <TenderListWidget {...widget.data} />;
      break;
    case "member-card":
      content = <MemberCardWidget {...widget.data} />;
      break;
    case "career-timeline":
      content = <CareerTimelineWidget {...widget.data} />;
      break;
    case "members-grid":
      content = <MembersGridWidget {...widget.data} />;
      break;
    case "news-grid":
      content = <NewsGridWidget {...widget.data} />;
      break;
    case "quick-links":
      content = <QuickLinksWidget {...widget.data} />;
      break;
  }

  if (!wrapperClass && !wrapperStyle) return <>{content}</>;
  return (
    <div className={wrapperClass} style={wrapperStyle}>
      {content}
    </div>
  );
}

export function WidgetZone({
  widgets,
  className = "",
}: {
  widgets: WidgetConfig[];
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-7 ${className}`}>
      {widgets.map((w, i) => (
        <WidgetRenderer key={i} widget={w} />
      ))}
    </div>
  );
}
