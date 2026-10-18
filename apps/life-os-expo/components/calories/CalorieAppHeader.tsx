import type { ReactNode } from "react";
import { View } from "react-native";
import Text from "@/components/ui/Text";

type CalorieAppHeaderProps = {
  title: string;
  right?: ReactNode;
};

export default function CalorieAppHeader({
  title,
  right,
}: CalorieAppHeaderProps) {
  return (
    <View
      style={{
        marginTop: 8,
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <Text
        type="heading-4"
        accessibilityRole="header"
        style={{ flexShrink: 1 }}
      >
        {title}
      </Text>
      {right}
    </View>
  );
}
