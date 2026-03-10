import { useMemo, useState } from "react";
import { api, useMutation } from "@transcend/convex";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Modal, Pressable, View } from "react-native";
import Text from "@/components/ui/Text";

type HomePriority = {
  _id: string;
  name: string;
  status: "todo" | "next_up" | "done";
  activatedAt?: number;
  completedAt?: number;
};

function toStartOfDayMs(value: Date | number) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
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

    return priorities.filter((priority) => {
      if (priority.status === "done") {
        if (priority.completedAt === undefined) return false;
        return toStartOfDayMs(priority.completedAt) === selectedDayMs;
      }

      if (priority.status === "next_up" && priority.activatedAt !== undefined) {
        const activatedDayMs = toStartOfDayMs(priority.activatedAt);
        if (isSelectedDateFuture) {
          return activatedDayMs === selectedDayMs;
        }
        return activatedDayMs <= selectedDayMs;
      }

      return false;
    });
  }, [priorities, selectedDate, today]);

  const selectedDayCompletionMs = useMemo(() => {
    const selectedDateAtNoon = new Date(selectedDate);
    selectedDateAtNoon.setHours(12, 0, 0, 0);
    return selectedDateAtNoon.getTime();
  }, [selectedDate]);

  const onCompletePriority = async (priority: HomePriority) => {
    if (updatingIds.has(priority._id)) return;
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
                    params: { priorityId: priority._id },
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
