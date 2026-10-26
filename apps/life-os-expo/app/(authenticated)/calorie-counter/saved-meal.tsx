import { useRouter, useLocalSearchParams } from "expo-router";
import SavedMealForm from "@/components/calories/SavedMealForm";

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

  return (
    <SavedMealForm
      savedMealId={firstSearchParam(params.savedMealId)}
      initialCalories={firstSearchParam(params.initialCalories)}
      initialProtein={firstSearchParam(params.initialProtein)}
      initialDescription={firstSearchParam(params.initialDescription)}
      onDone={() => router.back()}
    />
  );
}
