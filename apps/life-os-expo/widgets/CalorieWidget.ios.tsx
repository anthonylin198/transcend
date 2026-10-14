import {
  Divider,
  HStack,
  Label,
  Spacer,
  Text,
  VStack,
} from "@expo/ui/swift-ui";
import {
  background,
  containerBackground,
  font,
  foregroundStyle,
  frame,
  minimumScaleFactor,
  monospacedDigit,
  padding,
  shapes,
  textCase,
  widgetURL,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";
import type { CalorieWidgetProps } from "@/widgets/calorieWidgetData";

const CalorieWidget = (
  props: CalorieWidgetProps,
  environment: WidgetEnvironment,
) => {
  "widget";
  const primary = "#FFFFFF";
  const secondary = "#9CA3AF";
  const calories = props.calories ?? "—";
  const protein = props.protein ?? "—";
  const dateLabel = props.dateLabel ?? "";
  const destination =
    props.url != null && props.url !== ""
      ? props.url
      : "lifeosexpo://calorie-counter";
  // SwiftUI's .infinity can't cross the JS bridge; any large value fills the container.
  const fillWidth = 10000;
  const rootModifiers = [
    frame({
      maxWidth: fillWidth,
      maxHeight: fillWidth,
      alignment: "topLeading",
    }),
    widgetURL(destination),
    containerBackground("#1C1C1E", "widget"),
  ];
  const header = (
    <Text
      modifiers={[
        font({ textStyle: "caption", weight: "semibold" }),
        textCase("uppercase"),
        foregroundStyle(secondary),
      ]}
    >
      Calories
    </Text>
  );
  const value = (text: string) => (
    <Text
      modifiers={[
        font({ textStyle: "largeTitle", weight: "bold" }),
        monospacedDigit(),
        minimumScaleFactor(0.6),
        foregroundStyle(primary),
      ]}
    >
      {text}
    </Text>
  );
  const caption = (text: string) => (
    <Text
      modifiers={[
        font({ textStyle: "subheadline" }),
        foregroundStyle(secondary),
      ]}
    >
      {text}
    </Text>
  );

  if (environment.widgetFamily === "systemSmall") {
    return (
      <VStack alignment="leading" spacing={0} modifiers={rootModifiers}>
        {header}
        <Spacer />
        {value(calories)}
        {caption("calories")}
        <Spacer />
        <Text
          modifiers={[
            font({ textStyle: "caption" }),
            foregroundStyle(secondary),
          ]}
        >
          Today
        </Text>
      </VStack>
    );
  }

  return (
    <VStack alignment="leading" spacing={0} modifiers={rootModifiers}>
      <HStack>
        {header}
        <Spacer />
        <Text
          modifiers={[
            font({ textStyle: "caption" }),
            foregroundStyle(secondary),
          ]}
        >
          {dateLabel}
        </Text>
      </HStack>
      <Spacer />
      <HStack spacing={16}>
        <VStack
          alignment="leading"
          spacing={0}
          modifiers={[frame({ maxWidth: fillWidth, alignment: "leading" })]}
        >
          {value(calories)}
          {caption("calories")}
        </VStack>
        <Divider />
        <VStack
          alignment="leading"
          spacing={0}
          modifiers={[frame({ maxWidth: fillWidth, alignment: "leading" })]}
        >
          {value(protein)}
          {caption("protein")}
        </VStack>
      </HStack>
      <Spacer />
      <Label
        title="Log calories"
        systemImage="plus"
        modifiers={[
          font({ textStyle: "footnote", weight: "semibold" }),
          foregroundStyle("#000000"),
          padding({ vertical: 7 }),
          frame({ maxWidth: fillWidth }),
          background("#FFFFFF", shapes.roundedRectangle({ cornerRadius: 10 })),
        ]}
      />
    </VStack>
  );
};

const widget = createWidget("CalorieWidget", CalorieWidget);
widget.reload();
export default widget;
