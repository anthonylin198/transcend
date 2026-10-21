import { Stack } from "expo-router";
import { DayChangeProvider } from "@/components/ui/DayChangeCover";

export default function AuthenticatedLayout() {
  return (
    <DayChangeProvider>
      <Stack screenOptions={{ headerShown: false, animation: "none" }} />
    </DayChangeProvider>
  );
}
