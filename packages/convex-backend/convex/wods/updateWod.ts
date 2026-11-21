import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";
import { assertTitle, cleanSections, wodCategory, wodSection } from "../lib/wod";

export const updateWod = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    category: wodCategory,
    sections: v.array(wodSection),
  },
  handler: async (ctx, args) => {
    await getCurrentProfileOrThrow(ctx);
    const existing = await ctx.db
      .query("wods")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!existing) {
      throw new Error("Workout not found");
    }

    await ctx.db.patch(existing._id, {
      title: assertTitle(args.title),
      category: args.category,
      sections: cleanSections(args.sections),
      updatedAt: Date.now(),
    });
  },
});
