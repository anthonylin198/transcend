import Text from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const projects = [
  "Be mentally and physically healthy",
  "Take care of family",
  "Do meaningful work",
];

export default function SystemScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "black",
        paddingHorizontal: 16,
        paddingTop: insets.top,
        paddingBottom: 12,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 40 }}>
        <View style={{ alignItems: "center", gap: 8 }}>
          <Text type="heading-4">Projects</Text>
          <View
            style={{
              height: 2,
              width: 90,
              borderRadius: 999,
              backgroundColor: "#2D2F36",
            }}
          />
        </View>
        <Text type="heading-4" color="#6B7280">
          Habits
        </Text>
      </View>

      <View
        style={{
          marginTop: 14,
          borderTopWidth: 1,
          borderTopColor: "#1F2937",
        }}
      />

      <Pressable
        style={{
          marginTop: 12,
          backgroundColor: "#18181B",
          borderRadius: 10,
          minHeight: 56,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <Ionicons name="add-circle-outline" size={20} color="#F3F4F6" />
        <Text type="text-semibold" color="#F3F4F6">
          Add Project
        </Text>
      </Pressable>

      <View style={{ marginTop: 18, gap: 18 }}>
        {projects.map((project) => (
          <View
            key={project}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text type="text-regular" color="#E5E7EB" style={{ flex: 1 }}>
              {project}
            </Text>
            <Ionicons name="reorder-three-outline" size={20} color="#9CA3AF" />
          </View>
        ))}
      </View>

      <View style={{ flex: 1 }} />

      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: "#1F2937",
          paddingTop: 14,
          paddingBottom: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text type="heading-4" color="#D1D5DB">
          Unlinked Priorities
        </Text>
        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
      </View>
    </View>
  );
}
