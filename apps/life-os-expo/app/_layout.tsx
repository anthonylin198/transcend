import { ConvexAuthProvider, useAuthToken } from "@convex-dev/auth/react";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from "@expo-google-fonts/dm-sans";
import * as SecureStore from "expo-secure-store";
import { useFonts } from "expo-font";
import { ConvexReactClient } from "@transcend/convex";
import { Stack } from "expo-router";
import { Platform, View } from "react-native";
import Text from "@/components/ui/Text";

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
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
  });

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
        <Text color="#111827">
          Missing EXPO_PUBLIC_CONVEX_URL. Add it to your env so the app can
          connect to Convex.
        </Text>
      </View>
    );
  }

  if (!fontsLoaded) {
    return null;
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
