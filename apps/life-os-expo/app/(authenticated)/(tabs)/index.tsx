import { api, useQuery } from "@transcend/convex";
import { Text, View } from "react-native";

function TasksList() {
  const tasks = useQuery(api.tasks.get, {});

  if (tasks === undefined) {
    return <Text style={{ color: "white" }}>Loading tasks...</Text>;
  }

  if (tasks.length === 0) {
    return <Text style={{ color: "white" }}>No tasks found.</Text>;
  }

  return (
    <View style={{ gap: 6 }}>
      {tasks.map((task) => (
        <Text key={task._id} style={{ color: "white" }}>
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
      <Text style={{ color: "white", fontSize: 20, fontWeight: "600" }}>
        Home
      </Text>
      <TasksList />
    </View>
  );
}
