import { useLocalSearchParams, useRouter } from "expo-router";
import SavedMealsList from "@/components/calories/SavedMealsList";
import { stageSavedMeal } from "@/components/calories/stagedSavedMeal";
import { formatProtein } from "@/utils/calorieWeek";

function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function SavedMealsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ pick?: string }>();
  const picking = firstSearchParam(params.pick) === "1";

  return (
    <SavedMealsList
      picking={picking}
      onBack={() => router.back()}
      onAdd={() => router.push("/(authenticated)/calorie-counter/saved-meal")}
      onPick={(meal) => {
        stageSavedMeal(meal);
        router.back();
      }}
      onEdit={(meal) =>
        router.push({
          pathname: "/(authenticated)/calorie-counter/saved-meal",
          params: {
            savedMealId: meal._id,
            initialCalories: String(meal.calories),
            initialProtein: formatProtein(meal.proteinG),
            initialDescription: meal.description,
          },
        })
      }
    />
  );
}
