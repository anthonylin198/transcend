/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as habits_createHabit from "../habits/createHabit.js";
import type * as habits_deleteHabit from "../habits/deleteHabit.js";
import type * as habits_listHabitsForCurrentUser from "../habits/listHabitsForCurrentUser.js";
import type * as habits_reorderHabits from "../habits/reorderHabits.js";
import type * as habits_setHabitCompletion from "../habits/setHabitCompletion.js";
import type * as habits_updateHabit from "../habits/updateHabit.js";
import type * as home_bootstrap from "../home/bootstrap.js";
import type * as http from "../http.js";
import type * as intake_createIntakeListItem from "../intake/createIntakeListItem.js";
import type * as intake_deleteIntakeListItem from "../intake/deleteIntakeListItem.js";
import type * as intake_listIntakeListItemsForCurrentUser from "../intake/listIntakeListItemsForCurrentUser.js";
import type * as intake_setIntakeListItemCompletion from "../intake/setIntakeListItemCompletion.js";
import type * as intake_updateIntakeListItem from "../intake/updateIntakeListItem.js";
import type * as lib_activeOrderIndex from "../lib/activeOrderIndex.js";
import type * as lib_currentProfile from "../lib/currentProfile.js";
import type * as priorities_assignPriorityToProject from "../priorities/assignPriorityToProject.js";
import type * as priorities_createPriority from "../priorities/createPriority.js";
import type * as priorities_deletePriority from "../priorities/deletePriority.js";
import type * as priorities_listDonePriorities from "../priorities/listDonePriorities.js";
import type * as priorities_listPrioritiesByProject from "../priorities/listPrioritiesByProject.js";
import type * as priorities_listPrioritiesForCurrentUser from "../priorities/listPrioritiesForCurrentUser.js";
import type * as priorities_reorderActivePriorities from "../priorities/reorderActivePriorities.js";
import type * as priorities_reorderPriorities from "../priorities/reorderPriorities.js";
import type * as priorities_setPriorityActive from "../priorities/setPriorityActive.js";
import type * as priorities_setPriorityStatus from "../priorities/setPriorityStatus.js";
import type * as priorities_unassignPriorityFromProject from "../priorities/unassignPriorityFromProject.js";
import type * as priorities_updatePriority from "../priorities/updatePriority.js";
import type * as profile from "../profile.js";
import type * as projects_createProject from "../projects/createProject.js";
import type * as projects_deleteProject from "../projects/deleteProject.js";
import type * as projects_listProjectsForCurrentUser from "../projects/listProjectsForCurrentUser.js";
import type * as projects_reorderProjects from "../projects/reorderProjects.js";
import type * as projects_updateProject from "../projects/updateProject.js";
import type * as tasks from "../tasks.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "habits/createHabit": typeof habits_createHabit;
  "habits/deleteHabit": typeof habits_deleteHabit;
  "habits/listHabitsForCurrentUser": typeof habits_listHabitsForCurrentUser;
  "habits/reorderHabits": typeof habits_reorderHabits;
  "habits/setHabitCompletion": typeof habits_setHabitCompletion;
  "habits/updateHabit": typeof habits_updateHabit;
  "home/bootstrap": typeof home_bootstrap;
  http: typeof http;
  "intake/createIntakeListItem": typeof intake_createIntakeListItem;
  "intake/deleteIntakeListItem": typeof intake_deleteIntakeListItem;
  "intake/listIntakeListItemsForCurrentUser": typeof intake_listIntakeListItemsForCurrentUser;
  "intake/setIntakeListItemCompletion": typeof intake_setIntakeListItemCompletion;
  "intake/updateIntakeListItem": typeof intake_updateIntakeListItem;
  "lib/activeOrderIndex": typeof lib_activeOrderIndex;
  "lib/currentProfile": typeof lib_currentProfile;
  "priorities/assignPriorityToProject": typeof priorities_assignPriorityToProject;
  "priorities/createPriority": typeof priorities_createPriority;
  "priorities/deletePriority": typeof priorities_deletePriority;
  "priorities/listDonePriorities": typeof priorities_listDonePriorities;
  "priorities/listPrioritiesByProject": typeof priorities_listPrioritiesByProject;
  "priorities/listPrioritiesForCurrentUser": typeof priorities_listPrioritiesForCurrentUser;
  "priorities/reorderActivePriorities": typeof priorities_reorderActivePriorities;
  "priorities/reorderPriorities": typeof priorities_reorderPriorities;
  "priorities/setPriorityActive": typeof priorities_setPriorityActive;
  "priorities/setPriorityStatus": typeof priorities_setPriorityStatus;
  "priorities/unassignPriorityFromProject": typeof priorities_unassignPriorityFromProject;
  "priorities/updatePriority": typeof priorities_updatePriority;
  profile: typeof profile;
  "projects/createProject": typeof projects_createProject;
  "projects/deleteProject": typeof projects_deleteProject;
  "projects/listProjectsForCurrentUser": typeof projects_listProjectsForCurrentUser;
  "projects/reorderProjects": typeof projects_reorderProjects;
  "projects/updateProject": typeof projects_updateProject;
  tasks: typeof tasks;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
