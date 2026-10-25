import Text from "@/components/ui/Text";
import { api } from "@transcend/convex";
import { useMutation, useQuery } from "convex/react";
import type { FunctionArgs } from "convex/server";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, View, useWindowDimensions } from "react-native";
import Sortable from "react-native-sortables";
import { getHomeBootstrapRange } from "@/utils/homeBootstrapRange";

type ProjectId = FunctionArgs<
  typeof api.projects.reorderProjects.reorderProjects
>["projectIds"][number];

type ProjectRow = {
  _id: ProjectId;
  name: string;
};

export default function SystemProjectsScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const reorderProjects = useMutation(
    api.projects.reorderProjects.reorderProjects,
  );
  const { rangeStartDateKey, rangeEndDateKey } = getHomeBootstrapRange();
  const homeBootstrap = useQuery(api.home.bootstrap.bootstrap, {
    rangeStartDateKey,
    rangeEndDateKey,
  });
  const projects = homeBootstrap?.projects ?? [];
  const rowWidth = Math.max(screenWidth - 32, 0);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingBottom: 72 }}>
        <Pressable
          onPress={() => router.push("/(authenticated)/add-project")}
          style={{
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
            Add Project
          </Text>
        </Pressable>

        <View style={{ marginTop: 18, gap: 18 }}>
          {projects.length === 0 ? (
            <Text type="text-detail" color="#6B7280">
              No projects yet.
            </Text>
          ) : (
            <View style={{ width: "100%", alignSelf: "stretch" }}>
              <Sortable.Flex
                flexDirection="column"
                flexWrap="nowrap"
                gap={18}
                itemEntering={null}
                dragActivationDelay={220}
                width="fill"
                enableActiveItemSnap={false}
                activeItemScale={1.03}
                onDragEnd={({ order }) => {
                  const nextProjects = order(projects as ProjectRow[]);

                  void reorderProjects({
                    projectIds: nextProjects.map((project) => project._id),
                  });
                }}
              >
                {(projects as ProjectRow[]).map((project) => (
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
                      width: rowWidth,
                    }}
                  >
                    <Text
                      type="text-regular"
                      color="#E5E7EB"
                      style={{ flex: 1, minWidth: 0 }}
                    >
                      {project.name}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#6B7280"
                    />
                  </Pressable>
                ))}
              </Sortable.Flex>
            </View>
          )}
        </View>

        <View style={{ flex: 1 }} />
      </View>

      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "black",
        }}
      >
        <Pressable
          onPress={() => router.push("/(authenticated)/project/unlinked")}
          style={{
            borderTopWidth: 1,
            borderTopColor: "#1A1A1A",
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text type="text-medium" color="#737373">
            Unlinked Priorities
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#525252" />
        </Pressable>
      </View>
    </View>
  );
}
