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
    <View style={{ gap: 6 }}>
      {tasks.map((task) => (
        <Text key={task._id} type="text-regular">
          {task.isCompleted ? "✅" : "⬜️"} {task.text}
        </Text>
      ))}
    </View>
  );
}

export default function HomeScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        padding: 24,
      }}
    >
      <Text type="heading-1">
        Home
      </Text>
      <TasksList />
    </View>
  );
}
