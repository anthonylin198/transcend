import { useState } from "react";
import { api } from "@transcend/convex";
import type { FunctionReturnType } from "convex/server";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import Text from "@/components/ui/Text";
import { appFonts } from "@/constants/fonts";
import { calloutLine, rollCallout } from "@/utils/challengeCallout";
import { formatCalories } from "@/utils/calorieWeek";

export type StepChallenge = NonNullable<
  FunctionReturnType<
    typeof api.challenges.stepChallengeForWeek.stepChallengeForWeek
  >
>;

function fillRatio(steps: number, goal: number) {
  if (goal <= 0) return 0;
  return Math.min(1, steps / goal);
}

function ProgressBar({
  steps,
  goal,
  height = 10,
}: {
  steps: number;
  goal: number;
  height?: number;
}) {
  return (
    <View
      style={{
        height,
        borderRadius: 999,
        backgroundColor: "#1C1C1C",
        overflow: "hidden",
      }}
    >
      <View
        style={{
          width: `${fillRatio(steps, goal) * 100}%`,
          height: "100%",
          borderRadius: 999,
          backgroundColor: "#FFFFFF",
        }}
      />
    </View>
  );
}

export default function StepChallengeCard({
  challenge,
  weekLabel,
  showToday,
}: {
  challenge: StepChallenge;
  weekLabel: string;
  showToday: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [callout] = useState(() =>
    showToday ? rollCallout(challenge.contributions) : null,
  );
  const reached = challenge.totalSteps >= challenge.goalSteps;
  const title = challenge.name.trim() || "Step challenge";
  const hasImage = Boolean(challenge.imageUrl);
  const featured =
    !hasImage && callout
      ? challenge.contributions.find(
          (person) => person.profileId === callout.profileId,
        )
      : undefined;
  const caption =
    featured && callout
      ? calloutLine(callout, featured.name, formatCalories(featured.todaySteps))
      : null;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${formatCalories(challenge.totalSteps)} of ${formatCalories(challenge.goalSteps)} steps. ${caption ?? "View contributions."}`}
        onPress={() => setOpen(true)}
        style={({ pressed }) => ({
          overflow: "hidden",
          borderRadius: 18,
          borderWidth: 1,
          borderColor: "#262626",
          backgroundColor: "#0A0A0A",
          minHeight: hasImage ? 196 : undefined,
          opacity: pressed ? 0.86 : 1,
        })}
      >
        {challenge.imageUrl ? (
          <Image
            source={{ uri: challenge.imageUrl }}
            contentFit="contain"
            contentPosition="bottom right"
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              width: "48%",
              height: "100%",
            }}
          />
        ) : null}
        <View
          style={{
            zIndex: 1,
            paddingHorizontal: 16,
            paddingVertical: 16,
            gap: 14,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <Text type="text-semibold" numberOfLines={2} style={{ flex: 1 }}>
              {title}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#737373" />
          </View>
          <View style={{ gap: 14 }}>
            <View style={{ paddingRight: hasImage ? 140 : 0, gap: 4 }}>
              <Text
                style={{
                  fontFamily: appFonts.semiBold,
                  fontSize: 32,
                  lineHeight: 36,
                  letterSpacing: -0.8,
                  color: "#FFFFFF",
                }}
              >
                {formatCalories(challenge.totalSteps)}
              </Text>
              <Text type="text-medium" color="#A3A3A3">
                of {formatCalories(challenge.goalSteps)} steps
              </Text>
            </View>
            <ProgressBar
              steps={challenge.totalSteps}
              goal={challenge.goalSteps}
            />
            {caption ? (
              <Text type="text-medium" style={{ lineHeight: 22 }}>
                {caption}
              </Text>
            ) : null}
            {reached ? (
              <Text type="text-detail" color="#737373">
                Goal reached
              </Text>
            ) : null}
          </View>
        </View>
      </Pressable>

      <Modal
        visible={open}
        animationType="fade"
        transparent
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            padding: 24,
            backgroundColor: "rgba(0,0,0,0.72)",
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close contributions"
            onPress={() => setOpen(false)}
            style={StyleSheet.absoluteFill}
          />
          <View
            accessibilityViewIsModal
            style={{
              zIndex: 1,
              alignSelf: "center",
              width: "100%",
              maxWidth: 420,
              maxHeight: "80%",
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "#262626",
              backgroundColor: "#111111",
              paddingTop: 20,
              paddingBottom: 8,
            }}
          >
            <View
              style={{
                paddingHorizontal: 20,
                gap: 6,
                flexDirection: "row",
                alignItems: "flex-start",
              }}
            >
              <View style={{ flex: 1, gap: 6 }}>
                <Text type="heading-4" numberOfLines={2}>
                  {title}
                </Text>
                <Text type="text-detail" color="#9CA3AF">
                  {weekLabel} · {formatCalories(challenge.totalSteps)} of{" "}
                  {formatCalories(challenge.goalSteps)}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close contributions"
                onPress={() => setOpen(false)}
                hitSlop={8}
                style={{ padding: 4 }}
              >
                <Ionicons name="close" size={20} color="#A3A3A3" />
              </Pressable>
            </View>
            <ScrollView
              style={{ marginTop: 8, maxHeight: 360 }}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingBottom: 12,
              }}
            >
              {challenge.contributions.map((person) => (
                <View
                  key={person.profileId}
                  style={{
                    paddingVertical: 14,
                    gap: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: "#1F1F1F",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <Text
                      type="text-semibold"
                      numberOfLines={1}
                      style={{ flex: 1 }}
                    >
                      {person.name}
                    </Text>
                    <Text type="text-medium" color="#D4D4D4">
                      {formatCalories(person.steps)}
                    </Text>
                  </View>
                  <ProgressBar
                    steps={person.steps}
                    goal={challenge.goalSteps}
                    height={6}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
