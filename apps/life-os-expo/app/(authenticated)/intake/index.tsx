import { api } from "@transcend/convex";
import { useMutation, useQuery } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "@/components/ui/Text";
import { getHomeBootstrapRange } from "@/utils/homeBootstrapRange";

export default function IntakeListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const bootstrapRange = useMemo(() => getHomeBootstrapRange(), []);
  const deleteIntakeListItem = useMutation(
    api.intake.deleteIntakeListItem.deleteIntakeListItem,
  ).withOptimisticUpdate((localStore, args) => {
    const bootstrap = localStore.getQuery(
      api.home.bootstrap.bootstrap,
      bootstrapRange,
    );
    if (bootstrap !== undefined && bootstrap.profile) {
      localStore.setQuery(api.home.bootstrap.bootstrap, bootstrapRange, {
        ...bootstrap,
        intakeListItems: bootstrap.intakeListItems.filter(
          (item) => item._id !== args.intakeListItemId,
        ),
      });
    }

    const list = localStore.getQuery(
      api.intake.listIntakeListItemsForCurrentUser
        .listIntakeListItemsForCurrentUser,
      {},
    );
    if (list !== undefined) {
      localStore.setQuery(
        api.intake.listIntakeListItemsForCurrentUser
          .listIntakeListItemsForCurrentUser,
        {},
        list.filter((item) => item._id !== args.intakeListItemId),
      );
    }
  });
  const homeBootstrap = useQuery(api.home.bootstrap.bootstrap, bootstrapRange);
  const rows = homeBootstrap?.intakeListItems ?? [];

  const onDeleteFromList = (intakeListItemId: string) => {
    void deleteIntakeListItem({ intakeListItemId: intakeListItemId as never });
  };

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
            <Swipeable
              key={item._id}
              renderRightActions={() => (
                <Pressable
                  onPress={() => onDeleteFromList(item._id)}
                  style={{
                    width: 82,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#EF4444",
                    borderBottomWidth: 1,
                    borderBottomColor: "#1F2937",
                  }}
                >
                  <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
                </Pressable>
              )}
              rightThreshold={28}
              overshootRight={false}
            >
              <Pressable
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
                  backgroundColor: "black",
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
            </Swipeable>
          ))
        )}
      </ScrollView>
    </View>
  );
}
