import { useRef, useState } from "react";
import { api } from "@transcend/convex";
import { useMutation } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";
import CaloriePage, {
  CaloriePrimaryButton,
} from "@/components/calories/CaloriePage";
import NutritionFields, {
  MAX_NUTRITION_DESCRIPTION_LENGTH,
  sanitizeCalories,
  sanitizeProtein,
} from "@/components/calories/NutritionFields";
import {
  applyCreateSavedMealOptimisticUpdate,
  applyUpdateSavedMealOptimisticUpdate,
} from "@/components/calories/savedMealOptimistic";
import Text from "@/components/ui/Text";
import { parseCaloriesInput, parseProteinInput } from "@/utils/calorieWeek";

function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function SavedMealScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    savedMealId?: string;
    initialCalories?: string;
    initialProtein?: string;
    initialDescription?: string;
  }>();
  const savedMealId = firstSearchParam(params.savedMealId);
  const editing = Boolean(savedMealId);

  const createSavedMeal = useMutation(
    api.savedMeals.createSavedMeal.createSavedMeal,
  ).withOptimisticUpdate((localStore, args) => {
    applyCreateSavedMealOptimisticUpdate(localStore, args);
  });
  const updateSavedMeal = useMutation(
    api.savedMeals.updateSavedMeal.updateSavedMeal,
  ).withOptimisticUpdate((localStore, args) => {
    applyUpdateSavedMealOptimisticUpdate(localStore, args);
  });

  const savingRef = useRef(false);
  const [calories, setCalories] = useState(() =>
    sanitizeCalories(firstSearchParam(params.initialCalories) ?? ""),
  );
  const [protein, setProtein] = useState(() =>
    sanitizeProtein(firstSearchParam(params.initialProtein) ?? ""),
  );
  const [description, setDescription] = useState(() =>
    (firstSearchParam(params.initialDescription) ?? "").slice(
      0,
      MAX_NUTRITION_DESCRIPTION_LENGTH,
    ),
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const requestClose = () => {
    if (savingRef.current) return;
    router.back();
  };

  const onSave = async () => {
    if (savingRef.current) return;

    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      setError("Add a description so you can find this meal.");
      return;
    }
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
      if (savedMealId) {
        await updateSavedMeal({
          savedMealId: savedMealId as never,
          calories: parsedCalories,
          proteinG: parsedProtein,
          description: trimmedDescription,
        });
      } else {
        await createSavedMeal({
          calories: parsedCalories,
          proteinG: parsedProtein,
          description: trimmedDescription,
        });
      }
      router.back();
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : "Could not save meal";
      setError(message);
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <CaloriePage
      title={editing ? "Edit Meal" : "New Meal"}
      onBack={requestClose}
      footer={
        <View style={{ gap: 12 }}>
          {error ? (
            <Text type="text-detail" color="#F87171">
              {error}
            </Text>
          ) : null}
          <CaloriePrimaryButton
            label={saving ? "Saving..." : "Save Meal"}
            disabled={saving}
            onPress={() => void onSave()}
          />
        </View>
      }
    >
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
        descriptionLabel="Description"
        descriptionPlaceholder="Chicken and rice"
        descriptionFirst
        autoFocus="description"
      />
    </CaloriePage>
  );
}
