import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Modal, Pressable, View } from "react-native";
import Text from "@/components/ui/Text";
import { appFonts } from "@/constants/fonts";
import {
  addDays,
  parseLocalDateKey,
  toLocalDateKey,
} from "@/utils/calorieWeek";

type ActiveDayFieldProps = {
  activeDateKey: string | null;
  defaultDateKey: string;
  onChange: (activeDateKey: string | null) => void;
  disabled?: boolean;
};

function formatActiveDay(dateKey: string) {
  let date: Date;
  try {
    date = parseLocalDateKey(dateKey);
  } catch {
    return dateKey;
  }
  const weekday = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
  }).format(date);
  const monthDay = `${date.getMonth() + 1}/${date.getDate()}`;
  if (date.getFullYear() === new Date().getFullYear()) {
    return `${weekday}, ${monthDay}`;
  }
  return `${weekday}, ${monthDay}, ${date.getFullYear()}`;
}

function shiftDateKey(dateKey: string, amount: number) {
  return toLocalDateKey(addDays(parseLocalDateKey(dateKey), amount));
}

export default function ActiveDayField({
  activeDateKey,
  defaultDateKey,
  onChange,
  disabled,
}: ActiveDayFieldProps) {
  const [open, setOpen] = useState(false);
  const label = activeDateKey ? formatActiveDay(activeDateKey) : "No";

  const onPress = () => {
    if (disabled) return;
    if (!activeDateKey) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(defaultDateKey);
      return;
    }
    setOpen(true);
  };

  const shift = (amount: number) => {
    if (!activeDateKey) return;
    void Haptics.selectionAsync();
    onChange(shiftDateKey(activeDateKey, amount));
  };

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Active, ${label}`}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: 4,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons name="calendar-clear-outline" size={20} color="#9CA3AF" />
          <Text type="text-regular">Active</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Text type="text-semibold" color="#D1D5DB">
            {label}
          </Text>
          {activeDateKey ? (
            <Ionicons name="chevron-forward" size={18} color="#6B7280" />
          ) : null}
        </View>
      </Pressable>

      <Modal
        visible={open && activeDateKey !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.64)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss active day"
            onPress={() => setOpen(false)}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            }}
          />
          <View
            accessibilityViewIsModal
            style={{
              zIndex: 1,
              alignSelf: "center",
              width: "100%",
              maxWidth: 420,
              backgroundColor: "#111111",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#2A2A2A",
              padding: 20,
              gap: 20,
            }}
          >
            <Text type="heading-4" accessibilityRole="header">
              Active day
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Previous day"
                onPress={() => shift(-1)}
                hitSlop={8}
                style={{ padding: 8 }}
              >
                <Ionicons name="chevron-back" size={22} color="#F9FAFB" />
              </Pressable>
              <Text
                style={{
                  flex: 1,
                  textAlign: "center",
                  color: "#F9FAFB",
                  fontFamily: appFonts.semiBold,
                  fontSize: 28,
                  lineHeight: 36,
                }}
              >
                {activeDateKey ? formatActiveDay(activeDateKey) : ""}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Next day"
                onPress={() => shift(1)}
                hitSlop={8}
                style={{ padding: 8 }}
              >
                <Ionicons name="chevron-forward" size={22} color="#F9FAFB" />
              </Pressable>
            </View>
            <View style={{ gap: 10 }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Done"
                onPress={() => setOpen(false)}
                style={{
                  minHeight: 48,
                  borderRadius: 10,
                  backgroundColor: "#F3F4F6",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text type="text-semibold" color="#111827">
                  Done
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Make not active"
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onChange(null);
                  setOpen(false);
                }}
                style={{
                  minHeight: 48,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: "#374151",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text type="text-semibold">Make not active</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
