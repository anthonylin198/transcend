import { useMemo, useState } from "react";
import { api } from "@transcend/convex";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Sortable from "react-native-sortables";
import Text from "@/components/ui/Text";
import { getHomeBootstrapRange } from "@/utils/homeBootstrapRange";

const STATUS_SECTIONS = [
  { key: "next_up", label: "Next Up" },
  { key: "todo", label: "Todo" },
  { key: "done", label: "Done" },
] as const;

export default function ProjectDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  // Rows need an explicit width inside Sortable.Flex. This screen's content
  // has 16px of horizontal padding on each side.
  const rowWidth = Math.max(screenWidth - 32, 0);
  const bootstrapRange = useMemo(() => getHomeBootstrapRange(), []);
  const params = useLocalSearchParams<{ projectId: string }>();
  const [menuOpen, setMenuOpen] = useState(false);
  const deleteProject = useMutation(
    api.projects.deleteProject.deleteProject,
  ).withOptimisticUpdate((localStore, args) => {
    const bootstrap = localStore.getQuery(
      api.home.bootstrap.bootstrap,
      bootstrapRange,
    );
    if (bootstrap !== undefined && bootstrap.profile) {
      localStore.setQuery(api.home.bootstrap.bootstrap, bootstrapRange, {
        ...bootstrap,
        projects: bootstrap.projects.filter(
          (item) => item._id !== args.projectId,
        ),
        priorities: bootstrap.priorities.filter(
          (item) => item.projectId !== args.projectId,
        ),
        categories: bootstrap.categories.filter(
          (item) => item.projectId !== args.projectId,
        ),
      });
    }

    const projectsForUser = localStore.getQuery(
      api.projects.listProjectsForCurrentUser.listProjectsForCurrentUser,
      {},
    );
    if (projectsForUser !== undefined) {
      localStore.setQuery(
        api.projects.listProjectsForCurrentUser.listProjectsForCurrentUser,
        {},
        projectsForUser.filter((item) => item._id !== args.projectId),
      );
    }

    const projectPriorities = localStore.getQuery(
      api.priorities.listPrioritiesByProject.listPrioritiesByProject,
      { projectId: args.projectId, excludeDone: true },
    );
    if (projectPriorities !== undefined) {
      localStore.setQuery(
        api.priorities.listPrioritiesByProject.listPrioritiesByProject,
        { projectId: args.projectId, excludeDone: true },
        [],
      );
    }
  });
  const reorderPriorities = useMutation(
    api.priorities.reorderPriorities.reorderPriorities,
  );

  const projectId = Array.isArray(params.projectId)
    ? params.projectId[0]
    : params.projectId;
  const isUnlinkedView = projectId === "unlinked";

  const projects = useQuery(
    api.projects.listProjectsForCurrentUser.listProjectsForCurrentUser,
    {},
  );
  const project = projects?.find((item) => item._id === projectId);

  const projectPriorities = useQuery(
    api.priorities.listPrioritiesByProject.listPrioritiesByProject,
    !isUnlinkedView && projectId
      ? { projectId: projectId as never, excludeDone: true }
      : "skip",
  );
  const unlinkedPriorities = useQuery(
    api.priorities.listPrioritiesForCurrentUser.listPrioritiesForCurrentUser,
    isUnlinkedView ? { unlinkedOnly: true, excludeDone: true } : "skip",
  );
  const donePriorities = usePaginatedQuery(
    api.priorities.listDonePriorities.listDonePriorities,
    projectId
      ? isUnlinkedView
        ? {}
        : { projectId: projectId as never }
      : "skip",
    { initialNumItems: 5 },
  );
  const priorities = isUnlinkedView ? unlinkedPriorities : projectPriorities;
  const isLoading = projects === undefined || priorities === undefined;
  const priorityRows = priorities ?? [];
  const doneRows = donePriorities.results;

  const onDeleteProject = async () => {
    if (!projectId) return;
    setMenuOpen(false);
    router.back();
    void deleteProject({ projectId: projectId as never });
  };

  const onEditProject = () => {
    if (!projectId) return;
    setMenuOpen(false);
    router.push({
      pathname: "/(authenticated)/project/[projectId]/edit" as never,
      params: project
        ? {
            projectId,
            initialProject: JSON.stringify(project),
          }
        : { projectId },
    });
  };

  if (!projectId) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "black",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text type="text-regular" color="#9CA3AF">
          Missing project id.
        </Text>
      </View>
    );
  }

  const sortableRows: (
    | {
        type: "label";
        key: string;
        status: (typeof STATUS_SECTIONS)[number]["key"];
        label: string;
      }
    | {
        type: "priority";
        key: string;
        priority: (typeof priorityRows)[number];
      }
  )[] = [];

  if (!isLoading) {
    for (const section of STATUS_SECTIONS) {
      sortableRows.push({
        type: "label",
        key: `label-${section.key}`,
        status: section.key,
        label: section.label,
      });

      const sectionRows =
        section.key === "done"
          ? doneRows
          : priorityRows.filter((priority) => priority.status === section.key);
      for (const priority of sectionRows) {
        sortableRows.push({
          type: "priority",
          key: priority._id,
          priority,
        });
      }
    }
  }

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
          <Text type="heading-4">
            {isUnlinkedView
              ? "Unlinked Priorities"
              : (project?.name ?? "Project")}
          </Text>
          {isUnlinkedView ? (
            <View style={{ width: 36 }} />
          ) : (
            <Pressable onPress={() => setMenuOpen(true)} style={{ padding: 6 }}>
              <Ionicons name="ellipsis-horizontal" size={22} color="#FFFFFF" />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <Sortable.Flex
          flexDirection="column"
          flexWrap="nowrap"
          gap={14}
          itemEntering={null}
          width="fill"
          customHandle
          dragActivationDelay={220}
          enableActiveItemSnap={false}
          activeItemScale={1.03}
          onDragEnd={({ order }) => {
            const currentPriorities = priorities;
            if (!projectId || currentPriorities === undefined) return;

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
            const nextPriorities: typeof currentPriorities = [];

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

            if (
              nextPriorities.length !==
              currentPriorities.length + doneRows.length
            ) {
              // Guard against malformed drag output so we never persist partial data.
              return;
            }

            void reorderPriorities({
              items: nextPriorities.map((priority) => ({
                priorityId: priority._id as never,
                status: priority.status,
              })),
              projectId: isUnlinkedView ? null : (projectId as never),
            });
          }}
        >
          {isLoading ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                paddingVertical: 20,
              }}
            >
              <ActivityIndicator size="small" color="#9CA3AF" />
              <Text type="text-regular" color="#9CA3AF">
                {isUnlinkedView
                  ? "Loading priorities..."
                  : "Loading project..."}
              </Text>
            </View>
          ) : null}
          {sortableRows.map((row) =>
            row.type === "label" ? (
              <View
                key={row.key}
                style={{
                  marginTop: row.status === "next_up" ? 0 : 4,
                  marginBottom: 4,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: rowWidth,
                }}
              >
                <Text type="text-semibold" color="#9CA3AF">
                  {row.label}
                </Text>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname:
                        "/(authenticated)/project/[projectId]/add-priority",
                      params: {
                        projectId,
                        defaultStatus: row.status,
                        defaultIsActive: "false",
                      },
                    })
                  }
                  hitSlop={8}
                  style={{ paddingHorizontal: 2, paddingVertical: 2 }}
                >
                  <Ionicons name="add" size={20} color="#9CA3AF" />
                </Pressable>
              </View>
            ) : (
              <Sortable.Handle key={row.key} style={{ width: rowWidth }}>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/(authenticated)/priority/[priorityId]",
                      params: isUnlinkedView
                        ? {
                            priorityId: row.priority._id,
                            initialPriority: JSON.stringify(row.priority),
                          }
                        : {
                            priorityId: row.priority._id,
                            projectId,
                            initialPriority: JSON.stringify(row.priority),
                          },
                    })
                  }
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
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
                  <Text
                    type="text-regular"
                    color="#E5E7EB"
                    style={{ flex: 1, flexShrink: 1 }}
                  >
                    {row.priority.name}
                  </Text>
                </Pressable>
              </Sortable.Handle>
            ),
          )}
        </Sortable.Flex>

        {!isLoading ? (
          <View style={{ marginTop: 14, gap: 14 }}>
            {donePriorities.status === "LoadingFirstPage" ||
            donePriorities.status === "LoadingMore" ? (
              <ActivityIndicator size="small" color="#9CA3AF" />
            ) : null}
            {donePriorities.status === "CanLoadMore" ? (
              <Pressable
                onPress={() => donePriorities.loadMore(10)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingVertical: 4,
                }}
              >
                <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
                <Text type="text-detail" color="#9CA3AF">
                  Show more done items
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      {!isUnlinkedView ? (
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
                onPress={onEditProject}
                style={{ paddingHorizontal: 16, paddingVertical: 14 }}
              >
                <Text type="text-regular" color="#F3F4F6">
                  Edit Project
                </Text>
              </Pressable>
              <Pressable
                onPress={() => void onDeleteProject()}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderTopWidth: 1,
                  borderTopColor: "#1F2937",
                }}
              >
                <Text type="text-semibold" color="#F87171">
                  Delete Project
                </Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}
