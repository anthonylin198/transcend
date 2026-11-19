import { StyleProp, TextStyle } from "react-native";
import Text from "@/components/ui/Text";

export default function Eyebrow({
  children,
  color = "#737373",
  style,
}: {
  children: string;
  color?: string;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text
      type="text-detail"
      color={color}
      style={[{ fontSize: 11, letterSpacing: 2.4 }, style]}
    >
      {children}
    </Text>
  );
}
