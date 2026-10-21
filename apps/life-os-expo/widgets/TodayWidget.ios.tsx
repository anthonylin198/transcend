import {
  Divider,
  Gauge,
  HStack,
  Image,
  Spacer,
  Text,
  VStack,
  ZStack,
} from "@expo/ui/swift-ui";
import {
  containerBackground,
  font,
  foregroundStyle,
  frame,
  gaugeStyle,
  lineLimit,
  minimumScaleFactor,
  monospacedDigit,
  tint,
  widgetURL,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";
import type { TodayWidgetProps } from "@/widgets/todayWidgetData";

const TodayWidget = (
  props: TodayWidgetProps,
  environment: WidgetEnvironment,
) => {
  "widget";
  const primary = "#FFFFFF";
  const secondary = "#9CA3AF";
  const dateLabel = props.dateLabel ?? "";
  const destination =
    props.url != null && props.url !== "" ? props.url : "lifeosexpo://";
  // SwiftUI's .infinity can't cross the JS bridge; any large value fills the container.
  const fillWidth = 10000;
  const rootModifiers = [
    frame({
      maxWidth: fillWidth,
      maxHeight: fillWidth,
      alignment: "topLeading",
    }),
    widgetURL(destination),
    containerBackground("#000000", "widget"),
  ];
  const prioritiesDone = props.prioritiesDone ?? 0;
  const prioritiesTotal = props.prioritiesTotal ?? 0;
  const habitsDone = props.habitsDone ?? 0;
  const habitsTotal = props.habitsTotal ?? 0;
  const isComplete = (
    done: number,
    total: number,
    completeWhenEmpty: boolean,
  ) => (completeWhenEmpty && total === 0) || (total > 0 && done >= total);
  const statusText = (
    done: number,
    total: number,
    completeWhenEmpty: boolean,
  ) => {
    if (isComplete(done, total, completeWhenEmpty)) return "All done";
    if (total === 0) return "None today";
    return `${total - done} left`;
  };
  const header = (
    <Text
      modifiers={[
        font({ textStyle: "subheadline", weight: "semibold" }),
        foregroundStyle(primary),
      ]}
    >
      Today
    </Text>
  );
  const muted = (text: string, textStyle: "caption" | "caption2") => (
    <Text
      modifiers={[
        font({ textStyle }),
        foregroundStyle(secondary),
        lineLimit(1),
        minimumScaleFactor(0.8),
      ]}
    >
      {text}
    </Text>
  );
  const fraction = (done: number, total: number, emphasis: boolean) => (
    <HStack alignment="firstTextBaseline" spacing={3}>
      <Text
        modifiers={[
          font({
            textStyle: emphasis ? "title3" : "subheadline",
            weight: "bold",
          }),
          monospacedDigit(),
          foregroundStyle(primary),
        ]}
      >
        {String(done)}
      </Text>
      <Text
        modifiers={[
          font({ textStyle: emphasis ? "subheadline" : "caption" }),
          monospacedDigit(),
          foregroundStyle(secondary),
        ]}
      >
        {`/ ${total}`}
      </Text>
    </HStack>
  );

  if (environment.widgetFamily === "systemSmall") {
    const left =
      Math.max(prioritiesTotal - prioritiesDone, 0) +
      Math.max(habitsTotal - habitsDone, 0);
    const finished = left === 0;
    const smallColumn = (
      label: string,
      done: number,
      total: number,
      completeWhenEmpty: boolean,
    ) => (
      <VStack spacing={2} modifiers={[frame({ maxWidth: fillWidth })]}>
        {muted(label, "caption2")}
        {completeWhenEmpty && total === 0 ? (
          <Image systemName="checkmark" size={16} color={primary} />
        ) : (
          fraction(done, total, false)
        )}
      </VStack>
    );
    return (
      <VStack alignment="leading" spacing={0} modifiers={rootModifiers}>
        {header}
        <Spacer />
        <VStack spacing={0} modifiers={[frame({ maxWidth: fillWidth })]}>
          {finished ? (
            <Image systemName="checkmark" size={28} color={primary} />
          ) : (
            <Text
              modifiers={[
                font({ size: 40, weight: "bold" }),
                monospacedDigit(),
                minimumScaleFactor(0.6),
                foregroundStyle(primary),
              ]}
            >
              {String(left)}
            </Text>
          )}
          {muted(finished ? "All done" : "left", "caption")}
        </VStack>
        <Spacer />
        <Divider />
        <Spacer />
        <HStack spacing={8}>
          {smallColumn("Priorities", prioritiesDone, prioritiesTotal, true)}
          <Divider />
          {smallColumn("Habits", habitsDone, habitsTotal, false)}
        </HStack>
      </VStack>
    );
  }

  const ring = (done: number, total: number, completeWhenEmpty: boolean) => {
    const complete = isComplete(done, total, completeWhenEmpty);
    const max = Math.max(total, 1);
    return (
      <ZStack>
        <Gauge
          value={complete ? max : Math.min(done, total)}
          min={0}
          max={max}
          modifiers={[gaugeStyle("circularCapacity"), tint(primary)]}
        />
        {complete ? (
          <Image systemName="checkmark" size={18} color={primary} />
        ) : (
          fraction(done, total, true)
        )}
      </ZStack>
    );
  };
  const column = (
    label: string,
    done: number,
    total: number,
    completeWhenEmpty: boolean,
  ) => (
    <VStack spacing={6} modifiers={[frame({ maxWidth: fillWidth })]}>
      {ring(done, total, completeWhenEmpty)}
      <VStack spacing={1}>
        <Text
          modifiers={[
            font({ textStyle: "subheadline", weight: "semibold" }),
            foregroundStyle(primary),
          ]}
        >
          {label}
        </Text>
        {muted(statusText(done, total, completeWhenEmpty), "caption")}
      </VStack>
    </VStack>
  );

  return (
    <VStack alignment="leading" spacing={0} modifiers={rootModifiers}>
      <HStack>
        {header}
        <Spacer />
        {muted(dateLabel, "caption")}
      </HStack>
      <Spacer />
      <HStack spacing={16}>
        {column("Priorities", prioritiesDone, prioritiesTotal, true)}
        <Divider />
        {column("Habits", habitsDone, habitsTotal, false)}
      </HStack>
      <Spacer />
    </VStack>
  );
};

const widget = createWidget("TodayWidget", TodayWidget);
widget.reload();
export default widget;
