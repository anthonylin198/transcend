import { ConvexAuthProvider, useAuthToken } from "@convex-dev/auth/react";
import * as SecureStore from "expo-secure-store";
import { ConvexReactClient } from "@transcend/convex";
import { Stack } from "expo-router";
import { Platform, Text, View } from "react-native";

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null;
const secureStorage = {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
};

function AppRouter() {
  const token = useAuthToken();
  const isAuthenticated = token !== null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(public)" />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(authenticated)" />
      </Stack.Protected>
    </Stack>
  );
}

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
    <ConvexAuthProvider
      client={convexClient}
      storage={
        Platform.OS === "android" || Platform.OS === "ios"
          ? secureStorage
          : undefined
      }
    >
      <AppRouter />
    </ConvexAuthProvider>
  );
}
