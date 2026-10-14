import { Platform } from "react-native";
import type { DatedCalorieLog } from "@/utils/calorieWeek";
import {
  buildCalorieWidgetTimeline,
  signedOutCalorieWidgetProps,
  type CalorieWidgetProps,
} from "@/widgets/calorieWidgetData";

type CalorieWidgetApi = {
  reload(): void;
  updateSnapshot(props: CalorieWidgetProps): void;
  updateTimeline(entries: { date: Date; props: CalorieWidgetProps }[]): void;
};

let widgetApi: CalorieWidgetApi | null | undefined;
let lastPayload = "";

function getWidgetApi() {
  if (widgetApi !== undefined) return widgetApi;
  if (Platform.OS !== "ios") {
    widgetApi = null;
    return widgetApi;
  }

  try {
    widgetApi = require("./CalorieWidget").default as CalorieWidgetApi;
  } catch (error) {
    widgetApi = null;
    console.warn(
      "Calorie widget is unavailable until the iOS app is rebuilt with expo-widgets.",
      error,
    );
  }
  return widgetApi;
}

export function registerCalorieWidget() {
  getWidgetApi()?.reload();
}

export function syncCalorieWidget(logs: DatedCalorieLog[], today: Date) {
  const widget = getWidgetApi();
  if (!widget) return;

  const entries = buildCalorieWidgetTimeline(logs, today);
  const payload = JSON.stringify({
    current: entries[0]?.props,
    upcoming: entries[1]?.props,
    upcomingAt: entries[1]?.date.getTime(),
  });
  if (payload === lastPayload) return;
  lastPayload = payload;
  try {
    widget.updateTimeline(entries);
  } catch (error) {
    lastPayload = "";
    console.warn("Failed to update the calorie widget.", error);
  }
}

export function clearCalorieWidget() {
  const widget = getWidgetApi();
  if (!widget) return;
  const props = signedOutCalorieWidgetProps();
  const payload = JSON.stringify(props);
  if (payload === lastPayload) return;
  lastPayload = payload;
  try {
    widget.updateSnapshot(props);
  } catch (error) {
    lastPayload = "";
    console.warn("Failed to clear the calorie widget.", error);
  }
}
