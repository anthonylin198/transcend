import Text from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FoundationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
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
        paddingTop: insets.top + 8,
        paddingBottom: insets.bottom + 20,
      }}
    >
      <View
        style={{
          minHeight: 56,
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          hitSlop={8}
          style={{ padding: 6, marginLeft: -6 }}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </Pressable>
        <Text type="heading-4" accessibilityRole="header">
          Foundations
        </Text>
      </View>

      <View style={{ gap: 16, marginTop: 8 }}>
        <Text type="heading-4">Every week</Text>
        <View style={{ gap: 14 }}>
          {weeklySteps.map((step, index) => (
            <View
              key={step}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 10,
              }}
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
    </View>
  );
}
