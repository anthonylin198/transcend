import { useEffect, useState } from "react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from "@expo-google-fonts/dm-sans";
import * as SecureStore from "expo-secure-store";
import { useFonts } from "expo-font";
import { ConvexReactClient } from "convex/react";
import { SplashScreen, Stack } from "expo-router";
import { Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Text from "@/components/ui/Text";
import { useAuthBootstrap } from "@/hooks/useAuthBootstrap";
import { useCalorieWidgetSync } from "@/widgets/useCalorieWidgetSync";

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null;
const secureStorage = {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
};

void SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore if splash is already controlled.
});

function AppRouter({ loadedFonts }: { loadedFonts: boolean }) {
  const { bootReady, isAuthenticated } = useAuthBootstrap();
  useCalorieWidgetSync(bootReady || isAuthenticated ? isAuthenticated : null);
  const [hasShownApp, setHasShownApp] = useState(false);

  useEffect(() => {
    if (bootReady && loadedFonts) {
      void SplashScreen.hideAsync().catch(() => {
        // Ignore if splash is already hidden.
      });
    }
  }, [bootReady, loadedFonts]);

  // Remember the first successful paint in state. After that, auth/profile
  // bootstrap refreshes must not unmount the app tree back to null.
  if (loadedFonts && bootReady && !hasShownApp) {
    setHasShownApp(true);
  }

  if (!loadedFonts || (!bootReady && !hasShownApp)) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "none",
        contentStyle: { backgroundColor: "black" },
      }}
    >
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ConvexAuthProvider
        client={convexClient}
        storage={
          Platform.OS === "android" || Platform.OS === "ios"
            ? secureStorage
            : undefined
        }
      >
        <AppRouter loadedFonts={fontsLoaded} />
      </ConvexAuthProvider>
    </GestureHandlerRootView>
  );
}
