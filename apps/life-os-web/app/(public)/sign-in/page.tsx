"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { getSignInErrorMessage } from "@/lib/auth";

export default function SignInPage() {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !password || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("email", email.trim());
      formData.append("password", password);
      formData.append("flow", "signIn");
      await signIn("password", formData);
    } catch (submitError) {
      setError(getSignInErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  const disableSubmit = submitting || !email.trim() || !password;

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-5">
      <form
        onSubmit={(event) => void onSubmit(event)}
        className="w-full max-w-md space-y-5 rounded-xl border border-zinc-800 bg-zinc-950 p-6"
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-zinc-100">Sign in</h1>
          <p className="text-sm text-zinc-400">
            Enter your email and password to continue.
          </p>
        </div>

        <div className="space-y-3">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            autoComplete="email"
            placeholder="Email"
            className="w-full rounded-md border border-zinc-800 bg-black px-3 py-2 text-zinc-100 outline-none ring-zinc-500 placeholder:text-zinc-500 focus:ring-2"
            disabled={submitting}
          />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            className="w-full rounded-md border border-zinc-800 bg-black px-3 py-2 text-zinc-100 outline-none ring-zinc-500 placeholder:text-zinc-500 focus:ring-2"
            disabled={submitting}
          />
        </div>

        {error ? <p className="text-sm text-red-300">{error}</p> : null}

        <button
          type="submit"
          disabled={disableSubmit}
          className="w-full rounded-md bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-300"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
