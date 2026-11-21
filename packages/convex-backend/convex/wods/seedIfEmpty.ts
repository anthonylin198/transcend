import { internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { assertDateKey, wodFields } from "../lib/wod";

const SCHEDULE_KEY = "default";

export const seedIfEmpty = internalMutation({
  args: {
    cycleStart: v.string(),
    wodSlugs: v.array(v.string()),
    wods: v.array(v.object(wodFields)),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("wods").take(1);
    if (existing.length > 0) {
      return { seeded: false as const };
    }

    const cycleStart = assertDateKey(args.cycleStart);
    const seen = new Set<string>();
    const now = Date.now();
    for (const [orderIndex, wod] of args.wods.entries()) {
      if (seen.has(wod.slug)) {
        throw new Error(`Duplicate workout ${wod.slug}`);
      }
      seen.add(wod.slug);
      await ctx.db.insert("wods", {
        slug: wod.slug,
        schemaVersion: wod.schemaVersion,
        title: wod.title,
        category: wod.category,
        ...(wod.date ? { date: wod.date } : {}),
        sections: wod.sections,
        orderIndex,
        createdAt: now,
        updatedAt: now,
      });
    }

    for (const slug of args.wodSlugs) {
      if (!seen.has(slug)) {
        throw new Error(`Schedule references missing workout ${slug}`);
      }
    }

    await ctx.db.insert("wodSchedules", {
      key: SCHEDULE_KEY,
      cycleStart,
      wodSlugs: args.wodSlugs,
      updatedAt: now,
    });

    return { seeded: true as const, count: args.wods.length };
  },
});
