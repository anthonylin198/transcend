import Text from "@/components/ui/Text";
import { useEffect, useState } from "react";
import { api, useMutation, useQuery } from "@transcend/convex";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Sortable from "react-native-sortables";

export default function SystemScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<"projects" | "habits">(
    "projects",
  );
  const projects = useQuery(
    api.projects.listProjectsForCurrentUser.listProjectsForCurrentUser,
    {},
  );
  const reorderProjects = useMutation(
    api.projects.reorderProjects.reorderProjects,
  );
  const habits = useQuery(
    api.habits.listHabitsForCurrentUser.listHabitsForCurrentUser,
    {},
  );
  const reorderHabits = useMutation(api.habits.reorderHabits.reorderHabits);

  const projectRows = projects ?? [];
  const habitRows = habits ?? [];
  const [orderedProjects, setOrderedProjects] = useState(projectRows);
  const [orderedHabits, setOrderedHabits] = useState(habitRows);

  useEffect(() => {
    setOrderedProjects(projects ?? []);
  }, [projects]);

  useEffect(() => {
    setOrderedHabits(habits ?? []);
  }, [habits]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "black",
        paddingHorizontal: 16,
        paddingTop: insets.top,
        paddingBottom: 12,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 40 }}>
        <Pressable
          onPress={() => setSelectedTab("projects")}
          style={{ alignItems: "center", gap: 8 }}
        >
          <Text
            type="heading-4"
            color={selectedTab === "projects" ? "#F9FAFB" : "#6B7280"}
          >
            Projects
          </Text>
          {selectedTab === "projects" ? (
            <View
              style={{
                height: 2,
                width: 90,
                borderRadius: 999,
                backgroundColor: "#2D2F36",
              }}
            />
          ) : null}
        </Pressable>
        <Pressable
          onPress={() => setSelectedTab("habits")}
          style={{ alignItems: "center", gap: 8 }}
        >
          <Text
            type="heading-4"
            color={selectedTab === "habits" ? "#F9FAFB" : "#6B7280"}
          >
            Habits
          </Text>
          {selectedTab === "habits" ? (
            <View
              style={{
                height: 2,
                width: 90,
                borderRadius: 999,
                backgroundColor: "#2D2F36",
              }}
            />
          ) : null}
        </Pressable>
      </View>

      <View
        style={{
          marginTop: 14,
          borderTopWidth: 1,
          borderTopColor: "#1F2937",
        }}
      />

      <Pressable
        onPress={() =>
          selectedTab === "projects"
            ? router.push("/(authenticated)/add-project")
            : router.push("/(authenticated)/habit/add-habit" as never)
        }
        style={{
          marginTop: 12,
          backgroundColor: "#18181B",
          borderRadius: 10,
          minHeight: 56,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <Ionicons name="add-circle-outline" size={20} color="#F3F4F6" />
        <Text type="text-semibold" color="#F3F4F6">
          {selectedTab === "projects" ? "Add Project" : "Add Habit"}
        </Text>
      </Pressable>

      <View style={{ marginTop: 18, gap: 18 }}>
        {selectedTab === "projects" ? (
          orderedProjects.length === 0 ? (
            <Text type="text-detail" color="#6B7280">
              No projects yet.
            </Text>
          ) : (
            <Sortable.Flex
              flexDirection="column"
              flexWrap="nowrap"
              gap={18}
              dragActivationDelay={220}
              onDragEnd={({ order }) => {
                const nextProjects = order(orderedProjects);
                setOrderedProjects(nextProjects);

                void reorderProjects({
                  projectIds: nextProjects.map((project) => project._id),
                });
              }}
            >
              {orderedProjects.map((project) => (
                <Pressable
                  key={project._id}
                  onPress={() =>
                    router.push({
                      pathname: "/(authenticated)/project/[projectId]",
                      params: { projectId: project._id },
                    })
                  }
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text type="text-regular" color="#E5E7EB" style={{ flex: 1 }}>
                    {project.name}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="#6B7280" />
                </Pressable>
              ))}
            </Sortable.Flex>
          )
        ) : orderedHabits.length === 0 ? (
          <Text type="text-detail" color="#6B7280">
            No habits yet.
          </Text>
        ) : (
          <Sortable.Flex
            flexDirection="column"
            flexWrap="nowrap"
            gap={18}
            dragActivationDelay={220}
            onDragEnd={({ order }) => {
              const nextHabits = order(orderedHabits);
              setOrderedHabits(nextHabits);

              void reorderHabits({
                habitIds: nextHabits.map((habit) => habit._id),
              });
            }}
          >
            {orderedHabits.map((habit) => (
              <Pressable
                key={habit._id}
                onPress={() =>
                  router.push({
                    pathname: "/(authenticated)/habit/[habitId]" as never,
                    params: { habitId: habit._id },
                  })
                }
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <Text type="text-regular" color="#E5E7EB" style={{ flex: 1 }}>
                  {habit.name}
                </Text>
                <Text type="text-detail" color="#9CA3AF">
                  {habit.habitType === "scheduled"
                    ? `${habit.targetDays?.length ?? 0} days/week`
                    : `${habit.targetCompletions ?? 1}/day`}
                </Text>
                <Ionicons name="chevron-forward" size={18} color="#6B7280" />
              </Pressable>
            ))}
          </Sortable.Flex>
        )}
      </View>

      <View style={{ flex: 1 }} />

      {selectedTab === "projects" ? (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: "#1F2937",
            paddingTop: 14,
            paddingBottom: 8,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text type="heading-4" color="#D1D5DB">
            Unlinked Priorities
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </View>
      ) : null}
    </View>
  );
}
