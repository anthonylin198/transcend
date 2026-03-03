import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import * as Calendar from "expo-calendar";
import { api, useMutation, useQuery } from "@transcend/convex";
import Text from "@/components/ui/Text";
import { Platform, Pressable, View } from "react-native";

export default function ProfileScreen() {
  const { signOut } = useAuthActions();
  const [submitting, setSubmitting] = useState(false);
  const [syncingCalendar, setSyncingCalendar] = useState(false);
  const homeBootstrap = useQuery(api.home.bootstrap, {});
  const setCalendarSyncEnabled = useMutation(
    api.profile.setCalendarSyncEnabled,
  );
  const calendarEnabled = homeBootstrap?.profile?.calendarSyncEnabled ?? false;

  const toggleCalendarSync = async () => {
    if (syncingCalendar) return;
    if (Platform.OS !== "ios") {
      return;
    }

    setSyncingCalendar(true);
    try {
      if (calendarEnabled) {
        await setCalendarSyncEnabled({ enabled: false });
        return;
      }

      const permission = await Calendar.requestCalendarPermissionsAsync();
      const granted = permission.status === "granted";
      await setCalendarSyncEnabled({ enabled: granted });
    } finally {
      setSyncingCalendar(false);
    }
  };

  const onSignOut = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await signOut();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        gap: 16,
      }}
    >
      <Text type="heading-4">You</Text>
      <Text type="text-detail" color="#9CA3AF">
        {"Connect your iOS calendar so Home can show today's upcoming events."}
      </Text>
      <Pressable
        onPress={() => void toggleCalendarSync()}
        disabled={syncingCalendar || Platform.OS !== "ios"}
        style={{
          backgroundColor: "white",
          borderRadius: 10,
          paddingHorizontal: 16,
          paddingVertical: 10,
          opacity: syncingCalendar || Platform.OS !== "ios" ? 0.6 : 1,
        }}
      >
        <Text type="text-semibold" color="black">
          {calendarEnabled
            ? syncingCalendar
              ? "Disabling calendar..."
              : "Disable calendar"
            : syncingCalendar
              ? "Connecting calendar..."
              : "Connect calendar"}
        </Text>
      </Pressable>
      {calendarEnabled ? (
        <Text type="text-detail" color="#9CA3AF">
          Calendar connected.
        </Text>
      ) : (
        <Text type="text-detail" color="#9CA3AF">
          Calendar not connected.
        </Text>
      )}
      <Pressable
        onPress={() => void onSignOut()}
        disabled={submitting}
        style={{
          backgroundColor: "white",
          borderRadius: 10,
          paddingHorizontal: 16,
          paddingVertical: 10,
          opacity: submitting ? 0.6 : 1,
        }}
      >
        <Text type="text-semibold" color="black">
          {submitting ? "Signing out..." : "Sign out"}
        </Text>
      </Pressable>
    </View>
  );
}
