import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  profiles: defineTable({
    userId: v.string(),
    calendarSyncEnabled: v.boolean(),
  }).index("by_user_id", ["userId"]),
  projects: defineTable({
    profileId: v.id("profiles"),
    name: v.string(),
    description: v.optional(v.string()),
    orderIndex: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_profile_id", ["profileId"])
    .index("by_profile_id_order", ["profileId", "orderIndex"]),
  priorities: defineTable({
    profileId: v.id("profiles"),
    projectId: v.optional(v.id("projects")),
    name: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("todo"), v.literal("next_up"), v.literal("done")),
    isActive: v.boolean(),
    orderIndex: v.number(),
    activatedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_profile_id", ["profileId"])
    .index("by_profile_id_order", ["profileId", "orderIndex"])
    .index("by_profile_id_status", ["profileId", "status"])
    .index("by_project_id", ["projectId"])
    .index("by_profile_id_is_active", ["profileId", "isActive"])
    .index("by_profile_id_project_id", ["profileId", "projectId"]),
  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
  }),
});
