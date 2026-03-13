import { useMemo, useState } from "react";
import { api } from "@transcend/convex";
import { useMutation } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Modal, Pressable, View } from "react-native";
import Text from "@/components/ui/Text";

type HomePriority = {
  _id: string;
  name: string;
  description?: string;
  status: "todo" | "next_up" | "done";
  isActive?: boolean;
  projectId?: string;
  activatedAt?: number;
  activeDateKey?: string;
  completedAt?: number;
  createdAt?: number;
};

function toStartOfDayMs(value: Date | number) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function toDateKey(value: Date | number) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getActivationSortMs(priority: HomePriority) {
  if (priority.activatedAt !== undefined) {
    return priority.activatedAt;
  }
  if (priority.createdAt !== undefined) {
    return priority.createdAt;
  }
  return 0;
}

type PrioritiesSectionProps = {
  priorities: HomePriority[];
  selectedDate: Date;
  today: Date;
};

export default function PrioritiesSection({
  priorities,
  selectedDate,
  today,
}: PrioritiesSectionProps) {
  const router = useRouter();
  const setPriorityStatus = useMutation(
    api.priorities.setPriorityStatus.setPriorityStatus,
  );
  const [quickAddModalOpen, setQuickAddModalOpen] = useState(false);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const navigateFromQuickAdd = (
    route:
      | "/(authenticated)/priority/add-priority"
      | "/(authenticated)/priority/add-to-active",
    params: Record<string, string>,
  ) => {
    setQuickAddModalOpen(false);
    requestAnimationFrame(() => {
      router.push({
        pathname: route,
        params,
      });
    });
  };

  const visiblePriorities = useMemo(() => {
    const selectedDayMs = toStartOfDayMs(selectedDate);
    const todayMs = toStartOfDayMs(today);
    const isSelectedDateFuture = selectedDayMs > todayMs;
    const selectedDateKey = toDateKey(selectedDate);

    const filtered = priorities
      .map((priority, index) => ({ priority, index }))
      .filter(({ priority }) => {
        if (priority.status === "done") {
          if (priority.completedAt === undefined) return false;
          return toStartOfDayMs(priority.completedAt) === selectedDayMs;
        }

        if (
          priority.status === "next_up" &&
          priority.isActive &&
          (priority.activeDateKey !== undefined ||
            priority.activatedAt !== undefined)
        ) {
          const activeDateKey =
            priority.activeDateKey ??
            (priority.activatedAt !== undefined
              ? toDateKey(priority.activatedAt)
              : undefined);
          if (activeDateKey === undefined) return false;
          if (isSelectedDateFuture) {
            return activeDateKey === selectedDateKey;
          }
          return activeDateKey <= selectedDateKey;
        }

        return false;
      });

    filtered.sort((left, right) => {
      const leftActivationMs = getActivationSortMs(left.priority);
      const rightActivationMs = getActivationSortMs(right.priority);
      if (leftActivationMs !== rightActivationMs) {
        return leftActivationMs - rightActivationMs;
      }

      const leftCreatedAt = left.priority.createdAt ?? 0;
      const rightCreatedAt = right.priority.createdAt ?? 0;
      if (leftCreatedAt !== rightCreatedAt) {
        return leftCreatedAt - rightCreatedAt;
      }

      return left.index - right.index;
    });
    return filtered.map(({ priority }) => priority);
  }, [priorities, selectedDate, today]);

  const selectedDayCompletionMs = useMemo(() => {
    const selectedDateAtNoon = new Date(selectedDate);
    selectedDateAtNoon.setHours(12, 0, 0, 0);
    return selectedDateAtNoon.getTime();
  }, [selectedDate]);

  const onCompletePriority = async (priority: HomePriority) => {
    if (updatingIds.has(priority._id)) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setUpdatingIds((prev) => new Set(prev).add(priority._id));
    try {
      if (priority.status === "done") {
        await setPriorityStatus({
          priorityId: priority._id as never,
          status: "next_up",
        });
      } else {
        await setPriorityStatus({
          priorityId: priority._id as never,
          status: "done",
          completedAtMs: selectedDayCompletionMs,
          completedDateKey: toDateKey(selectedDate),
        });
      }
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(priority._id);
        return next;
      });
    }
  };

  return (
    <View style={{ gap: 14 }}>
      <Text type="heading-4" color="#9CA3AF">
        Priorities
      </Text>
      {visiblePriorities.length === 0 ? (
        <Text type="text-regular" color="#9CA3AF">
          No priorities
        </Text>
      ) : (
        <View style={{ gap: 14 }}>
          {visiblePriorities.map((priority) => (
            <View
              key={priority._id}
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Pressable
                onPress={() => void onCompletePriority(priority)}
                disabled={updatingIds.has(priority._id)}
                style={{
                  opacity: updatingIds.has(priority._id) ? 0.75 : 1,
                }}
              >
                <Ionicons
                  name={
                    priority.status === "done"
                      ? "checkmark-circle"
                      : "ellipse-outline"
                  }
                  size={22}
                  color={priority.status === "done" ? "#E5E7EB" : "#9CA3AF"}
                />
              </Pressable>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/(authenticated)/priority/[priorityId]",
                    params: {
                      priorityId: priority._id,
                      initialPriority: JSON.stringify(priority),
                    },
                  })
                }
                style={{ flex: 1 }}
              >
                <Text
                  type="text-regular"
                  color="#E5E7EB"
                  style={
                    priority.status === "done"
                      ? { flex: 1, textDecorationLine: "line-through" }
                      : { flex: 1 }
                  }
                >
                  {priority.name}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
      <Pressable
        onPress={() => setQuickAddModalOpen(true)}
        style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
      >
        <Ionicons name="add" size={20} color="#9CA3AF" />
        <Text type="text-medium" color="#9CA3AF">
          Quick add
        </Text>
      </Pressable>

      <Modal visible={quickAddModalOpen} transparent animationType="none">
        <Pressable
          onPress={() => setQuickAddModalOpen(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.55)",
            justifyContent: "flex-end",
          }}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={{
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              backgroundColor: "black",
              borderTopWidth: 1,
              borderTopColor: "#1F2937",
              paddingHorizontal: 16,
              paddingTop: 20,
              paddingBottom: 24,
              gap: 14,
            }}
          >
            <Text type="heading-4" style={{ textAlign: "center" }}>
              Quick Add
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable
                onPress={() => {
                  navigateFromQuickAdd(
                    "/(authenticated)/priority/add-priority",
                    {
                      defaultStatus: "next_up",
                      defaultIsActive: "true",
                      selectedDateMs: String(toStartOfDayMs(selectedDate)),
                    },
                  );
                }}
                style={{
                  flex: 1,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: "#1F2937",
                  paddingVertical: 18,
                  paddingHorizontal: 12,
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Ionicons name="add" size={22} color="#E5E7EB" />
                <Text type="text-medium" style={{ textAlign: "center" }}>
                  Add New Priority
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  navigateFromQuickAdd(
                    "/(authenticated)/priority/add-to-active",
                    {
                      selectedDateMs: String(toStartOfDayMs(selectedDate)),
                    },
                  );
                }}
                style={{
                  flex: 1,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: "#1F2937",
                  paddingVertical: 18,
                  paddingHorizontal: 12,
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Ionicons name="list" size={20} color="#E5E7EB" />
                <Text type="text-medium" style={{ textAlign: "center" }}>
                  From Next Priorities
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
