import { useEffect, useMemo, useState } from "react";
import { api, useMutation, useQuery } from "@transcend/convex";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Sortable from "react-native-sortables";
import Text from "@/components/ui/Text";

const STATUS_SECTIONS = [
  { key: "next_up", label: "Next Up" },
  { key: "todo", label: "Todo" },
  { key: "done", label: "Done" },
] as const;

export default function ProjectDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ projectId: string }>();
  const [menuOpen, setMenuOpen] = useState(false);
  const deleteProject = useMutation(api.projects.deleteProject.deleteProject);
  const reorderPriorities = useMutation(
    api.priorities.reorderPriorities.reorderPriorities,
  );

  const projectId = useMemo(() => {
    if (Array.isArray(params.projectId)) {
      return params.projectId[0];
    }
    return params.projectId;
  }, [params.projectId]);

  const projects = useQuery(
    api.projects.listProjectsForCurrentUser.listProjectsForCurrentUser,
    {},
  );
  const project = projects?.find((item) => item._id === projectId);

  const priorities = useQuery(
    api.priorities.listPrioritiesByProject.listPrioritiesByProject,
    projectId ? { projectId: projectId as never } : "skip",
  );

  const [orderedPriorities, setOrderedPriorities] = useState<
    NonNullable<typeof priorities>
  >([]);

  useEffect(() => {
    setOrderedPriorities(priorities ?? []);
  }, [priorities]);

  const sortableRows = useMemo(() => {
    const rows: (
      | {
          type: "label";
          key: string;
          status: (typeof STATUS_SECTIONS)[number]["key"];
          label: string;
        }
      | {
          type: "priority";
          key: string;
          priority: (typeof orderedPriorities)[number];
        }
    )[] = [];

    for (const section of STATUS_SECTIONS) {
      rows.push({
        type: "label",
        key: `label-${section.key}`,
        status: section.key,
        label: section.label,
      });

      for (const priority of orderedPriorities) {
        if (priority.status === section.key) {
          rows.push({
            type: "priority",
            key: priority._id,
            priority,
          });
        }
      }
    }

    return rows;
  }, [orderedPriorities]);

  const onDeleteProject = async () => {
    if (!projectId) return;
    await deleteProject({ projectId: projectId as never });
    setMenuOpen(false);
    router.replace("/(authenticated)/(tabs)/system");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <View
        style={{
          paddingTop: insets.top,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#1F2937",
        }}
      >
        <View
          style={{
            minHeight: 56,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Pressable onPress={() => router.back()} style={{ padding: 6 }}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </Pressable>
          <Text type="heading-4">{project?.name ?? "Project"}</Text>
          <Pressable onPress={() => setMenuOpen(true)} style={{ padding: 6 }}>
            <Ionicons name="ellipsis-horizontal" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <Sortable.Flex
          flexDirection="column"
          flexWrap="nowrap"
          gap={14}
          customHandle
          dragActivationDelay={220}
          onDragEnd={({ order }) => {
            if (!projectId) return;

            const nextRows = order(sortableRows);
            const nextUpLabelIndex = nextRows.findIndex(
              (row) => row.type === "label" && row.status === "next_up",
            );

            const backlogLabelIndex = nextRows.findIndex(
              (row) => row.type === "label" && row.status === "todo",
            );
            const doneLabelIndex = nextRows.findIndex(
              (row) => row.type === "label" && row.status === "done",
            );
            const nextPriorities: typeof orderedPriorities = [];

            nextRows.forEach((row, rowIndex) => {
              if (row.type === "label") {
                return;
              }

              let nextStatus: (typeof STATUS_SECTIONS)[number]["key"] =
                "next_up";
              if (nextUpLabelIndex !== -1 && rowIndex <= nextUpLabelIndex) {
                nextStatus = "next_up";
              } else if (doneLabelIndex !== -1 && rowIndex > doneLabelIndex) {
                nextStatus = "done";
              } else if (
                backlogLabelIndex !== -1 &&
                rowIndex > backlogLabelIndex
              ) {
                nextStatus = "todo";
              }

              nextPriorities.push({
                ...row.priority,
                status: nextStatus,
              });
            });

            if (nextPriorities.length !== orderedPriorities.length) {
              // Guard against malformed drag output so we never persist partial data.
              return;
            }

            setOrderedPriorities(nextPriorities);

            void reorderPriorities({
              items: nextPriorities.map((priority) => ({
                priorityId: priority._id as never,
                status: priority.status,
              })),
              projectId: projectId as never,
            });
          }}
        >
          {sortableRows.map((row) =>
            row.type === "label" ? (
              <View
                key={row.key}
                style={{
                  marginTop: row.status === "next_up" ? 0 : 4,
                  marginBottom: 4,
                }}
              >
                <Text type="text-semibold" color="#9CA3AF">
                  {row.label}
                </Text>
              </View>
            ) : (
              <Sortable.Handle key={row.key}>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/(authenticated)/priority/[priorityId]",
                      params: {
                        priorityId: row.priority._id,
                        projectId,
                      },
                    })
                  }
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Ionicons
                    name={
                      row.priority.status === "done"
                        ? "checkmark-circle"
                        : "ellipse-outline"
                    }
                    size={22}
                    color={
                      row.priority.status === "done" ? "#E5E7EB" : "#9CA3AF"
                    }
                  />
                  <Text type="text-regular" color="#E5E7EB" style={{ flex: 1 }}>
                    {row.priority.name}
                  </Text>
                </Pressable>
              </Sortable.Handle>
            ),
          )}
        </Sortable.Flex>
      </ScrollView>

      <Modal visible={menuOpen} transparent animationType="fade">
        <Pressable
          onPress={() => setMenuOpen(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
            padding: 16,
          }}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={{
              backgroundColor: "#111827",
              borderWidth: 1,
              borderColor: "#1F2937",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <Pressable
              onPress={() => void onDeleteProject()}
              style={{ paddingHorizontal: 16, paddingVertical: 14 }}
            >
              <Text type="text-semibold" color="#F87171">
                Delete Project
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
