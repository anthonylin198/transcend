import { useRef, useState } from "react";
import { api } from "@transcend/convex";
import type { OptimisticLocalStore } from "convex/browser";
import { useMutation } from "convex/react";
import type { FunctionArgs } from "convex/server";
import { appFonts } from "@/constants/fonts";
import Text from "@/components/ui/Text";
import {
  formatLongDate,
  formatProtein,
  parseCaloriesInput,
  parseLocalDateKey,
  parseProteinInput,
  toLocalDateKey,
} from "@/utils/calorieWeek";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";

type EditableCalorieLog = {
  _id: UpdateCalorieLogArgs["calorieLogId"];
  calories: number;
  proteinG: number;
};

type LogCaloriesModalProps = {
  visible: boolean;
  onClose: () => void;
  /** When set, the modal edits this entry instead of creating one. */
  log?: EditableCalorieLog;
  /** Local YYYY-MM-DD for a new entry. Defaults to today. */
  date?: string;
};

function sanitizeCalories(value: string) {
  return value.replace(/[^\d]/g, "").slice(0, 5);
}

function sanitizeProtein(value: string) {
  const cleaned = value.replace(/[^\d.]/g, "");
  const dotIndex = cleaned.indexOf(".");
  if (dotIndex === -1) return cleaned.slice(0, 4);

  const whole = cleaned.slice(0, dotIndex).slice(0, 4);
  const decimals = cleaned
    .slice(dotIndex + 1)
    .replace(/\./g, "")
    .slice(0, 1);
  return `${whole}.${decimals}`;
}

type CreateCalorieLogArgs = FunctionArgs<
  typeof api.calorieLogs.createCalorieLog.createCalorieLog
>;

function applyCreateCalorieLogOptimisticUpdate(
  localStore: OptimisticLocalStore,
  args: CreateCalorieLogArgs,
) {
  const now = Date.now();
  const proteinG = Math.round(args.proteinG * 10) / 10;
  const bootstrapQueries = localStore.getAllQueries(
    api.home.bootstrap.bootstrap,
  );
  for (const { args: queryArgs, value } of bootstrapQueries) {
    if (!value || value.profile === null) continue;
    const inRange =
      args.date >= queryArgs.rangeStartDateKey &&
      args.date < queryArgs.rangeEndDateKey;
    if (!inRange) continue;

    const optimisticId =
      `optimistic-calorie-${now}` as (typeof value.calorieLogs)[number]["_id"];
    localStore.setQuery(api.home.bootstrap.bootstrap, queryArgs, {
      ...value,
      calorieLogs: [
        ...value.calorieLogs,
        {
          _id: optimisticId,
          _creationTime: now,
          profileId: value.profile._id,
          date: args.date,
          calories: args.calories,
          proteinG,
          createdAt: now,
        },
      ],
    });
  }
}

type UpdateCalorieLogArgs = FunctionArgs<
  typeof api.calorieLogs.updateCalorieLog.updateCalorieLog
>;

function applyUpdateCalorieLogOptimisticUpdate(
  localStore: OptimisticLocalStore,
  args: UpdateCalorieLogArgs,
) {
  const patch = {
    calories: args.calories,
    proteinG: Math.round(args.proteinG * 10) / 10,
  };
  for (const { args: queryArgs, value } of localStore.getAllQueries(
    api.home.bootstrap.bootstrap,
  )) {
    if (!value || value.profile === null) continue;
    if (!value.calorieLogs.some((log) => log._id === args.calorieLogId)) {
      continue;
    }
    localStore.setQuery(api.home.bootstrap.bootstrap, queryArgs, {
      ...value,
      calorieLogs: value.calorieLogs.map((log) =>
        log._id === args.calorieLogId ? { ...log, ...patch } : log,
      ),
    });
  }

  for (const { args: queryArgs, value } of localStore.getAllQueries(
    api.calorieLogs.listCalorieLogs.listCalorieLogs,
  )) {
    if (!value?.some((log) => log._id === args.calorieLogId)) continue;
    localStore.setQuery(
      api.calorieLogs.listCalorieLogs.listCalorieLogs,
      queryArgs,
      value.map((log) =>
        log._id === args.calorieLogId ? { ...log, ...patch } : log,
      ),
    );
  }
}

function LogCaloriesForm({
  onClose,
  log,
  date,
}: {
  onClose: () => void;
  log?: EditableCalorieLog;
  date?: string;
}) {
  const createCalorieLog = useMutation(
    api.calorieLogs.createCalorieLog.createCalorieLog,
  ).withOptimisticUpdate((localStore, args) => {
    applyCreateCalorieLogOptimisticUpdate(localStore, args);
  });
  const updateCalorieLog = useMutation(
    api.calorieLogs.updateCalorieLog.updateCalorieLog,
  ).withOptimisticUpdate((localStore, args) => {
    applyUpdateCalorieLogOptimisticUpdate(localStore, args);
  });
  const savingRef = useRef(false);
  const [calories, setCalories] = useState(log ? String(log.calories) : "");
  const [protein, setProtein] = useState(
    log ? formatProtein(log.proteinG) : "",
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const requestClose = () => {
    if (savingRef.current) return;
    onClose();
  };

  const onSave = async () => {
    if (savingRef.current) return;

    const parsedCalories = parseCaloriesInput(calories);
    const parsedProtein = parseProteinInput(protein);
    if (parsedCalories === null) {
      setError("Calories must be a whole number of 0 or more.");
      return;
    }
    if (parsedProtein === null) {
      setError("Protein must be 0 or more, with up to one decimal place.");
      return;
    }

    savingRef.current = true;
    setSaving(true);
    setError(null);
    try {
      if (log) {
        await updateCalorieLog({
          calorieLogId: log._id,
          calories: parsedCalories,
          proteinG: parsedProtein,
        });
      } else {
        await createCalorieLog({
          date: date ?? toLocalDateKey(new Date()),
          calories: parsedCalories,
          proteinG: parsedProtein,
        });
      }
      onClose();
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : "Could not save entry";
      setError(message);
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={requestClose}
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
            accessibilityLabel="Dismiss log calories"
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
                {log ? "Edit Calories" : "Log Calories"}
              </Text>
              {!log ? (
                <Text type="text-detail" color="#9CA3AF">
                  {formatLongDate(
                    parseLocalDateKey(date ?? toLocalDateKey(new Date())),
                  )}
                </Text>
              ) : null}
            </View>

            <View style={{ gap: 6 }}>
              <Text type="text-detail" color="#9CA3AF">
                Calories
              </Text>
              <TextInput
                value={calories}
                onChangeText={(value) => setCalories(sanitizeCalories(value))}
                keyboardType="number-pad"
                inputMode="numeric"
                placeholder="0"
                placeholderTextColor="#6B7280"
                accessibilityLabel="Calories"
                autoFocus
                editable={!saving}
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

            <View style={{ gap: 6 }}>
              <Text type="text-detail" color="#9CA3AF">
                Protein (g)
              </Text>
              <TextInput
                value={protein}
                onChangeText={(value) => setProtein(sanitizeProtein(value))}
                keyboardType="decimal-pad"
                inputMode="decimal"
                placeholder="0"
                placeholderTextColor="#6B7280"
                accessibilityLabel="Protein in grams"
                editable={!saving}
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
                  {saving ? "Saving..." : "Save Entry"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function LogCaloriesModal({
  visible,
  onClose,
  log,
  date,
}: LogCaloriesModalProps) {
  if (!visible) return null;
  return <LogCaloriesForm onClose={onClose} log={log} date={date} />;
}
