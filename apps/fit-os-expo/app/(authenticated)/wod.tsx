import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "@/components/ui/Text";
import WodView from "@/components/workouts/WodView";
import { wods } from "@/data/wods";
import { scheduledWod } from "@/data/wodSchedule";
import {
  addDays,
  parseLocalDateKey,
  toLocalDateKey,
} from "@/utils/calorieWeek";

function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function WodScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const params = useLocalSearchParams<{ id?: string; date?: string }>();
  const id = firstSearchParam(params.id);
  const dateKey = firstSearchParam(params.date);
  const selectedDate = id
    ? null
    : dateKey
      ? parseLocalDateKey(dateKey)
      : new Date();
  const wod = id
    ? wods.find((entry) => entry.id === id)
    : scheduledWod(selectedDate ?? new Date());

  const dayKey = selectedDate ? toLocalDateKey(selectedDate) : null;

  function shiftDay(amount: number) {
    if (!selectedDate) return;
    router.setParams({ date: toLocalDateKey(addDays(selectedDate, amount)) });
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [dayKey]);

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 36,
          alignItems: "center",
        }}
      >
        <View style={{ width: "100%", maxWidth: 640 }}>
          <View
            style={{
              minHeight: 56,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={() => router.back()}
              hitSlop={8}
              style={{ padding: 6, marginLeft: -6 }}
            >
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </Pressable>
            <Text type="heading-4" style={{ flex: 1 }}>
              WOD
            </Text>
            {selectedDate ? (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Previous day"
                  onPress={() => shiftDay(-1)}
                  hitSlop={8}
                  style={{ padding: 6 }}
                >
                  <Ionicons name="chevron-back" size={18} color="#FFFFFF" />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Open workout calendar"
                  onPress={() => router.push("/(authenticated)/wod-calendar")}
                  hitSlop={8}
                  style={{ paddingVertical: 6, paddingHorizontal: 2 }}
                >
                  <Text type="text-semibold">
                    {new Intl.DateTimeFormat(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    }).format(selectedDate)}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Next day"
                  onPress={() => shiftDay(1)}
                  hitSlop={8}
                  style={{ padding: 6 }}
                >
                  <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
                </Pressable>
              </View>
            ) : null}
          </View>
          {wod ? (
            <View style={{ marginTop: 8 }}>
              <WodView key={dayKey ?? wod.id} wod={wod} />
            </View>
          ) : (
            <Text type="text-detail" color="#9CA3AF" style={{ marginTop: 8 }}>
              No workout yet
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
