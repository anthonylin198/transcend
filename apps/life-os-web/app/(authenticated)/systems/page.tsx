"use client";

import Link from "next/link";
import { useState } from "react";
import { api, useMutation, useQuery } from "@transcend/convex";

type SystemsTab = "projects" | "habits";

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function SystemsPage() {
  const [selectedTab, setSelectedTab] = useState<SystemsTab>("projects");
  const [newProjectName, setNewProjectName] = useState("");
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitDays, setNewHabitDays] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const homeBootstrap = useQuery(api.home.bootstrap.bootstrap, {});
  const createProject = useMutation(api.projects.createProject.createProject);
  const createHabit = useMutation(api.habits.createHabit.createHabit);

  const projects = homeBootstrap?.projects ?? [];
  const habits = homeBootstrap?.habits ?? [];

  const onCreateProject = async () => {
    const name = newProjectName.trim();
    if (!name || saving) return;
    setSaving(true);
    try {
      await createProject({ name });
      setNewProjectName("");
    } finally {
      setSaving(false);
    }
  };

  const onCreateHabit = async () => {
    const name = newHabitName.trim();
    if (!name || newHabitDays.length === 0 || saving) return;
    setSaving(true);
    try {
      await createHabit({
        name,
        habitType: "scheduled",
        targetDays: newHabitDays,
      });
      setNewHabitName("");
      setNewHabitDays([]);
    } finally {
      setSaving(false);
    }
  };

  const toggleHabitDay = (day: string) => {
    setNewHabitDays((prev) =>
      prev.includes(day)
        ? prev.filter((value) => value !== day)
        : [...prev, day],
    );
  };

  return (
    <main className="space-y-6">
      <section className="flex items-center gap-3">
        <button
          type="button"
          className={`rounded-md px-3 py-1.5 text-sm ${
            selectedTab === "projects"
              ? "bg-zinc-200 text-black"
              : "border border-zinc-700 text-zinc-300"
          }`}
          onClick={() => setSelectedTab("projects")}
        >
          Projects
        </button>
        <button
          type="button"
          className={`rounded-md px-3 py-1.5 text-sm ${
            selectedTab === "habits"
              ? "bg-zinc-200 text-black"
              : "border border-zinc-700 text-zinc-300"
          }`}
          onClick={() => setSelectedTab("habits")}
        >
          Habits
        </button>
      </section>

      {selectedTab === "projects" ? (
        <>
          <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
            <h2 className="text-base font-semibold">Add Project</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <input
                value={newProjectName}
                onChange={(event) => setNewProjectName(event.target.value)}
                placeholder="Project name"
                className="min-w-64 flex-1 rounded-md border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-500"
              />
              <button
                type="button"
                onClick={() => void onCreateProject()}
                disabled={saving || !newProjectName.trim()}
                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </section>

          <section className="rounded-lg border border-zinc-800 bg-zinc-950">
            {projects.length === 0 ? (
              <p className="p-4 text-sm text-zinc-400">No projects yet.</p>
            ) : (
              projects.map((project) => (
                <Link
                  key={project._id}
                  href={`/systems/project/${project._id}`}
                  className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 text-sm text-zinc-200 last:border-b-0 hover:bg-zinc-900"
                >
                  <span>{project.name}</span>
                  <span className="text-zinc-500">Details</span>
                </Link>
              ))
            )}
          </section>
        </>
      ) : (
        <>
          <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
            <h2 className="text-base font-semibold">Add Habit</h2>
            <div className="mt-3 space-y-3">
              <input
                value={newHabitName}
                onChange={(event) => setNewHabitName(event.target.value)}
                placeholder="Habit name"
                className="w-full rounded-md border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-500"
              />
              <div>
                <p className="mb-2 text-xs text-zinc-400">Days of week</p>
                <div className="flex flex-wrap gap-2">
                  {WEEK_DAYS.map((day) => {
                    const active = newHabitDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleHabitDay(day)}
                        className={`rounded-md border px-2.5 py-1 text-xs ${
                          active
                            ? "border-zinc-200 bg-zinc-200 text-black"
                            : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                type="button"
                onClick={() => void onCreateHabit()}
                disabled={
                  saving || !newHabitName.trim() || newHabitDays.length === 0
                }
                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </section>

          <section className="rounded-lg border border-zinc-800 bg-zinc-950">
            {habits.length === 0 ? (
              <p className="p-4 text-sm text-zinc-400">No habits yet.</p>
            ) : (
              habits.map((habit) => (
                <Link
                  key={habit._id}
                  href={`/systems/habit/${habit._id}`}
                  className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 text-sm text-zinc-200 last:border-b-0 hover:bg-zinc-900"
                >
                  <span>{habit.name}</span>
                  <span className="text-zinc-500">Details</span>
                </Link>
              ))
            )}
          </section>
        </>
      )}
    </main>
  );
}
