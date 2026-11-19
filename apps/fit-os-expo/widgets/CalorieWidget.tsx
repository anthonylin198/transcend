import type { CalorieWidgetProps } from "@/widgets/calorieWidgetData";

type CalorieWidgetTimelineEntry = {
  date: Date;
  props: CalorieWidgetProps;
};

const CalorieWidget = {
  reload() {},
  updateSnapshot(_props: CalorieWidgetProps) {},
  updateTimeline(_entries: CalorieWidgetTimelineEntry[]) {},
};

export default CalorieWidget;
