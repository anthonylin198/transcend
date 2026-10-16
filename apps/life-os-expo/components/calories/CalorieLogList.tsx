import { useState } from "react";
import { api } from "@transcend/convex";
import { useMutation } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { Ionicons } from "@expo/vector-icons";
import LogCaloriesModal from "@/components/calories/LogCaloriesModal";
import Text from "@/components/ui/Text";
import {
  formatCalories,
  formatLogDateHeading,
  formatProtein,
  groupLogsByDate,
} from "@/utils/calorieWeek";
import { Alert, Pressable, View } from "react-native";

type CalorieLog = FunctionReturnType<
  typeof api.calorieLogs.listCalorieLogs.listCalorieLogs
>[number];

type CalorieLogListProps = {
  logs: CalorieLog[];
  todayKey: string;
  showDateHeadings?: boolean;
  emptyText?: string;
};

export default function CalorieLogList({
  logs,
  todayKey,
  showDateHeadings = true,
  emptyText = "No logs yet",
}: CalorieLogListProps) {
  const [deletingId, setDeletingId] = useState<CalorieLog["_id"] | null>(null);
  const [editingLog, setEditingLog] = useState<CalorieLog | null>(null);
  const deleteCalorieLog = useMutation(
    api.calorieLogs.deleteCalorieLog.deleteCalorieLog,
  ).withOptimisticUpdate((localStore, args) => {
    const bootstrapQueries = localStore.getAllQueries(
      api.home.bootstrap.bootstrap,
    );
    for (const { args: queryArgs, value } of bootstrapQueries) {
      if (!value || value.profile === null) continue;
      if (!value.calorieLogs.some((log) => log._id === args.calorieLogId)) {
        continue;
      }
      localStore.setQuery(api.home.bootstrap.bootstrap, queryArgs, {
        ...value,
        calorieLogs: value.calorieLogs.filter(
          (log) => log._id !== args.calorieLogId,
        ),
      });
    }

    const listQueries = localStore.getAllQueries(
      api.calorieLogs.listCalorieLogs.listCalorieLogs,
    );
    for (const { args: queryArgs, value } of listQueries) {
      if (!value?.some((log) => log._id === args.calorieLogId)) continue;
      localStore.setQuery(
        api.calorieLogs.listCalorieLogs.listCalorieLogs,
        queryArgs,
        value.filter((log) => log._id !== args.calorieLogId),
      );
    }
  });

  const groups = groupLogsByDate(logs);

  const onDelete = (log: CalorieLog) => {
    if (deletingId) return;
    Alert.alert(
      "Delete entry?",
      `${formatCalories(log.calories)} cal and ${formatProtein(log.proteinG)}g protein will be removed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setDeletingId(log._id);
            void deleteCalorieLog({ calorieLogId: log._id })
              .catch((error: unknown) => {
                const message =
                  error instanceof Error
                    ? error.message
                    : "Could not delete entry";
                Alert.alert("Could not delete entry", message);
              })
              .finally(() => setDeletingId(null));
          },
        },
      ],
    );
  };

  if (groups.length === 0) {
    return (
      <Text type="text-detail" color="#6B7280">
        {emptyText}
      </Text>
    );
  }

  return (
    <View style={{ gap: 16 }}>
      {groups.map((group) => (
        <View key={group.date} style={{ gap: 4 }}>
          {showDateHeadings ? (
            <Text type="text-detail" color="#9CA3AF">
              {formatLogDateHeading(group.date, todayKey)}
            </Text>
          ) : null}
          {group.entries.map((log) => {
            const deleting = deletingId === log._id;
            return (
              <View
                key={log._id}
                style={{
                  minHeight: 40,
                  flexDirection: "row",
                  alignItems: "center",
                  opacity: deleting ? 0.45 : 1,
                }}
              >
                <Text type="text-semibold">
                  {formatCalories(log.calories)} cal
                </Text>
                <Text
                  type="text-regular"
                  color="#9CA3AF"
                  style={{ marginLeft: 12 }}
                >
                  {formatProtein(log.proteinG)}g protein
                </Text>
                <View style={{ flex: 1 }} />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${formatCalories(log.calories)} calorie entry`}
                  disabled={deletingId !== null}
                  hitSlop={8}
                  onPress={() => setEditingLog(log)}
                  style={{ padding: 6, marginRight: 6 }}
                >
                  <Ionicons name="pencil-outline" size={17} color="#9CA3AF" />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${formatCalories(log.calories)} calorie entry`}
                  disabled={deletingId !== null}
                  hitSlop={8}
                  onPress={() => onDelete(log)}
                  style={{ padding: 6 }}
                >
                  <Ionicons name="trash-outline" size={18} color="#9CA3AF" />
                </Pressable>
              </View>
            );
          })}
        </View>
      ))}
      <LogCaloriesModal
        visible={editingLog !== null}
        log={editingLog ?? undefined}
        onClose={() => setEditingLog(null)}
      />
    </View>
  );
}
