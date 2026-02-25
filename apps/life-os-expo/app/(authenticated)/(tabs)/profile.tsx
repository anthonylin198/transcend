import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import Text from "@/components/ui/Text";
import { Pressable, View } from "react-native";

export default function ProfileScreen() {
  const { signOut } = useAuthActions();
  const [submitting, setSubmitting] = useState(false);

  const onSignOut = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await signOut();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        gap: 16,
      }}
    >
      <Text type="heading-4">
        Profile
      </Text>
      <Pressable
        onPress={() => void onSignOut()}
        disabled={submitting}
        style={{
          backgroundColor: "white",
          borderRadius: 10,
          paddingHorizontal: 16,
          paddingVertical: 10,
          opacity: submitting ? 0.6 : 1,
        }}
      >
        <Text type="text-semibold" color="black">
          {submitting ? "Signing out..." : "Sign out"}
        </Text>
      </Pressable>
    </View>
  );
}
