import Text from "@/components/ui/Text";
import { View } from "react-native";

export default function SystemScreen() {
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
      <Text type="heading-4">System</Text>
    </View>
  );
}
