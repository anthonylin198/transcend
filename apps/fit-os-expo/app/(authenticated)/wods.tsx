import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "@/components/ui/Text";
import { formatWodDate, wodCategoryLabels, wods } from "@/data/wods";

export default function WodsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 36,
          alignItems: "center",
        }}
      >
        <View style={{ width: "100%", maxWidth: 640 }}>
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
              WODs
            </Text>
          </View>

          {wods.length === 0 ? (
            <Text type="text-detail" color="#9CA3AF" style={{ marginTop: 8 }}>
              No workouts yet
            </Text>
          ) : (
            <View style={{ marginTop: 8 }}>
              {wods.map((wod) => (
                <Pressable
                  key={wod.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${wod.title}, ${wodCategoryLabels[wod.category]}`}
                  onPress={() =>
                    router.push({
                      pathname: "/(authenticated)/wod",
                      params: { id: wod.id },
                    })
                  }
                  style={({ pressed }) => ({
                    minHeight: 72,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    borderTopWidth: 1,
                    borderTopColor: "#1F2937",
                    paddingVertical: 14,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text type="text-semibold">{wod.title}</Text>
                    <Text type="text-detail" color="#9CA3AF">
                      {wod.date
                        ? `${formatWodDate(wod.date)} · ${wodCategoryLabels[wod.category]}`
                        : wodCategoryLabels[wod.category]}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
