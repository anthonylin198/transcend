import Text from "@/components/ui/Text";
import {
  Tabs,
  TabList,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
} from "expo-router/ui";
import { Ref } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const unstable_settings = {
  initialRouteName: "projects",
};

type SystemSubtabButtonProps = TabTriggerSlotProps & {
  label: string;
  ref?: Ref<View>;
};

function SystemSubtabButton({
  label,
  isFocused,
  ...props
}: SystemSubtabButtonProps) {
  return (
    <Pressable {...props}>
      <Text type="heading-4" color={isFocused ? "#F9FAFB" : "#6B7280"}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function SystemLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs>
      <View
        style={{
          flex: 1,
          backgroundColor: "black",
          paddingTop: insets.top,
          paddingBottom: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 40,
            paddingHorizontal: 16,
          }}
        >
          <TabTrigger name="projects" asChild>
            <SystemSubtabButton
              label="Projects"
              style={{ alignItems: "center", gap: 8 }}
            />
          </TabTrigger>
          <TabTrigger name="habits" asChild>
            <SystemSubtabButton
              label="Habits"
              style={{ alignItems: "center", gap: 8 }}
            />
          </TabTrigger>
        </View>

        <View style={{ flex: 1, marginTop: 20 }}>
          <TabSlot />
        </View>
      </View>

      <TabList style={{ display: "none" }}>
        <TabTrigger
          name="projects"
          href="/(authenticated)/(tabs)/system/projects"
        />
        <TabTrigger
          name="habits"
          href="/(authenticated)/(tabs)/system/habits"
        />
      </TabList>
    </Tabs>
  );
}
