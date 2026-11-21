import { Ionicons } from "@expo/vector-icons";
import { api } from "@transcend/convex";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "@/components/ui/Text";
import { formatWodDate, wodCategoryLabels } from "@/data/wod";

export default function WodsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const wods = useQuery(api.wods.listWods.listWods);

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

          {wods === undefined || wods.length === 0 ? (
            <Text type="text-detail" color="#9CA3AF" style={{ marginTop: 8 }}>
              {wods === undefined ? "Loading" : "No workouts yet"}
            </Text>
          ) : (
            <View style={{ marginTop: 8 }}>
              {wods.map((wod) => (
                <Pressable
                  key={wod.slug}
                  accessibilityRole="button"
                  accessibilityLabel={`${wod.title}, ${wodCategoryLabels[wod.category]}`}
                  onPress={() =>
                    router.push({
                      pathname: "/(authenticated)/wod",
                      params: { id: wod.slug },
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
