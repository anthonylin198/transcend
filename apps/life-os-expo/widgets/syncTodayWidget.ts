import { Platform } from "react-native";
import {
  buildTodayWidgetTimeline,
  signedOutTodayWidgetProps,
  type TodayWidgetData,
  type TodayWidgetProps,
} from "@/widgets/todayWidgetData";

type TodayWidgetApi = {
  reload(): void;
  updateSnapshot(props: TodayWidgetProps): void;
  updateTimeline(entries: { date: Date; props: TodayWidgetProps }[]): void;
};

let widgetApi: TodayWidgetApi | null | undefined;
let lastPayload = "";

function getWidgetApi() {
  if (widgetApi !== undefined) return widgetApi;
  if (Platform.OS !== "ios") {
    widgetApi = null;
    return widgetApi;
  }

  try {
    widgetApi = require("./TodayWidget").default as TodayWidgetApi;
  } catch (error) {
    widgetApi = null;
    console.warn(
      "Today widget is unavailable until the iOS app is rebuilt with expo-widgets.",
      error,
    );
  }
  return widgetApi;
}

export function registerTodayWidget() {
  getWidgetApi()?.reload();
}

export function syncTodayWidget(data: TodayWidgetData, today: Date) {
  const widget = getWidgetApi();
  if (!widget) return;

  const entries = buildTodayWidgetTimeline(data, today);
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
    console.warn("Failed to update the today widget.", error);
  }
}

export function clearTodayWidget() {
  const widget = getWidgetApi();
  if (!widget) return;
  const props = signedOutTodayWidgetProps();
  const payload = JSON.stringify(props);
  if (payload === lastPayload) return;
  lastPayload = payload;
  try {
    widget.updateSnapshot(props);
  } catch (error) {
    lastPayload = "";
    console.warn("Failed to clear the today widget.", error);
  }
}
