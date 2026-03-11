import { useMemo, useState } from "react";
import { api } from "@transcend/convex";
import { useMutation, useQuery } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "@/components/ui/Text";
import { getHomeBootstrapRange } from "@/utils/homeBootstrapRange";

type InitialProject = {
  _id: string;
  name: string;
  description?: string;
};

export default function EditProjectScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const bootstrapRange = useMemo(() => getHomeBootstrapRange(), []);
  const params = useLocalSearchParams<{
    projectId: string;
    initialProject?: string;
  }>();
  const projectId = Array.isArray(params.projectId)
    ? params.projectId[0]
    : params.projectId;
  const initialProjectParam = Array.isArray(params.initialProject)
    ? params.initialProject[0]
    : params.initialProject;
  const initialProject = useMemo<InitialProject | null>(() => {
    if (!initialProjectParam) return null;
    try {
      return JSON.parse(initialProjectParam) as InitialProject;
    } catch {
      return null;
    }
  }, [initialProjectParam]);

  const projects = useQuery(
    api.projects.listProjectsForCurrentUser.listProjectsForCurrentUser,
    initialProject ? "skip" : {},
  );
  const project =
    projects?.find((item) => item._id === projectId) ??
    (initialProject && initialProject._id === projectId
      ? initialProject
      : undefined);
  const [name, setName] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const updateProject = useMutation(
    api.projects.updateProject.updateProject,
  ).withOptimisticUpdate((localStore, args) => {
    const homeBootstrap = localStore.getQuery(
      api.home.bootstrap.bootstrap,
      bootstrapRange,
    );
    if (homeBootstrap !== undefined) {
      localStore.setQuery(api.home.bootstrap.bootstrap, bootstrapRange, {
        ...homeBootstrap,
        projects: homeBootstrap.projects.map((item) =>
          item._id === args.projectId
            ? {
                ...item,
                name: args.name ?? item.name,
                description:
                  args.description === undefined
                    ? item.description
                    : (args.description ?? undefined),
                updatedAt: Date.now(),
              }
            : item,
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
        projectsForUser.map((item) =>
          item._id === args.projectId
            ? {
                ...item,
                name: args.name ?? item.name,
                description:
                  args.description === undefined
                    ? item.description
                    : (args.description ?? undefined),
                updatedAt: Date.now(),
              }
            : item,
        ),
      );
    }
  });

  const currentName = name ?? project?.name ?? "";
  const currentDescription = description ?? project?.description ?? "";
  const hasLoaded = !!project;

  const persistAndGoBack = async () => {
    if (!project || saving) return;
    const trimmedName = currentName.trim();
    if (!trimmedName) {
      Alert.alert("Project name required", "Please add a project name.");
      return;
    }

    setSaving(true);
    router.back();
    void (async () => {
      try {
        const normalizedDescription = currentDescription.trim();
        const nextDescription =
          normalizedDescription.length > 0 ? normalizedDescription : null;
        const currentStoredDescription = project.description ?? "";
        if (
          trimmedName !== project.name ||
          (nextDescription ?? "") !== currentStoredDescription
        ) {
          await updateProject({
            projectId: project._id as never,
            name: trimmedName,
            description: nextDescription,
          });
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to update project";
        Alert.alert("Could not save changes", message);
      }
    })();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "black" }}
    >
      <View
        style={{
          paddingTop: insets.top,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#1F2937",
          backgroundColor: "black",
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
          <Pressable
            onPress={() => void persistAndGoBack()}
            disabled={!hasLoaded || saving}
            style={{ padding: 6, opacity: !hasLoaded || saving ? 0.5 : 1 }}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </Pressable>
          <Text type="heading-4">Edit Project</Text>
          <View style={{ width: 36 }} />
        </View>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 20, gap: 18 }}>
        {!hasLoaded ? (
          <Text type="text-regular" color="#9CA3AF">
            Loading project...
          </Text>
        ) : null}
        <TextInput
          value={currentName}
          onChangeText={setName}
          placeholder="Project name"
          placeholderTextColor="#6B7280"
          autoFocus
          style={{
            color: "#F9FAFB",
            borderBottomWidth: 1,
            borderBottomColor: "#374151",
            paddingVertical: 8,
            fontSize: 40,
            lineHeight: 48,
            fontWeight: "600",
          }}
        />
        <TextInput
          value={currentDescription}
          onChangeText={setDescription}
          placeholder="Add a description..."
          placeholderTextColor="#6B7280"
          multiline
          textAlignVertical="top"
          style={{
            minHeight: 120,
            color: "#E5E7EB",
            fontSize: 18,
            lineHeight: 24,
            paddingTop: 2,
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
