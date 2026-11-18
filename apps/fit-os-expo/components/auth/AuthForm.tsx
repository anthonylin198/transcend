import { useState } from "react";
import { Link, type Href } from "expo-router";
import { useAuthActions } from "@convex-dev/auth/react";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Eyebrow from "@/components/ui/Eyebrow";
import Rings from "@/components/ui/Rings";
import Text from "@/components/ui/Text";
import { appFonts } from "@/constants/fonts";

type AuthFormProps = {
  flow: "signIn" | "signUp";
  title: string;
  subtitle: string;
  submitLabel: string;
  passwordHint?: string;
  getErrorMessage: (error: unknown) => string;
  validate?: (email: string, password: string) => string | null;
  footerPrompt: string;
  footerLinkLabel: string;
  footerHref: Href;
};

function Field({
  label,
  hint,
  ...inputProps
}: TextInputProps & { label: string; hint?: string }) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ gap: 8 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <Eyebrow color={focused ? "#D4D4D4" : "#737373"}>{label}</Eyebrow>
        {hint ? (
          <Text type="text-detail" color="#525252" style={{ fontSize: 12 }}>
            {hint}
          </Text>
        ) : null}
      </View>
      <TextInput
        {...inputProps}
        accessibilityLabel={label}
        placeholderTextColor="#404040"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          color: "#FAFAFA",
          fontFamily: appFonts.medium,
          fontSize: 18,
          lineHeight: 24,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: focused ? "#A3A3A3" : "#262626",
        }}
      />
    </View>
  );
}

export default function AuthForm({
  flow,
  title,
  subtitle,
  submitLabel,
  passwordHint,
  getErrorMessage,
  validate,
  footerPrompt,
  footerLinkLabel,
  footerHref,
}: AuthFormProps) {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const disabled = submitting || !email || !password;

  const onSubmit = async () => {
    if (disabled) return;
    const validationError = validate?.(email, password) ?? null;
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("email", email.trim());
      formData.append("password", password);
      formData.append("flow", flow);
      await signIn("password", formData);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "black", overflow: "hidden" }}>
      <Rings size={460} overhang={170} color="#171717" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            width: "100%",
            maxWidth: 480,
            alignSelf: "center",
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: 28,
          }}
        >
          <Eyebrow color="#A3A3A3">LIFEOS</Eyebrow>

          <View style={{ flex: 1, minHeight: 64 }} />

          <Text
            accessibilityRole="header"
            style={{
              fontFamily: appFonts.semiBold,
              fontSize: 44,
              lineHeight: 48,
              letterSpacing: -1.6,
            }}
          >
            {title}
          </Text>
          <Text
            type="text-regular"
            color="#737373"
            style={{ marginTop: 12, maxWidth: 320 }}
          >
            {subtitle}
          </Text>

          <View style={{ marginTop: 40, gap: 28 }}>
            <Field
              label="EMAIL"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              keyboardType="email-address"
              inputMode="email"
              textContentType="emailAddress"
              placeholder="you@email.com"
              editable={!submitting}
              returnKeyType="next"
            />
            <Field
              label="PASSWORD"
              hint={passwordHint}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              textContentType={flow === "signUp" ? "newPassword" : "password"}
              placeholder="••••••••"
              editable={!submitting}
              returnKeyType="go"
              onSubmitEditing={() => void onSubmit()}
            />
          </View>

          {error ? (
            <Text type="text-detail" color="#F87171" style={{ marginTop: 20 }}>
              {error}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={submitLabel}
            onPress={() => void onSubmit()}
            disabled={disabled}
            style={({ pressed }) => ({
              marginTop: 36,
              height: 56,
              borderRadius: 14,
              backgroundColor: disabled && !submitting ? "#171717" : "#FFFFFF",
              borderWidth: 1,
              borderColor: disabled && !submitting ? "#262626" : "#FFFFFF",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            {submitting ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <>
                <Text
                  type="text-semibold"
                  color={disabled ? "#525252" : "#000000"}
                >
                  {submitLabel}
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={disabled ? "#525252" : "#000000"}
                />
              </>
            )}
          </Pressable>

          <View
            style={{
              marginTop: 28,
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Text type="text-regular" color="#737373">
              {footerPrompt}{" "}
            </Text>
            <Link href={footerHref} replace>
              <Text type="text-semibold">{footerLinkLabel}</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
