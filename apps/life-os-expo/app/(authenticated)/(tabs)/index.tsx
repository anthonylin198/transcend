import Text from "@/components/ui/Text";
import { Pressable, ScrollView, View } from "react-native";

const calendarItems = [
  { time: "8:00 AM", title: "Morning deep work", status: "upcoming" },
  { time: "12:00 PM", title: "Lunch + walk", status: "upcoming" },
  { time: "6:30 PM", title: "Triathlon training", status: "upcoming" },
] as const;

const priorities = [
  "Amex card Trisha follow up",
  "Book hotel for May Triathlon",
  "Get ambulance study materials",
  "Shop around insurance",
  "Join apply gsuite cancels",
];

const habits = [
  "Wake up at 5:30am",
  "Morning meditation at least 15 mins + journal/read",
  "Workout",
  "Evening stretch routine",
  "Electronics off at 9pm and prep for next day workout",
];

function ChecklistItem({ text }: { text: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: "#E5E7EB",
        }}
      />
      <Text type="text-regular">{text}</Text>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: "black",
        }}
        contentContainerStyle={{ padding: 20, paddingBottom: 150, gap: 24 }}
      >
        <View style={{ alignItems: "center", marginTop: 28, gap: 4 }}>
          <Text type="heading-4" color="#E5E7EB">
            Good evening
          </Text>
          <Text type="text-medium" color="#9CA3AF">
            Tue · February 24
          </Text>
        </View>

        <View style={{ gap: 8 }}>
          <Text type="heading-4" color="#E5E7EB" style={{ lineHeight: 30 }}>
            A good life is built in small, repeated choices.
          </Text>
        </View>

        <View style={{ gap: 10 }}>
          <Text type="heading-4" color="#9CA3AF">
            Calendar
          </Text>
          <View style={{ gap: 10 }}>
            {calendarItems.map((item) => (
              <Text key={`${item.time}-${item.title}`} type="text-regular">
                {item.time} - {item.title}
              </Text>
            ))}
          </View>
          {/* Future behavior: show only today's upcoming items by default. */}
          {/* If an event end-time passes and it's still incomplete, render crossed-out + faded. */}
          {/* Completed events should use explicit "done" state, not just time-passed state. */}
        </View>

        <View style={{ gap: 14 }}>
          <Text type="heading-4" color="#9CA3AF">
            Priorities
          </Text>
          <View style={{ gap: 14 }}>
            {priorities.map((item) => (
              <ChecklistItem key={item} text={item} />
            ))}
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <Text type="heading-3" color="#9CA3AF">
                +
              </Text>
              <Text type="text-medium" color="#9CA3AF">
                Quick add
              </Text>
            </View>
          </View>
        </View>

        <View style={{ gap: 14 }}>
          <Text type="heading-4" color="#9CA3AF">
            Habits
          </Text>
          <View style={{ gap: 14 }}>
            {habits.map((item) => (
              <ChecklistItem key={item} text={item} />
            ))}
          </View>
        </View>
      </ScrollView>

      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "black",
          zIndex: 20,
        }}
      >
        <Pressable
          style={{
            borderTopWidth: 1,
            borderTopColor: "#1F2937",
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 10,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text type="text-medium" color="#9CA3AF">
            View Intake List
          </Text>
          <Text type="heading-4" color="#9CA3AF">
            ›
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
