import { useState } from "react";
import { Link } from "expo-router";
import { useAuthActions } from "@convex-dev/auth/react";
import { api, useMutation } from "@transcend/convex";
import Text from "@/components/ui/Text";
import { ActivityIndicator, Pressable, TextInput, View } from "react-native";

function getSignUpErrorMessage(error: unknown) {
  const message =
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
      ? (error as { message: string }).message
      : "";

  const normalized = message.toLowerCase();
  if (normalized.includes("invalid password")) {
    return "Password must be at least 8 characters.";
  }
  if (normalized.includes("already") || normalized.includes("exists")) {
    return "An account with this email already exists. Try signing in.";
  }
  if (normalized.includes("missing `email`")) {
    return "Please enter a valid email address.";
  }
  if (normalized.includes("missing `password`")) {
    return "Please enter a password.";
  }
  return "Unable to sign up. Try another email or try again.";
}

export default function SignUpScreen() {
  const { signIn } = useAuthActions();
  const ensureProfile = useMutation(api.profile.ensureProfile);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!email || !password || submitting) return;
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("email", email.trim());
      formData.append("password", password);
      formData.append("flow", "signUp");
      await signIn("password", formData);
      await ensureProfile({});
    } catch (error) {
      setError(getSignUpErrorMessage(error));
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
        padding: 24,
        gap: 12,
      }}
    >
      <Text type="heading-3">Sign up</Text>
      <Text type="text-regular" color="#9CA3AF" style={{ marginBottom: 12 }}>
        Create an account with email and password.
      </Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        placeholder="Email"
        placeholderTextColor="#6B7280"
        editable={!submitting}
        style={{
          backgroundColor: "#111827",
          color: "white",
          borderRadius: 10,
          paddingHorizontal: 14,
          paddingVertical: 12,
        }}
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
        placeholder="Password"
        placeholderTextColor="#6B7280"
        editable={!submitting}
        style={{
          backgroundColor: "#111827",
          color: "white",
          borderRadius: 10,
          paddingHorizontal: 14,
          paddingVertical: 12,
        }}
      />

      {error ? (
        <Text type="text-regular" color="#FCA5A5">
          {error}
        </Text>
      ) : null}

      <Pressable
        onPress={() => void onSubmit()}
        disabled={submitting || !email || !password}
        style={{
          backgroundColor:
            submitting || !email || !password ? "#374151" : "#fff",
          borderRadius: 10,
          paddingVertical: 12,
          alignItems: "center",
          marginTop: 8,
        }}
      >
        {submitting ? (
          <ActivityIndicator color="black" />
        ) : (
          <Text type="text-semibold" color="black">
            Create account
          </Text>
        )}
      </Pressable>

      <View style={{ flexDirection: "row", marginTop: 8 }}>
        <Text type="text-regular" color="#9CA3AF">
          Already have an account?{" "}
        </Text>
        <Link href="/(public)/sign-in">
          <Text type="text-medium">Sign in</Text>
        </Link>
      </View>
    </View>
  );
}
