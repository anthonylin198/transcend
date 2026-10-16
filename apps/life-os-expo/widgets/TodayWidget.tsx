import type { TodayWidgetProps } from "@/widgets/todayWidgetData";

type TodayWidgetTimelineEntry = {
  date: Date;
  props: TodayWidgetProps;
};

const TodayWidget = {
  reload() {},
  updateSnapshot(_props: TodayWidgetProps) {},
  updateTimeline(_entries: TodayWidgetTimelineEntry[]) {},
};

export default TodayWidget;
