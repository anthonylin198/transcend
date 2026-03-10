import { useMemo, useState } from "react";
import { api, useMutation, useQuery } from "@transcend/convex";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "@/components/ui/Text";

const STATUS_SECTIONS = [
  { key: "next_up", label: "Next Up" },
  { key: "todo", label: "Backlog" },
  { key: "done", label: "Done" },
] as const;

export default function ProjectDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ projectId: string }>();
  const [menuOpen, setMenuOpen] = useState(false);
  const deleteProject = useMutation(api.projects.deleteProject.deleteProject);

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
        {STATUS_SECTIONS.map((section) => {
          const items =
            priorities?.filter((priority) => priority.status === section.key) ??
            [];

          return (
            <View key={section.key} style={{ marginBottom: 18 }}>
              <View
                style={{
                  marginBottom: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text type="text-semibold" color="#9CA3AF">
                  {section.label}
                </Text>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname:
                        "/(authenticated)/project/[projectId]/add-priority",
                      params: {
                        projectId,
                        defaultStatus: section.key,
                      },
                    })
                  }
                  style={{ padding: 4 }}
                >
                  <Ionicons name="add" size={20} color="#9CA3AF" />
                </Pressable>
              </View>

              {items.length === 0 ? (
                <Text type="text-detail" color="#6B7280">
                  No priorities
                </Text>
              ) : (
                <View style={{ gap: 14 }}>
                  {items.map((priority) => (
                    <Pressable
                      key={priority._id}
                      onPress={() =>
                        router.push({
                          pathname: "/(authenticated)/priority/[priorityId]",
                          params: {
                            priorityId: priority._id,
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
                          priority.status === "done"
                            ? "checkmark-circle"
                            : "ellipse-outline"
                        }
                        size={22}
                        color={
                          priority.status === "done" ? "#E5E7EB" : "#9CA3AF"
                        }
                      />
                      <Text
                        type="text-regular"
                        color="#E5E7EB"
                        style={{ flex: 1 }}
                      >
                        {priority.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          );
        })}
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
