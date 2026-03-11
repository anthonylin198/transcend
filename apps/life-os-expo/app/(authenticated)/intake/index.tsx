import { api } from "@transcend/convex";
import { useQuery } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "@/components/ui/Text";
import { getHomeBootstrapRange } from "@/utils/homeBootstrapRange";

export default function IntakeListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const bootstrapRange = useMemo(() => getHomeBootstrapRange(), []);
  const homeBootstrap = useQuery(api.home.bootstrap.bootstrap, bootstrapRange);
  const rows = homeBootstrap?.intakeListItems ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#1F2937",
          backgroundColor: "black",
        }}
      >
        <View
          style={{
            minHeight: 56,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text type="heading-4">Intake List</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Pressable
              onPress={() => router.push("/(authenticated)/intake/add-item")}
              style={{
                minHeight: 36,
                borderRadius: 18,
                paddingHorizontal: 14,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 6,
              }}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text type="text-semibold" color="#F9FAFB">
                New
              </Text>
            </Pressable>
            <Pressable onPress={() => router.back()} style={{ padding: 6 }}>
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom + 20, 28),
        }}
      >
        {rows.length === 0 ? (
          <View style={{ paddingHorizontal: 16, paddingTop: 18 }}>
            <Text type="text-regular" color="#9CA3AF">
              No intake items yet.
            </Text>
          </View>
        ) : (
          rows.map((item) => (
            <Pressable
              key={item._id}
              onPress={() =>
                router.push({
                  pathname: "/(authenticated)/intake/[itemId]",
                  params: {
                    itemId: item._id,
                    initialItem: JSON.stringify(item),
                  },
                })
              }
              style={{
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: "#1F2937",
                gap: item.description ? 6 : 0,
              }}
            >
              <Text
                type="text-regular"
                color={item.completed ? "#6B7280" : "#F3F4F6"}
                style={
                  item.completed
                    ? { textDecorationLine: "line-through" }
                    : undefined
                }
              >
                {item.title}
              </Text>
              {item.description ? (
                <Text type="text-detail" color="#9CA3AF">
                  {item.description}
                </Text>
              ) : null}
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}
