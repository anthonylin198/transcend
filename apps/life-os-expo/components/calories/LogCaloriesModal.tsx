import { useCallback, useRef, useState } from "react";
import { api } from "@transcend/convex";
import { useMutation, useQuery } from "convex/react";
import { useFocusEffect, useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform, Pressable, View } from "react-native";
import {
  applyCreateCalorieLogOptimisticUpdate,
  applyUpdateCalorieLogOptimisticUpdate,
} from "@/components/calories/calorieLogOptimistic";
import { LogOverlaySlot } from "@/components/calories/LogOverlayHost";
import NutritionFields, {
  MAX_NUTRITION_DESCRIPTION_LENGTH,
  sanitizeCalories,
  sanitizeProtein,
} from "@/components/calories/NutritionFields";
import { takeStagedSavedMeal } from "@/components/calories/stagedSavedMeal";
import Text from "@/components/ui/Text";
import {
  formatLongDate,
  formatProtein,
  parseCaloriesInput,
  parseLocalDateKey,
  parseProteinInput,
  toLocalDateKey,
} from "@/utils/calorieWeek";

type EditableCalorieLog = {
  _id: string;
  calories: number;
  proteinG: number;
  description?: string;
};

type LogCaloriesModalProps = {
  visible: boolean;
  onClose: () => void;
  /** When set, the modal edits this entry instead of creating one. */
  log?: EditableCalorieLog;
  /** Local YYYY-MM-DD for a new entry. Defaults to today. */
  date?: string;
};

function fieldsFromMeal(meal: {
  calories: number;
  proteinG: number;
  description: string;
}) {
  return {
    calories: sanitizeCalories(String(meal.calories)),
    protein: sanitizeProtein(formatProtein(meal.proteinG)),
    description: meal.description.slice(0, MAX_NUTRITION_DESCRIPTION_LENGTH),
  };
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
  const router = useRouter();
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
  // Same query the saved-meals list uses, so that screen is already cached.
  useQuery(api.savedMeals.listSavedMeals.listSavedMeals);

  const savingRef = useRef(false);
  const pickingRef = useRef(false);
  const [calories, setCalories] = useState(log ? String(log.calories) : "");
  const [protein, setProtein] = useState(
    log ? formatProtein(log.proteinG) : "",
  );
  const [description, setDescription] = useState(log?.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!pickingRef.current) return;
      pickingRef.current = false;
      const meal = takeStagedSavedMeal();
      if (meal) {
        const next = fieldsFromMeal(meal);
        setCalories(next.calories);
        setProtein(next.protein);
        setDescription(next.description);
        setError(null);
      }
    }, [setCalories, setDescription, setError, setProtein]),
  );

  const requestClose = () => {
    if (savingRef.current) return;
    onClose();
  };

  const openSavedMeals = () => {
    if (savingRef.current || pickingRef.current) return;
    pickingRef.current = true;
    router.push({
      pathname: "/(authenticated)/calorie-counter/saved-meals",
      params: { pick: "1" },
    });
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
      const trimmedDescription = description.trim();
      if (log) {
        await updateCalorieLog({
          calorieLogId: log._id as never,
          calories: parsedCalories,
          proteinG: parsedProtein,
          description: trimmedDescription,
        });
      } else {
        await createCalorieLog({
          date: date ?? toLocalDateKey(new Date()),
          calories: parsedCalories,
          proteinG: parsedProtein,
          ...(trimmedDescription ? { description: trimmedDescription } : {}),
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
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <View style={{ flex: 1, gap: 4 }}>
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
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Choose a saved meal"
                disabled={saving}
                hitSlop={8}
                onPress={openSavedMeals}
                style={({ pressed }) => ({
                  paddingVertical: 4,
                  opacity: saving ? 0.5 : pressed ? 0.7 : 1,
                })}
              >
                <Text type="text-semibold">Saved meals</Text>
              </Pressable>
            </View>

            <NutritionFields
              calories={calories}
              protein={protein}
              description={description}
              onCalories={(value) => {
                setCalories(value);
                setError(null);
              }}
              onProtein={(value) => {
                setProtein(value);
                setError(null);
              }}
              onDescription={(value) => {
                setDescription(value);
                setError(null);
              }}
              editable={!saving}
              descriptionLabel="Description (optional)"
              descriptionPlaceholder="What was it?"
              autoFocus="calories"
            />

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
    </View>
  );
}

export default function LogCaloriesModal({
  visible,
  onClose,
  log,
  date,
}: LogCaloriesModalProps) {
  if (!visible) return null;
  return (
    <LogOverlaySlot>
      <LogCaloriesForm onClose={onClose} log={log} date={date} />
    </LogOverlaySlot>
  );
}
