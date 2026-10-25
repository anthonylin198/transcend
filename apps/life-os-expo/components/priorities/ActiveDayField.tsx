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
  /** Day the picker opens on when turning an inactive priority on. Falls back to today. */
  defaultDateKey?: string;
  onChange: (activeDateKey: string | null) => void;
  disabled?: boolean;
  /** `value` shows only the day, for use beside a priority name. */
  variant?: "field" | "value";
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
  variant = "field",
}: ActiveDayFieldProps) {
  const [open, setOpen] = useState(false);
  // Day shown while activating, before the parent has a committed date.
  const [draftDateKey, setDraftDateKey] = useState<string | null>(null);
  const modalDateKey = draftDateKey ?? activeDateKey;
  const label = activeDateKey
    ? formatActiveDay(activeDateKey)
    : variant === "value"
      ? "Make active"
      : "No";

  const close = () => {
    setOpen(false);
    setDraftDateKey(null);
  };

  const onPress = () => {
    if (disabled) return;
    if (!activeDateKey) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setDraftDateKey(defaultDateKey ?? toLocalDateKey(new Date()));
    }
    setOpen(true);
  };

  const confirm = () => {
    if (!activeDateKey && draftDateKey) {
      onChange(draftDateKey);
    }
    close();
  };

  const shift = (amount: number) => {
    if (!modalDateKey) return;
    void Haptics.selectionAsync();
    const next = shiftDateKey(modalDateKey, amount);
    if (activeDateKey) {
      onChange(next);
      return;
    }
    setDraftDateKey(next);
  };

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          variant === "value" ? `Active day, ${label}` : `Active, ${label}`
        }
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        hitSlop={variant === "value" ? 8 : undefined}
        style={{
          flexDirection: "row",
          justifyContent: variant === "value" ? "flex-end" : "space-between",
          alignItems: "center",
          gap: variant === "value" ? 4 : 8,
          paddingVertical: 4,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {variant === "field" ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="calendar-clear-outline" size={20} color="#9CA3AF" />
            <Text type="text-regular">Active</Text>
          </View>
        ) : null}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Text type="text-semibold" color="#D1D5DB">
            {label}
          </Text>
          {activeDateKey || variant === "value" ? (
            <Ionicons name="chevron-forward" size={18} color="#6B7280" />
          ) : null}
        </View>
      </Pressable>

      <Modal
        visible={open && modalDateKey !== null}
        transparent
        animationType="fade"
        onRequestClose={close}
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
            onPress={close}
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
                {modalDateKey ? formatActiveDay(modalDateKey) : ""}
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
                onPress={confirm}
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
                  if (activeDateKey) onChange(null);
                  close();
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
