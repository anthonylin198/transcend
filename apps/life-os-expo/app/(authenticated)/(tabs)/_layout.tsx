import React, { useEffect, useRef } from "react";
import * as Font from "expo-font";
import * as Haptics from "expo-haptics";
import { Tabs, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { appFonts } from "@/constants/fonts";
import { Image, TouchableOpacity, View } from "react-native";

export default function TabLayout() {
  const hasMounted = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    void Font.loadAsync(Ionicons.font);
  }, []);

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
        screenOptions={{
          tabBarActiveTintColor: "white",
          tabBarInactiveTintColor: "#9CA3AF",
          tabBarLabelStyle: { fontFamily: appFonts.regular },
          headerShown: false,
          tabBarStyle: {
            borderTopWidth: 0,
            backgroundColor: "black",
            height: 72,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <Ionicons size={24} name="today" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="system"
          options={{
            title: "System",
            tabBarIcon: ({ color }) => (
              <Ionicons size={24} name="layers" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="spacer"
          options={{
            title: "",
            tabBarIcon: () => null,
            tabBarButton: () => null,
          }}
        />
        <Tabs.Screen
          name="foundations"
          options={{
            title: "Foundations",
            tabBarIcon: ({ color }) => (
              <Ionicons size={24} name="book" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "You",
            tabBarIcon: ({ color }) => (
              <Ionicons size={24} name="person" color={color} />
            ),
          }}
        />
      </Tabs>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        style={{
          position: "absolute",
          bottom: 22,
          alignSelf: "center",
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: "white",
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Image
          source={require("../../../assets/images/pencil.png")}
          style={{ width: 36, height: 36 }}
        />
      </TouchableOpacity>
    </View>
  );
}
