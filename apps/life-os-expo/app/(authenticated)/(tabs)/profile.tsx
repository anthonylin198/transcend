import { useMemo, useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { requestCalendarPermissions } from "expo-calendar";
import { api } from "@transcend/convex";
import { useMutation, useQuery } from "convex/react";
import Text from "@/components/ui/Text";
import { getHomeBootstrapRange } from "@/utils/homeBootstrapRange";
import { Alert, Platform, Pressable, View } from "react-native";

export default function ProfileScreen() {
  const { signOut } = useAuthActions();
  const [submitting, setSubmitting] = useState(false);
  const [syncingCalendar, setSyncingCalendar] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const bootstrapRange = useMemo(() => getHomeBootstrapRange(), []);
  const homeBootstrap = useQuery(api.home.bootstrap.bootstrap, bootstrapRange);
  const setCalendarSyncEnabled = useMutation(
    api.profile.setCalendarSyncEnabled,
  );
  const calendarEnabled = homeBootstrap?.profile?.calendarSyncEnabled ?? false;

  const toggleCalendarSync = async () => {
    if (syncingCalendar) return;
    if (Platform.OS !== "ios") {
      const message =
        "Calendar sync is only available on iOS. This device cannot connect calendar.";
      setCalendarError(message);
      Alert.alert("Calendar Sync Error", message);
      return;
    }

    setSyncingCalendar(true);
    setCalendarError(null);
    try {
      if (calendarEnabled) {
        await setCalendarSyncEnabled({ enabled: false });
        return;
      }

      const permission = await requestCalendarPermissions();
      const granted = permission.status === "granted";
      if (!granted) {
        const message =
          "Calendar permission was denied. Please enable Calendar access in iOS Settings and try again.";
        setCalendarError(message);
        Alert.alert("Calendar Permission Required", message);
      }
      await setCalendarSyncEnabled({ enabled: granted });
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : "Unknown error occurred.";
      const message =
        "Failed to update calendar sync. Please check your internet connection and try again.\n\n" +
        `Details: ${detail}`;
      setCalendarError(message);
      Alert.alert("Calendar Sync Failed", message);
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
      {calendarError ? (
        <Text type="text-detail" color="#F87171">
          {calendarError}
        </Text>
      ) : null}
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
