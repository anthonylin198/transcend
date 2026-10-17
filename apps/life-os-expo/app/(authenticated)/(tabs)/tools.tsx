import Text from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ToolTileProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

function ToolTile({ label, icon, onPress }: ToolTileProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        aspectRatio: 1,
        backgroundColor: "#111111",
        borderWidth: 1,
        borderColor: "#3F3F46",
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: 12,
        opacity: pressed ? 0.72 : 1,
      })}
    >
      <Ionicons name={icon} size={28} color="#F9FAFB" />
      <Text type="text-semibold" style={{ textAlign: "center" }}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function ToolsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "black",
        paddingTop: insets.top + 16,
        paddingHorizontal: 20,
        paddingBottom: insets.bottom + 24,
        alignItems: "center",
      }}
    >
      <View style={{ width: "100%", maxWidth: 420 }}>
        <Text type="heading-4" accessibilityRole="header">
          Tools
        </Text>
        <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
          <ToolTile
            label="Fitness Tracker"
            icon="flame-outline"
            onPress={() => router.push("/(authenticated)/calorie-counter")}
          />
          <ToolTile
            label="Foundations"
            icon="book-outline"
            onPress={() => router.push("/(authenticated)/foundations")}
          />
        </View>
      </View>
    </View>
  );
}
