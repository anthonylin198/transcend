import { useRef, useState } from "react";
import { api } from "@transcend/convex";
import type { OptimisticLocalStore } from "convex/browser";
import { useMutation } from "convex/react";
import type { FunctionArgs } from "convex/server";
import { appFonts } from "@/constants/fonts";
import Text from "@/components/ui/Text";
import { toLocalDateKey } from "@/utils/calorieWeek";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";

const MAX_DESCRIPTION_LENGTH = 500;

type LogWorkoutModalProps = {
  visible: boolean;
  onClose: () => void;
};

type CreateWorkoutLogArgs = FunctionArgs<
  typeof api.workoutLogs.createWorkoutLog.createWorkoutLog
>;

function applyCreateWorkoutLogOptimisticUpdate(
  localStore: OptimisticLocalStore,
  args: CreateWorkoutLogArgs,
) {
  const now = Date.now();
  const bootstrapQueries = localStore.getAllQueries(
    api.home.bootstrap.bootstrap,
  );
  for (const { args: queryArgs, value } of bootstrapQueries) {
    if (!value || value.profile === null) continue;
    const inRange =
      args.date >= queryArgs.rangeStartDateKey &&
      args.date < queryArgs.rangeEndDateKey;
    if (!inRange) continue;

    const optimisticId =
      `optimistic-workout-${now}` as (typeof value.workoutLogs)[number]["_id"];
    localStore.setQuery(api.home.bootstrap.bootstrap, queryArgs, {
      ...value,
      workoutLogs: [
        ...value.workoutLogs,
        {
          _id: optimisticId,
          _creationTime: now,
          profileId: value.profile._id,
          date: args.date,
          description: args.description.trim(),
          createdAt: now,
        },
      ],
    });
  }
}

function LogWorkoutForm({ onClose }: { onClose: () => void }) {
  const createWorkoutLog = useMutation(
    api.workoutLogs.createWorkoutLog.createWorkoutLog,
  ).withOptimisticUpdate((localStore, args) => {
    applyCreateWorkoutLogOptimisticUpdate(localStore, args);
  });
  const savingRef = useRef(false);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const requestClose = () => {
    if (savingRef.current) return;
    onClose();
  };

  const onSave = async () => {
    if (savingRef.current) return;

    if (!description.trim()) {
      setError("Describe your workout.");
      return;
    }

    savingRef.current = true;
    setSaving(true);
    setError(null);
    try {
      await createWorkoutLog({
        date: toLocalDateKey(new Date()),
        description,
      });
      onClose();
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Could not save workout";
      setError(message);
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={requestClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.64)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <Pressable
            accessibilityLabel="Dismiss log workout"
            accessibilityRole="button"
            onPress={requestClose}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            }}
          />
          <View
            accessibilityViewIsModal
            style={{
              zIndex: 1,
              alignSelf: "center",
              width: "100%",
              maxWidth: 420,
              backgroundColor: "#111111",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#2A2A2A",
              padding: 20,
              gap: 16,
            }}
          >
            <Text type="heading-4" accessibilityRole="header">
              Log Workout
            </Text>

            <View style={{ gap: 6 }}>
              <Text type="text-detail" color="#9CA3AF">
                What did you do?
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                maxLength={MAX_DESCRIPTION_LENGTH}
                multiline
                placeholder="e.g. 5k run, upper body lifts"
                placeholderTextColor="#6B7280"
                accessibilityLabel="Workout description"
                autoFocus
                editable={!saving}
                style={{
                  color: "#F9FAFB",
                  borderBottomWidth: 1,
                  borderBottomColor: "#374151",
                  fontFamily: appFonts.regular,
                  fontSize: 18,
                  lineHeight: 24,
                  minHeight: 72,
                  maxHeight: 160,
                  paddingVertical: 8,
                  textAlignVertical: "top",
                }}
              />
            </View>

            {error ? (
              <Text type="text-detail" color="#F87171">
                {error}
              </Text>
            ) : null}

            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                accessibilityRole="button"
                onPress={requestClose}
                disabled={saving}
                style={{
                  flex: 1,
                  minHeight: 48,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: "#374151",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                <Text type="text-semibold">Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => void onSave()}
                disabled={saving}
                style={{
                  flex: 1,
                  minHeight: 48,
                  borderRadius: 10,
                  backgroundColor: saving ? "#374151" : "#F3F4F6",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  type="text-semibold"
                  color={saving ? "#9CA3AF" : "#111827"}
                >
                  {saving ? "Saving..." : "Save Workout"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function LogWorkoutModal({
  visible,
  onClose,
}: LogWorkoutModalProps) {
  if (!visible) return null;
  return <LogWorkoutForm onClose={onClose} />;
}
