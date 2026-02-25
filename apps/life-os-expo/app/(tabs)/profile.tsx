import { Text, View } from "react-native";

export default function ProfileScreen() {
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
      <Text style={{ color: "white", fontSize: 20, fontWeight: "600" }}>
        Profile
      </Text>
    </View>
  );
}
