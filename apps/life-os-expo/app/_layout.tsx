import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Stack } from "expo-router";
import { Text, View } from "react-native";

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null;

export default function RootLayout() {
  if (!convexClient) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        <Text>
          Missing EXPO_PUBLIC_CONVEX_URL. Add it to your env so the app can
          connect to Convex.
        </Text>
      </View>
    );
  }

  return (
    <ConvexProvider client={convexClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </ConvexProvider>
  );
}
