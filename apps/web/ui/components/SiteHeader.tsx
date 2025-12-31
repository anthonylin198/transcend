 "use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "../lib/cn";

type MenuKey = "articles" | "apps";

type NavItem =
  | { kind: "link"; href: string; label: string; meta?: string };

const ARTICLES: NavItem[] = [
  {
    kind: "link",
    href: "/articles/what-being-a-good-person-means-to-me",
    label: "What being a good person means to me",
  },
  {
    kind: "link",
    href: "/articles/why-i-think-incentives-are-so-important",
    label: "Why I think incentives are so important",
  },
];

const APPS: NavItem[] = [
  { kind: "link", href: "/apps/life-os", label: "Life OS" },
  { kind: "link", href: "/apps/reboot", label: "Reboot", meta: "Coming soon" },
];

function MenuButton({
  label,
  isOpen,
  onClick,
}: {
  label: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-expanded={isOpen}
      className={cn(
        "rounded-md px-2 py-1 font-[var(--font-geist-mono)] text-[12px] tracking-[0.12em] uppercase transition-colors",
        "text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50",
        isOpen && "text-zinc-950 dark:text-zinc-50",
      )}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function Dropdown({
  items,
  onNavigate,
}: {
  items: NavItem[];
  onNavigate: () => void;
}) {
  return (
    <div className="absolute right-0 z-20 mt-2 min-w-[220px] rounded-xl border border-zinc-200/20 bg-[color:var(--background)]/95 p-2 shadow-sm backdrop-blur dark:border-zinc-200/10">
      {items.map((item) => {
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-[13px] text-zinc-800 hover:bg-zinc-200/20 dark:text-zinc-200 dark:hover:bg-zinc-200/10"
          >
            <span>{item.label}</span>
            {item.meta ? (
              <span className="shrink-0 text-[11px] tracking-wide uppercase text-zinc-500 dark:text-zinc-500">
                {item.meta}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}

export function SiteHeader() {
  const rootRef = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState<MenuKey | null>(null);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      const root = rootRef.current;
      if (!root) return;
      if (e.target instanceof Node && !root.contains(e.target)) {
        setOpen(null);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(null);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <header
      ref={rootRef}
      className="fixed inset-x-0 top-0 z-30 border-b border-zinc-200/20 bg-[color:var(--background)] dark:border-zinc-200/10"
    >
      <nav className="mx-auto flex h-12 w-full max-w-[980px] items-center justify-between px-3 sm:h-14 sm:px-6">
        <Link
          href="/"
          className="rounded-md px-2 py-1 font-[var(--font-geist-mono)] text-[12px] tracking-[0.14em] uppercase text-zinc-800 transition-colors hover:text-zinc-950 dark:text-zinc-200 dark:hover:text-zinc-50"
          onClick={() => setOpen(null)}
        >
          Home
        </Link>

        <div className="flex items-center gap-1 sm:gap-3">
          <div className="relative">
            <MenuButton
              label="Articles"
              isOpen={open === "articles"}
              onClick={() =>
                setOpen((cur) => (cur === "articles" ? null : "articles"))
              }
            />
            {open === "articles" ? (
              <Dropdown items={ARTICLES} onNavigate={() => setOpen(null)} />
            ) : null}
          </div>

          <div className="relative">
            <MenuButton
              label="Apps"
              isOpen={open === "apps"}
              onClick={() => setOpen((cur) => (cur === "apps" ? null : "apps"))}
            />
            {open === "apps" ? (
              <Dropdown items={APPS} onNavigate={() => setOpen(null)} />
            ) : null}
          </div>
        </div>
      </nav>
    </header>
  );
}


