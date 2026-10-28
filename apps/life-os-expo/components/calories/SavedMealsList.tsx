import { useMemo, useState } from "react";
import { api } from "@transcend/convex";
import { useMutation, useQuery } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { Alert, Pressable, View } from "react-native";
import CaloriePage, {
  CalorieHeaderButton,
} from "@/components/calories/CaloriePage";
import { applyDeleteSavedMealOptimisticUpdate } from "@/components/calories/savedMealOptimistic";
import Text from "@/components/ui/Text";
import { formatCalories, formatProtein } from "@/utils/calorieWeek";

export type SavedMealChoice = {
  _id: string;
  calories: number;
  proteinG: number;
  description: string;
};

type SavedMealsListProps = {
  /** Choosing a meal fills a calorie log instead of opening the editor. */
  picking?: boolean;
  onBack: () => void;
  onAdd: () => void;
  onPick?: (meal: SavedMealChoice) => void;
  onEdit?: (meal: SavedMealChoice) => void;
};

export default function SavedMealsList({
  picking = false,
  onBack,
  onAdd,
  onPick,
  onEdit,
}: SavedMealsListProps) {
  const savedMeals = useQuery(api.savedMeals.listSavedMeals.listSavedMeals);
  const deleteSavedMeal = useMutation(
    api.savedMeals.deleteSavedMeal.deleteSavedMeal,
  ).withOptimisticUpdate((localStore, args) => {
    applyDeleteSavedMealOptimisticUpdate(localStore, args);
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const meals = useMemo(() => {
    if (!savedMeals) return [];
    return [...savedMeals].sort((a, b) =>
      a.description.localeCompare(b.description, undefined, {
        sensitivity: "base",
      }),
    );
  }, [savedMeals]);

  const confirmDelete = (meal: SavedMealChoice) => {
    if (deletingId) return;
    Alert.alert(
      "Delete saved meal?",
      `${meal.description} will be removed. Calorie logs you already saved are not changed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setDeletingId(meal._id);
            void deleteSavedMeal({ savedMealId: meal._id as never })
              .catch((error: unknown) => {
                const message =
                  error instanceof Error
                    ? error.message
                    : "Could not delete saved meal";
                Alert.alert("Could not delete saved meal", message);
              })
              .finally(() => setDeletingId(null));
          },
        },
      ],
    );
  };

  return (
    <CaloriePage
      title="Saved meals"
      onBack={onBack}
      right={
        <CalorieHeaderButton
          label="Add"
          accessibilityLabel="Add saved meal"
          onPress={onAdd}
        />
      }
    >
      <Text type="text-detail" color="#9CA3AF">
        {picking
          ? "Tap a meal to fill calories, protein, and description."
          : "Reuse these when you log calories. Past logs stay as they were."}
      </Text>

      {savedMeals === undefined ? (
        <Text type="text-detail" color="#9CA3AF">
          Loading...
        </Text>
      ) : meals.length === 0 ? (
        <Text type="text-detail" color="#6B7280">
          {picking
            ? "No saved meals yet. Add one, then tap it to fill this log."
            : "No saved meals yet."}
        </Text>
      ) : (
        <View>
          {meals.map((meal) => {
            const deleting = deletingId === meal._id;
            const summary = `${formatCalories(meal.calories)} cal · ${formatProtein(meal.proteinG)}g protein`;
            return (
              <View
                key={meal._id}
                style={{
                  minHeight: 56,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  borderTopWidth: 1,
                  borderTopColor: "#1F2937",
                  opacity: deleting ? 0.45 : 1,
                }}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    picking
                      ? `Use ${meal.description}, ${summary}`
                      : `Edit ${meal.description}, ${summary}`
                  }
                  disabled={deletingId !== null}
                  onPress={() => {
                    if (picking) {
                      onPick?.(meal);
                      return;
                    }
                    onEdit?.(meal);
                  }}
                  style={({ pressed }) => ({
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    paddingVertical: 10,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <View style={{ flex: 1 }}>
                    <Text type="text-semibold">{meal.description}</Text>
                    <Text type="text-detail" color="#9CA3AF">
                      {summary}
                    </Text>
                  </View>
                  {picking ? (
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#9CA3AF"
                    />
                  ) : null}
                </Pressable>
                {picking ? null : (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${meal.description}`}
                    disabled={deletingId !== null}
                    hitSlop={8}
                    onPress={() => confirmDelete(meal)}
                    style={{ padding: 6 }}
                  >
                    <Ionicons name="trash-outline" size={18} color="#9CA3AF" />
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      )}
    </CaloriePage>
  );
}
