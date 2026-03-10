"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

const NAV_ITEMS = [
  { href: "/home", label: "Home" },
  { href: "/systems", label: "Systems" },
  { href: "/intake", label: "Intake" },
];

export function AppTopNav() {
  const pathname = usePathname();
  const { signOut } = useAuthActions();
  const [submitting, setSubmitting] = useState(false);

  const handleSignOut = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await signOut();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <header className="border-b border-zinc-800 bg-black/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-4">
        <div className="flex items-center gap-5">
          <Link
            href="/home"
            className="text-sm font-semibold tracking-wide text-zinc-100"
          >
            LifeOS
          </Link>
          <nav className="flex items-center gap-2">
            {NAV_ITEMS.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-1.5 text-sm transition ${
                    active
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <button
          type="button"
          onClick={() => void handleSignOut()}
          disabled={submitting}
          className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 transition hover:bg-zinc-900 disabled:opacity-60"
        >
          {submitting ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </header>
  );
}
