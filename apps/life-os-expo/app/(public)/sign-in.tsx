import { useState } from "react";
import { Link } from "expo-router";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

function getSignInErrorMessage(error: unknown) {
  const message =
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
      ? (error as { message: string }).message
      : "";

  const normalized = message.toLowerCase();
  if (normalized.includes("invalid credentials")) {
    return "Invalid email or password.";
  }
  if (normalized.includes("missing `email`")) {
    return "Please enter your email address.";
  }
  if (normalized.includes("missing `password`")) {
    return "Please enter your password.";
  }
  return "Unable to sign in. Please check your credentials and try again.";
}

export default function SignInScreen() {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!email || !password || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("email", email.trim());
      formData.append("password", password);
      formData.append("flow", "signIn");
      await signIn("password", formData);
    } catch (error) {
      setError(getSignInErrorMessage(error));
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
      <Text style={{ color: "white", fontSize: 28, fontWeight: "700" }}>
        Sign in
      </Text>
      <Text style={{ color: "#9CA3AF", marginBottom: 12 }}>
        Enter your email and password to continue.
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

      {error ? <Text style={{ color: "#FCA5A5" }}>{error}</Text> : null}

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
          <Text style={{ color: "black", fontWeight: "600", fontSize: 16 }}>
            Sign in
          </Text>
        )}
      </Pressable>

      <View style={{ flexDirection: "row", marginTop: 8 }}>
        <Text style={{ color: "#9CA3AF" }}>Need an account? </Text>
        <Link href="/(public)/sign-up" style={{ color: "white" }}>
          Sign up
        </Link>
      </View>
    </View>
  );
}
