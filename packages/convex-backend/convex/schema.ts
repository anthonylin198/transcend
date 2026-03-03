import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  profiles: defineTable({
    userId: v.string(),
    calendarSyncEnabled: v.boolean(),
  }).index("by_user_id", ["userId"]),
  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
  }),
});
