import type { PersonalInfo } from "./types";

export type ContactKind =
  | "location"
  | "phone"
  | "email"
  | "github"
  | "linkedin"
  | "website";

export interface ContactItem {
  kind: ContactKind;
  label: string;
  href?: string;
}

const FIELDS: Array<{ kind: ContactKind; key: keyof PersonalInfo }> = [
  { kind: "phone", key: "phone" },
  { kind: "email", key: "email" },
  { kind: "location", key: "location" },
  { kind: "github", key: "github" },
  { kind: "linkedin", key: "linkedin" },
  { kind: "website", key: "website" },
];

function withProtocol(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function contactHref(kind: ContactKind, value: string): string | undefined {
  if (kind === "location") return undefined;
  if (
    /^https?:\/\//i.test(value) ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:")
  ) {
    return value;
  }

  if (kind === "email") return `mailto:${value}`;

  if (kind === "phone") {
    const digits = value.replace(/[^\d+]/g, "");
    return digits ? `tel:${digits}` : undefined;
  }

  if (kind === "github") {
    const path = value.replace(/^(www\.)?github\.com\//i, "").replace(/^@/, "");
    return `https://github.com/${path}`;
  }

  if (kind === "linkedin") {
    if (/linkedin\.com/i.test(value)) return withProtocol(value);
    return `https://www.linkedin.com/in/${value.replace(/^@/, "")}`;
  }

  return withProtocol(value);
}

/** Contact line, in display order, skipping anything left blank. */
export function contactItems(personal: PersonalInfo): ContactItem[] {
  const items: ContactItem[] = [];

  for (const field of FIELDS) {
    const raw = personal[field.key];
    if (typeof raw !== "string") continue;
    const label = raw.trim();
    if (!label) continue;
    items.push({
      kind: field.kind,
      label,
      href: contactHref(field.kind, label),
    });
  }

  return items;
}
