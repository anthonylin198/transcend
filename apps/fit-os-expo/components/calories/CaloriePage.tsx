import type { ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "@/components/ui/Text";

type CaloriePageProps = {
  title: string;
  right?: ReactNode;
  onBack?: () => void;
  footer?: ReactNode;
  children: ReactNode;
};

export default function CaloriePage({
  title,
  right,
  onBack,
  footer,
  children,
}: CaloriePageProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "black" }}
    >
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 20 }}>
        <View style={{ width: "100%", maxWidth: 640, alignSelf: "center" }}>
          <View
            style={{
              minHeight: 56,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              hitSlop={8}
              onPress={onBack ?? (() => router.back())}
              style={{ padding: 6, marginLeft: -6 }}
            >
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </Pressable>
            <Text
              type="heading-4"
              accessibilityRole="header"
              numberOfLines={1}
              style={{ flex: 1 }}
            >
              {title}
            </Text>
            {right}
          </View>
        </View>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: footer ? 16 : insets.bottom + 28,
          alignItems: "center",
        }}
      >
        <View style={{ width: "100%", maxWidth: 640, gap: 16 }}>
          {children}
        </View>
      </ScrollView>

      {footer ? (
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 10,
            paddingBottom: Math.max(insets.bottom, 12),
            alignItems: "center",
          }}
        >
          <View style={{ width: "100%", maxWidth: 640 }}>{footer}</View>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

export function CalorieHeaderButton({
  label,
  accessibilityLabel,
  onPress,
  disabled,
}: {
  label: string;
  accessibilityLabel?: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 6,
        paddingLeft: 8,
        opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
      })}
    >
      <Text type="text-semibold">{label}</Text>
    </Pressable>
  );
}

export function CaloriePrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 52,
        borderRadius: 10,
        backgroundColor: disabled ? "#374151" : "#F3F4F6",
        alignItems: "center",
        justifyContent: "center",
        opacity: !disabled && pressed ? 0.72 : 1,
      })}
    >
      <Text type="text-semibold" color={disabled ? "#9CA3AF" : "#111827"}>
        {label}
      </Text>
    </Pressable>
  );
}
