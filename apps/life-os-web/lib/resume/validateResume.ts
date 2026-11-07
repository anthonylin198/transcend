import type {
  CertificationItem,
  CustomItem,
  EducationItem,
  ExperienceItem,
  ExperienceRole,
  PersonalInfo,
  ProjectItem,
  Resume,
  ResumeSection,
  SkillItem,
} from "./types";

export type ParseResult =
  | { ok: true; resume: Resume }
  | { ok: false; error: string };

const PERSONAL_STRINGS = [
  "title",
  "tagline",
  "location",
  "phone",
  "email",
  "github",
  "linkedin",
  "website",
  "photo",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function formatSyntaxError(text: string, error: unknown): string {
  const message = error instanceof Error ? error.message : "Invalid JSON";
  const positionMatch = message.match(/position (\d+)/i);
  if (!positionMatch) return `Invalid JSON: ${message}`;

  const position = Number(positionMatch[1]);
  const before = text.slice(0, position);
  const line = before.split("\n").length;
  const column = position - before.lastIndexOf("\n");
  const cleaned = message.replace(/\s+in JSON at position \d+/i, "");
  return `Invalid JSON at line ${line}, column ${column}: ${cleaned}`;
}

function optionalStringError(value: unknown, label: string): string | null {
  if (value === undefined) return null;
  if (typeof value !== "string") return `${label} must be a string.`;
  return null;
}

function bulletError(value: unknown, label: string): string | null {
  if (value === undefined) return null;
  if (!Array.isArray(value)) return `${label} must be an array of strings.`;
  for (let index = 0; index < value.length; index += 1) {
    if (typeof value[index] !== "string") {
      return `${label}[${index}] must be a string.`;
    }
  }
  return null;
}

function trimmed(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function optional(value: unknown): string | undefined {
  const text = trimmed(value);
  return text || undefined;
}

function bulletsOf(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((bullet): bullet is string => typeof bullet === "string")
    .map((bullet) => bullet.trim())
    .filter(Boolean);
}

function validateItem(
  item: unknown,
  sectionType: string,
  sectionIndex: number,
  itemIndex: number,
): string | null {
  const label = `sections[${sectionIndex}].items[${itemIndex}]`;
  if (!isRecord(item)) return `${label} must be an object.`;

  const bullets = bulletError(item.bullets, `${label}.bullets`);
  if (bullets) return bullets;

  if (sectionType === "skills") {
    if (typeof item.label !== "string" || item.label.trim() === "") {
      return `${label}.label must be a non-empty string.`;
    }
    return optionalStringError(item.value, `${label}.value`);
  }

  if (sectionType === "education") {
    if (
      typeof item.institution !== "string" ||
      item.institution.trim() === ""
    ) {
      return `${label}.institution must be a non-empty string.`;
    }
    for (const field of ["degree", "location", "date"] as const) {
      const error = optionalStringError(item[field], `${label}.${field}`);
      if (error) return error;
    }
    return null;
  }

  if (sectionType === "experience") {
    if (
      typeof item.organization !== "string" ||
      item.organization.trim() === ""
    ) {
      return `${label}.organization must be a non-empty string.`;
    }
    for (const field of ["position", "location", "date"] as const) {
      const error = optionalStringError(item[field], `${label}.${field}`);
      if (error) return error;
    }
    if (item.roles !== undefined) {
      if (!Array.isArray(item.roles)) return `${label}.roles must be an array.`;
      for (let roleIndex = 0; roleIndex < item.roles.length; roleIndex += 1) {
        const role = item.roles[roleIndex];
        const roleLabel = `${label}.roles[${roleIndex}]`;
        if (!isRecord(role)) return `${roleLabel} must be an object.`;
        for (const field of ["position", "title", "role", "date"] as const) {
          const error = optionalStringError(
            role[field],
            `${roleLabel}.${field}`,
          );
          if (error) return error;
        }
      }
    }
    return null;
  }

  if (sectionType === "projects") {
    if (typeof item.name !== "string" || item.name.trim() === "") {
      return `${label}.name must be a non-empty string.`;
    }
    for (const field of ["location", "date"] as const) {
      const error = optionalStringError(item[field], `${label}.${field}`);
      if (error) return error;
    }
    return null;
  }

  if (sectionType === "certifications") {
    if (typeof item.name !== "string" || item.name.trim() === "") {
      return `${label}.name must be a non-empty string.`;
    }
    for (const field of ["issuer", "location", "date"] as const) {
      const error = optionalStringError(item[field], `${label}.${field}`);
      if (error) return error;
    }
    return null;
  }

  if (sectionType === "summary") {
    if (typeof item.text !== "string" || item.text.trim() === "") {
      return `${label}.text must be a non-empty string.`;
    }
    return null;
  }

  const heading =
    optional(item.heading) ||
    optional(item.name) ||
    optional(item.title) ||
    optional(item.organization) ||
    optional(item.institution);
  const hasBullets =
    Array.isArray(item.bullets) &&
    item.bullets.some(
      (bullet) => typeof bullet === "string" && bullet.trim() !== "",
    );
  if (!heading && !hasBullets) {
    return `${label} needs a heading, name, title, or bullets.`;
  }
  for (const field of [
    "subheading",
    "subtitle",
    "position",
    "role",
    "location",
    "date",
  ] as const) {
    const error = optionalStringError(item[field], `${label}.${field}`);
    if (error) return error;
  }
  return null;
}

function validateSection(section: unknown, index: number): string | null {
  const label = `sections[${index}]`;
  if (!isRecord(section)) return `${label} must be an object.`;
  if (typeof section.type !== "string" || section.type.trim() === "") {
    return `${label}.type must be a non-empty string such as "experience" or "custom".`;
  }
  if (typeof section.title !== "string" || section.title.trim() === "") {
    return `${label}.title must be a non-empty string.`;
  }
  if (!Array.isArray(section.items)) return `${label}.items must be an array.`;

  for (let itemIndex = 0; itemIndex < section.items.length; itemIndex += 1) {
    const error = validateItem(
      section.items[itemIndex],
      section.type,
      index,
      itemIndex,
    );
    if (error) return error;
  }
  return null;
}

export function validateResume(data: unknown): string | null {
  if (!isRecord(data)) return "Resume must be a JSON object.";
  if (!isRecord(data.personal))
    return 'Add a "personal" object with at least a name.';
  if (
    typeof data.personal.name !== "string" ||
    data.personal.name.trim() === ""
  ) {
    return "personal.name must be a non-empty string.";
  }

  for (const key of PERSONAL_STRINGS) {
    const error = optionalStringError(data.personal[key], `personal.${key}`);
    if (error) return error;
  }

  if (!Array.isArray(data.sections)) {
    return 'Add a "sections" array. Use [] when the resume has no sections yet.';
  }

  for (let index = 0; index < data.sections.length; index += 1) {
    const error = validateSection(data.sections[index], index);
    if (error) return error;
  }

  return null;
}

function personalFrom(value: Record<string, unknown>): PersonalInfo {
  return {
    name: trimmed(value.name),
    title: optional(value.title),
    tagline: optional(value.tagline),
    location: optional(value.location),
    phone: optional(value.phone),
    email: optional(value.email),
    github: optional(value.github),
    linkedin: optional(value.linkedin),
    website: optional(value.website),
    photo: optional(value.photo),
  };
}

function experienceRoles(item: Record<string, unknown>): ExperienceRole[] {
  if (Array.isArray(item.roles) && item.roles.length > 0) {
    return item.roles.filter(isRecord).flatMap((role) => {
      const position =
        optional(role.position) || optional(role.title) || optional(role.role);
      const date = optional(role.date);
      return position || date ? [{ position, date }] : [];
    });
  }

  const position = optional(item.position);
  const date = optional(item.date);
  return position || date ? [{ position, date }] : [];
}

function customFrom(item: Record<string, unknown>): CustomItem {
  return {
    heading:
      optional(item.heading) ||
      optional(item.name) ||
      optional(item.title) ||
      optional(item.organization) ||
      optional(item.institution),
    subheading:
      optional(item.subheading) ||
      optional(item.subtitle) ||
      optional(item.position) ||
      optional(item.role) ||
      optional(item.degree) ||
      optional(item.issuer),
    location: optional(item.location),
    date: optional(item.date),
    bullets: bulletsOf(item.bullets),
  };
}

function sectionFrom(section: Record<string, unknown>): ResumeSection {
  const title = trimmed(section.title);
  const type = trimmed(section.type);
  const items = Array.isArray(section.items)
    ? section.items.filter(isRecord)
    : [];

  if (type === "education") {
    return {
      type,
      title,
      items: items.map(
        (item): EducationItem => ({
          institution: trimmed(item.institution),
          degree: optional(item.degree),
          location: optional(item.location),
          date: optional(item.date),
          bullets: bulletsOf(item.bullets),
        }),
      ),
    };
  }

  if (type === "skills") {
    return {
      type,
      title,
      items: items
        .map(
          (item): SkillItem => ({
            label: trimmed(item.label),
            value: trimmed(item.value),
          }),
        )
        .filter((item) => item.label || item.value),
    };
  }

  if (type === "experience") {
    return {
      type,
      title,
      items: items.map(
        (item): ExperienceItem => ({
          organization: trimmed(item.organization),
          location: optional(item.location),
          roles: experienceRoles(item),
          bullets: bulletsOf(item.bullets),
        }),
      ),
    };
  }

  if (type === "projects") {
    return {
      type,
      title,
      items: items.map(
        (item): ProjectItem => ({
          name: trimmed(item.name),
          location: optional(item.location),
          date: optional(item.date),
          bullets: bulletsOf(item.bullets),
        }),
      ),
    };
  }

  if (type === "certifications") {
    return {
      type,
      title,
      items: items.map(
        (item): CertificationItem => ({
          name: trimmed(item.name),
          issuer: optional(item.issuer),
          location: optional(item.location),
          date: optional(item.date),
          bullets: bulletsOf(item.bullets),
        }),
      ),
    };
  }

  if (type === "summary") {
    return {
      type,
      title,
      items: items
        .map((item) => ({ text: trimmed(item.text) }))
        .filter((item) => item.text),
    };
  }

  return {
    type: "custom",
    title,
    items: items
      .map(customFrom)
      .filter((item) => item.heading || item.bullets.length > 0),
  };
}

function normalizeResume(data: Record<string, unknown>): Resume {
  const personal = isRecord(data.personal)
    ? personalFrom(data.personal)
    : { name: "" };
  const sections = Array.isArray(data.sections)
    ? data.sections.filter(isRecord).map(sectionFrom)
    : [];
  return { personal, sections };
}

export function parseResumeJson(text: string): ParseResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (error) {
    return { ok: false, error: formatSyntaxError(text, error) };
  }

  const error = validateResume(data);
  if (error) return { ok: false, error };
  if (!isRecord(data))
    return { ok: false, error: "Resume must be a JSON object." };
  return { ok: true, resume: normalizeResume(data) };
}
