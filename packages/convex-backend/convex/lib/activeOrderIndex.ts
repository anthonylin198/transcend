import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

/**
 * Returns the next activeOrderIndex so newly activated priorities land at the
 * bottom of the active list. Done priorities keep isActive (and their index),
 * so they are included in the max.
 */
export async function getNextActiveOrderIndex(
  ctx: QueryCtx,
  profileId: Id<"profiles">,
) {
  const activePriorities = await ctx.db
    .query("priorities")
    .withIndex("by_profile_id_is_active", (q) =>
      q.eq("profileId", profileId).eq("isActive", true),
    )
    .collect();

  const maxIndex = activePriorities.reduce(
    (max: number, priority: Doc<"priorities">) =>
      priority.activeOrderIndex !== undefined
        ? Math.max(max, priority.activeOrderIndex)
        : max,
    -1,
  );
  return maxIndex + 1;
}
