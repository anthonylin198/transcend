import { useState } from "react";
import { api } from "@transcend/convex";
import { useMutation } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { Ionicons } from "@expo/vector-icons";
import Text from "@/components/ui/Text";
import LogWorkoutModal from "@/components/workouts/LogWorkoutModal";
import { formatLogDateHeading, groupLogsByDate } from "@/utils/calorieWeek";
import { Alert, Pressable, View } from "react-native";

type WorkoutLog = FunctionReturnType<
  typeof api.workoutLogs.listWorkoutLogs.listWorkoutLogs
>[number];

type WorkoutLogListProps = {
  logs: WorkoutLog[];
  todayKey: string;
  showDateHeadings?: boolean;
  emptyText?: string;
};

export default function WorkoutLogList({
  logs,
  todayKey,
  showDateHeadings = true,
  emptyText = "No workouts yet",
}: WorkoutLogListProps) {
  const [deletingId, setDeletingId] = useState<WorkoutLog["_id"] | null>(null);
  const [editingLog, setEditingLog] = useState<WorkoutLog | null>(null);
  const deleteWorkoutLog = useMutation(
    api.workoutLogs.deleteWorkoutLog.deleteWorkoutLog,
  ).withOptimisticUpdate((localStore, args) => {
    const bootstrapQueries = localStore.getAllQueries(
      api.home.bootstrap.bootstrap,
    );
    for (const { args: queryArgs, value } of bootstrapQueries) {
      if (!value || value.profile === null) continue;
      if (!value.workoutLogs.some((log) => log._id === args.workoutLogId)) {
        continue;
      }
      localStore.setQuery(api.home.bootstrap.bootstrap, queryArgs, {
        ...value,
        workoutLogs: value.workoutLogs.filter(
          (log) => log._id !== args.workoutLogId,
        ),
      });
    }

    const listQueries = localStore.getAllQueries(
      api.workoutLogs.listWorkoutLogs.listWorkoutLogs,
    );
    for (const { args: queryArgs, value } of listQueries) {
      if (!value?.some((log) => log._id === args.workoutLogId)) continue;
      localStore.setQuery(
        api.workoutLogs.listWorkoutLogs.listWorkoutLogs,
        queryArgs,
        value.filter((log) => log._id !== args.workoutLogId),
      );
    }
  });

  const groups = groupLogsByDate(logs);

  const onDelete = (log: WorkoutLog) => {
    if (deletingId) return;
    Alert.alert("Delete workout?", `"${log.description}" will be removed.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setDeletingId(log._id);
          void deleteWorkoutLog({ workoutLogId: log._id })
            .catch((error: unknown) => {
              const message =
                error instanceof Error
                  ? error.message
                  : "Could not delete workout";
              Alert.alert("Could not delete workout", message);
            })
            .finally(() => setDeletingId(null));
        },
      },
    ]);
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
                  gap: 12,
                  opacity: deleting ? 0.45 : 1,
                }}
              >
                <Text type="text-regular" style={{ flex: 1 }}>
                  {log.description}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Edit workout ${log.description}`}
                  disabled={deletingId !== null}
                  hitSlop={8}
                  onPress={() => setEditingLog(log)}
                  style={{ padding: 6, marginRight: -6 }}
                >
                  <Ionicons name="pencil-outline" size={17} color="#9CA3AF" />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Delete workout ${log.description}`}
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
      <LogWorkoutModal
        visible={editingLog !== null}
        log={editingLog ?? undefined}
        onClose={() => setEditingLog(null)}
      />
    </View>
  );
}
