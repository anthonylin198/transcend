import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import Text from "@/components/ui/Text";
import { formatCalories, formatProtein } from "@/utils/calorieWeek";

type WeekAverageValueProps = {
  calories: number;
  proteinG: number;
  pending: boolean;
};

export default function WeekAverageValue({
  calories,
  proteinG,
  pending,
}: WeekAverageValueProps) {
  if (pending) {
    return (
      <View
        accessibilityLabel="Weekly average pending"
        style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
      >
        <Ionicons name="time-outline" size={16} color="#9CA3AF" />
        <Text type="text-semibold" color="#9CA3AF">
          Pending
        </Text>
      </View>
    );
  }

  return (
    <View style={{ alignItems: "flex-end" }}>
      <Text type="text-semibold">{formatCalories(calories)} cal</Text>
      <Text type="text-detail" color="#9CA3AF">
        {formatProtein(proteinG)}g protein
      </Text>
    </View>
  );
}
