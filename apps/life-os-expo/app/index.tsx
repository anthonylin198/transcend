import { useQuery } from "convex/react";
import { Text, View } from "react-native";
import { api } from "@transcend/convex/convex/_generated/api";

function TasksList() {
  const tasks = useQuery(api.tasks.get, {});

  if (tasks === undefined) {
    return <Text>Loading tasks...</Text>;
  }

  if (tasks.length === 0) {
    return <Text>No tasks found.</Text>;
  }

  return (
    <View>
      {tasks.map((task) => (
        <Text key={task._id}>
          {task.isCompleted ? "✅" : "⬜️"} {task.text}
        </Text>
      ))}
    </View>
  );
}

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        padding: 24,
      }}
    >
      <Text>Tasks from Convex</Text>
      <TasksList />
    </View>
  );
}
