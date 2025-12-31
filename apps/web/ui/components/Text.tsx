import type { ElementType, ReactNode } from "react";
import { cn } from "../lib/cn";

type TextType =
  | "kicker"
  | "heading-1"
  | "lede"
  | "heading-2"
  | "body"
  | "quote";

const TYPE_STYLES: Record<TextType, string> = {
  kicker:
    "font-[var(--font-geist-mono)] text-[11px] tracking-[0.14em] uppercase text-zinc-600 dark:text-zinc-400",
  "heading-1":
    "font-[var(--font-body)] text-[36px] leading-[1.35] tracking-[0.01em] font-medium text-(--foreground) sm:text-[36px]",
  lede:
    "font-[var(--font-body)] text-[20px] leading-[1.65] tracking-[0.005em] text-zinc-700 dark:text-zinc-300",
  "heading-2":
    "font-[var(--font-heading)] text-[20px] leading-[1.35] tracking-[0.005em] font-normal text-(--foreground)",
  body: "font-[var(--font-body)] text-[16px] leading-[1.8] text-zinc-700 dark:text-zinc-300",
  quote:
    "font-[var(--font-body)] italic text-zinc-800 dark:text-zinc-200 leading-[1.7]",
};

const DEFAULT_ELEMENT: Record<TextType, ElementType> = {
  kicker: "p",
  "heading-1": "h1",
  lede: "p",
  "heading-2": "h2",
  body: "p",
  quote: "blockquote",
};

export type TextProps<T extends ElementType = ElementType> = {
  type: TextType;
  as?: T;
  className?: string;
  children: ReactNode;
};

export function Text<T extends ElementType = ElementType>({
  type,
  as,
  className,
  children,
}: TextProps<T>) {
  const Component = (as ?? DEFAULT_ELEMENT[type]) as ElementType;
  return (
    <Component className={cn(TYPE_STYLES[type], className)}>{children}</Component>
  );
}


