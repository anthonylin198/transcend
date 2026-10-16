import AuthForm from "@/components/auth/AuthForm";

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
  return (
    <AuthForm
      flow="signIn"
      title={"Your life,\nin one place."}
      subtitle="Habits, priorities, and fitness, all in one system."
      submitLabel="Sign in"
      getErrorMessage={getSignInErrorMessage}
      footerPrompt="New here?"
      footerLinkLabel="Create an account"
      footerHref="/(public)/sign-up"
    />
  );
}
