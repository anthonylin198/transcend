import Text from "@/components/ui/Text";
import { View } from "react-native";

export default function FoundationsScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
      }}
    >
      <Text type="heading-4">
        Foundations
      </Text>
    </View>
  );
}
