import { api, useQuery } from "@transcend/convex";
import Text from "@/components/ui/Text";
import { View } from "react-native";

function TasksList() {
  const tasks = useQuery(api.tasks.get, {});

  if (tasks === undefined) {
    return <Text type="text-regular">Loading tasks...</Text>;
  }

  if (tasks.length === 0) {
    return <Text type="text-regular">No tasks found.</Text>;
  }

  return (
    <View style={{ gap: 10 }}>
      {tasks.map((task) => (
        <Text key={task._id} type="text-regular">
          {task.isCompleted ? "✅" : "⬜️"} {task.text}
        </Text>
      ))}
    </View>
  );
}

export default function SystemScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "black",
        padding: 24,
        gap: 14,
      }}
    >
      <Text type="heading-4">System</Text>
      <Text type="text-detail" color="#9CA3AF">
        Placeholder backend fetch lives here for now.
      </Text>
      <TasksList />
    </View>
  );
}
