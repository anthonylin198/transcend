import { useEffect, useRef } from "react";
import * as Haptics from "expo-haptics";
import { Tabs, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import DayChangeCover from "@/components/ui/DayChangeCover";
import { appFonts } from "@/constants/fonts";

export default function CalorieCounterTabLayout() {
  const hasMounted = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    if (hasMounted.current) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      hasMounted.current = true;
    }
  }, [pathname]);

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <Tabs
        // "none" lets back gestures leave the fitness tracker instead of
        // hopping between its tabs.
        backBehavior="none"
        screenOptions={{
          tabBarActiveTintColor: "white",
          tabBarInactiveTintColor: "#9CA3AF",
          tabBarLabelStyle: { fontFamily: appFonts.regular },
          headerShown: false,
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: "#1F2937",
            backgroundColor: "black",
            height: 84,
            paddingTop: 10,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Log",
            tabBarIcon: ({ color }) => (
              <Ionicons size={24} name="add-circle" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="feed"
          options={{
            title: "Feed",
            tabBarIcon: ({ color }) => (
              <Ionicons size={24} name="newspaper" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="you"
          options={{
            title: "You",
            tabBarIcon: ({ color }) => (
              <Ionicons size={24} name="person" color={color} />
            ),
          }}
        />
      </Tabs>
      <DayChangeCover />
    </View>
  );
}
