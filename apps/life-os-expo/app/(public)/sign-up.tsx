import AuthForm from "@/components/auth/AuthForm";

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

function validateSignUp(_email: string, password: string) {
  return password.length < 8 ? "Password must be at least 8 characters." : null;
}

export default function SignUpScreen() {
  return (
    <AuthForm
      flow="signUp"
      title={"Build your\nsystem."}
      subtitle="Track habits, priorities, and fitness in one place."
      submitLabel="Create account"
      passwordHint="8+ characters"
      getErrorMessage={getSignUpErrorMessage}
      validate={validateSignUp}
      footerPrompt="Already have an account?"
      footerLinkLabel="Sign in"
      footerHref="/(public)/sign-in"
    />
  );
}
