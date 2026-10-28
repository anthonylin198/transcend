import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  profiles: defineTable({
    userId: v.string(),
    calendarSyncEnabled: v.boolean(),
    // Device opt-in only. Step counts stay on the phone and are not stored here.
    healthSyncEnabled: v.optional(v.boolean()),
    displayName: v.optional(v.string()),
    // Viewer-specific friend order for the Friends tab and feed. May contain
    // removed friends; friends missing from it sort after it by friend date.
    friendOrder: v.optional(v.array(v.id("profiles"))),
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
    activeOrderIndex: v.optional(v.number()),
    activatedAt: v.optional(v.number()),
    activeDateKey: v.optional(v.string()),
    completedAt: v.optional(v.number()),
    completedDateKey: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_profile_id", ["profileId"])
    .index("by_profile_id_order", ["profileId", "orderIndex"])
    .index("by_profile_id_status", ["profileId", "status"])
    .index("by_profile_id_status_completed_at", [
      "profileId",
      "status",
      "completedAt",
    ])
    .index("by_profile_id_status_completed_date_key", [
      "profileId",
      "status",
      "completedDateKey",
    ])
    .index("by_project_id", ["projectId"])
    .index("by_project_id_status_order", ["projectId", "status", "orderIndex"])
    .index("by_profile_id_status_order", ["profileId", "status", "orderIndex"])
    .index("by_profile_id_is_active", ["profileId", "isActive"])
    .index("by_profile_id_project_id", ["profileId", "projectId"]),
  habits: defineTable({
    profileId: v.id("profiles"),
    name: v.string(),
    description: v.optional(v.string()),
    habitType: v.union(v.literal("scheduled"), v.literal("anytime")),
    targetDays: v.optional(v.array(v.string())),
    targetCompletions: v.optional(v.number()),
    momentum: v.number(),
    streakCount: v.number(),
    orderIndex: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_profile_id", ["profileId"])
    .index("by_profile_id_order", ["profileId", "orderIndex"]),
  habitCompletions: defineTable({
    profileId: v.id("profiles"),
    habitId: v.id("habits"),
    dateKey: v.string(),
    completedAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_profile_id", ["profileId"])
    .index("by_profile_id_completed_at", ["profileId", "completedAt"])
    .index("by_profile_id_date_key", ["profileId", "dateKey"])
    .index("by_habit_id_date_key", ["habitId", "dateKey"]),
  intakeListItems: defineTable({
    profileId: v.id("profiles"),
    title: v.string(),
    description: v.optional(v.string()),
    completed: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_profile_id", ["profileId"])
    .index("by_profile_id_created_at", ["profileId", "createdAt"]),
  calorieLogs: defineTable({
    profileId: v.id("profiles"),
    // Local calendar day (YYYY-MM-DD) supplied by the client. Not derived from createdAt.
    date: v.string(),
    calories: v.number(),
    proteinG: v.number(),
    description: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_profile_id_date", ["profileId", "date"]),
  // Reusable meals. Logging copies these values onto a calorie log.
  savedMeals: defineTable({
    profileId: v.id("profiles"),
    calories: v.number(),
    proteinG: v.number(),
    description: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_profile_id", ["profileId"]),
  workoutLogs: defineTable({
    profileId: v.id("profiles"),
    // Local calendar day (YYYY-MM-DD) supplied by the client. Not derived from createdAt.
    date: v.string(),
    description: v.string(),
    createdAt: v.number(),
  }).index("by_profile_id_date", ["profileId", "date"]),
  // One weigh-in per week. weekStart is the Sunday (YYYY-MM-DD) the client uses for that week.
  weightLogs: defineTable({
    profileId: v.id("profiles"),
    weekStart: v.string(),
    pounds: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_profile_id_week_start", ["profileId", "weekStart"]),
  friendships: defineTable({
    requesterProfileId: v.id("profiles"),
    addresseeProfileId: v.id("profiles"),
    status: v.union(v.literal("pending"), v.literal("accepted")),
    createdAt: v.number(),
    respondedAt: v.optional(v.number()),
  })
    .index("by_requester_status", ["requesterProfileId", "status"])
    .index("by_addressee_status", ["addresseeProfileId", "status"])
    .index("by_pair", ["requesterProfileId", "addresseeProfileId"]),
  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
  }),
});
