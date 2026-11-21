import { query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listWods = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const rows = await ctx.db.query("wods").withIndex("by_order").collect();
    return rows.map((wod) => ({
      slug: wod.slug,
      title: wod.title,
      category: wod.category,
      date: wod.date,
    }));
  },
});
