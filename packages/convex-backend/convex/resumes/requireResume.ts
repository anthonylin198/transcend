import type { MutationCtx } from "../_generated/server";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

const MAX_TITLE_LENGTH = 120;
const MAX_CONTENT_LENGTH = 500_000;

export function requireResumeTitle(value: string) {
  const title = value.trim();
  if (!title) {
    throw new Error("Title is required");
  }
  if (title.length > MAX_TITLE_LENGTH) {
    throw new Error("Title must be 120 characters or fewer");
  }
  return title;
}

export function requireResumeContent(value: string) {
  if (value.length > MAX_CONTENT_LENGTH) {
    throw new Error("Resume is too large");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error("Resume must be valid JSON");
  }

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Resume must be a JSON object");
  }

  return value;
}

export function duplicateResumeTitle(title: string) {
  const suffix = " copy";
  if (title.length + suffix.length <= MAX_TITLE_LENGTH) {
    return `${title}${suffix}`;
  }
  return `${title.slice(0, MAX_TITLE_LENGTH - suffix.length).trimEnd()}${suffix}`;
}

export async function getOwnedResumeOrThrow(
  ctx: MutationCtx,
  resumeId: string,
) {
  const profile = await getCurrentProfileOrThrow(ctx);
  const id = ctx.db.normalizeId("resumes", resumeId);
  if (!id) {
    throw new Error("Resume not found");
  }

  const resume = await ctx.db.get(id);
  if (!resume || resume.profileId !== profile._id) {
    throw new Error("Resume not found");
  }

  return resume;
}
