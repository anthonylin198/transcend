import { useRef, useState } from "react";
import { api } from "@transcend/convex";
import { useMutation } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { LogOverlaySlot } from "@/components/calories/LogOverlayHost";
import {
  applyDeleteWeightLogOptimisticUpdate,
  applySetWeightLogOptimisticUpdate,
} from "@/components/calories/weightLogOptimistic";
import Text from "@/components/ui/Text";
import { appFonts } from "@/constants/fonts";
import {
  formatWeightNumber,
  parseWeightInput,
  sanitizeWeight,
} from "@/utils/weight";

type LogWeightModalProps = {
  visible: boolean;
  weekStart: string;
  weekLabel: string;
  pounds: number | null;
  onClose: () => void;
};

function LogWeightForm({
  weekStart,
  weekLabel,
  pounds,
  onClose,
}: Omit<LogWeightModalProps, "visible">) {
  const setWeightLog = useMutation(
    api.weightLogs.setWeightLog.setWeightLog,
  ).withOptimisticUpdate(applySetWeightLogOptimisticUpdate);
  const deleteWeightLog = useMutation(
    api.weightLogs.deleteWeightLog.deleteWeightLog,
  ).withOptimisticUpdate(applyDeleteWeightLogOptimisticUpdate);
  const savingRef = useRef(false);
  const [weight, setWeight] = useState(
    pounds === null ? "" : formatWeightNumber(pounds),
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const requestClose = () => {
    if (savingRef.current) return;
    onClose();
  };

  const onSave = async () => {
    if (savingRef.current) return;
    const parsed = parseWeightInput(weight);
    if (parsed === null) {
      setError("Enter a weight in pounds");
      return;
    }

    savingRef.current = true;
    setSaving(true);
    setError(null);
    try {
      await setWeightLog({ weekStart, pounds: parsed });
      onClose();
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Could not save weight";
      setError(message);
      savingRef.current = false;
      setSaving(false);
    }
  };

  const remove = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError(null);
    try {
      await deleteWeightLog({ weekStart });
      onClose();
    } catch (removeError) {
      const message =
        removeError instanceof Error
          ? removeError.message
          : "Could not remove weight";
      setError(message);
      savingRef.current = false;
      setSaving(false);
    }
  };

  const onRemove = () => {
    if (savingRef.current) return;
    Alert.alert("Remove weight?", "This week's weight will be removed.", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => void remove() },
    ]);
  };

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 20,
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
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
            accessibilityLabel="Dismiss weight"
            accessibilityRole="button"
            onPress={requestClose}
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
              gap: 16,
            }}
          >
            <View style={{ gap: 4 }}>
              <Text type="heading-4" accessibilityRole="header">
                {pounds === null ? "Add weight" : "Edit weight"}
              </Text>
              <Text type="text-detail" color="#9CA3AF">
                {weekLabel}
              </Text>
            </View>

            <View style={{ gap: 6 }}>
              <Text type="text-detail" color="#9CA3AF">
                Pounds
              </Text>
              <TextInput
                value={weight}
                onChangeText={(value) => {
                  setWeight(sanitizeWeight(value));
                  setError(null);
                }}
                keyboardType="decimal-pad"
                inputMode="decimal"
                placeholder="0.0"
                placeholderTextColor="#6B7280"
                accessibilityLabel="Weight in pounds"
                editable={!saving}
                autoFocus
                style={{
                  color: "#F9FAFB",
                  borderBottomWidth: 1,
                  borderBottomColor: "#374151",
                  fontFamily: appFonts.semiBold,
                  fontSize: 28,
                  lineHeight: 36,
                  paddingVertical: 8,
                }}
              />
            </View>

            {error ? (
              <Text type="text-detail" color="#F87171">
                {error}
              </Text>
            ) : null}

            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                accessibilityRole="button"
                onPress={requestClose}
                disabled={saving}
                style={{
                  flex: 1,
                  minHeight: 48,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: "#374151",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                <Text type="text-semibold">Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => void onSave()}
                disabled={saving}
                style={{
                  flex: 1,
                  minHeight: 48,
                  borderRadius: 10,
                  backgroundColor: saving ? "#374151" : "#F3F4F6",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  type="text-semibold"
                  color={saving ? "#9CA3AF" : "#111827"}
                >
                  {saving ? "Saving..." : "Save"}
                </Text>
              </Pressable>
            </View>

            {pounds !== null ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remove weight"
                onPress={onRemove}
                disabled={saving}
                style={{
                  minHeight: 36,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  opacity: saving ? 0.5 : 1,
                }}
              >
                <Ionicons name="trash-outline" size={16} color="#F87171" />
                <Text type="text-semibold" color="#F87171">
                  Remove weight
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

export default function LogWeightModal({
  visible,
  weekStart,
  weekLabel,
  pounds,
  onClose,
}: LogWeightModalProps) {
  if (!visible) return null;
  return (
    <LogOverlaySlot>
      <LogWeightForm
        weekStart={weekStart}
        weekLabel={weekLabel}
        pounds={pounds}
        onClose={onClose}
      />
    </LogOverlaySlot>
  );
}
