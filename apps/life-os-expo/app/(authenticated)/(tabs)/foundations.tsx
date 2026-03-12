import Text from "@/components/ui/Text";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FoundationsScreen() {
  const insets = useSafeAreaInsets();
  const weeklySteps = [
    "Review intake list and clear",
    "Review your calendar for the following week",
    "Review all your projects and cleanup",
    "Review all habits + description strategy update",
    "Figure out meal plan for the following week",
  ];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "black",
        paddingHorizontal: 20,
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 20,
        gap: 16,
      }}
    >
      <Text type="heading-4">Every week</Text>
      <View style={{ gap: 14 }}>
        {weeklySteps.map((step, index) => (
          <View
            key={step}
            style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}
          >
            <Text type="text-semibold" color="#9CA3AF">
              {index + 1}.
            </Text>
            <Text type="text-regular" color="#E5E7EB" style={{ flex: 1 }}>
              {step}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
