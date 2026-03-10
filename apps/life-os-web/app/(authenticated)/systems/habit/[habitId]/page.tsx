"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { api, useMutation, useQuery } from "@transcend/convex";

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function HabitDetailsPage() {
  const params = useParams<{ habitId: string }>();
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const homeBootstrap = useQuery(api.home.bootstrap.bootstrap, {});
  const updateHabit = useMutation(api.habits.updateHabit.updateHabit);
  const deleteHabit = useMutation(api.habits.deleteHabit.deleteHabit);

  const habit = useMemo(
    () => homeBootstrap?.habits.find((item) => item._id === params.habitId),
    [homeBootstrap?.habits, params.habitId],
  );

  const currentName = name ?? habit?.name ?? "";
  const currentDescription = description ?? habit?.description ?? "";
  const currentSelectedDays =
    selectedDays ??
    (habit?.targetDays && habit.targetDays.length > 0
      ? habit.targetDays
      : WEEK_DAYS.slice(0, 3));

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => {
      const base = prev ?? currentSelectedDays;
      if (base.includes(day)) {
        return base.filter((value) => value !== day);
      }
      return [...base, day];
    });
  };

  const onSave = async () => {
    if (!habit || saving || deleting) return;

    const nextName = currentName.trim();
    const nextDescription = currentDescription.trim();

    if (!nextName) {
      setError("Name is required.");
      return;
    }
    if (currentSelectedDays.length === 0) {
      setError("Select at least one day.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await updateHabit({
        habitId: habit._id,
        name: nextName,
        description: nextDescription.length > 0 ? nextDescription : null,
        habitType: "scheduled",
        targetCompletions: null,
        targetDays: currentSelectedDays,
      });
      router.push("/systems");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!habit || saving || deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteHabit({ habitId: habit._id });
      router.push("/systems");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Failed to delete",
      );
      setDeleting(false);
    }
  };

  if (!habit) {
    return (
      <main className="space-y-4">
        <p className="text-zinc-400">Habit not found.</p>
        <Link href="/systems" className="text-sm text-zinc-200 underline">
          Back to Systems
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-2xl space-y-4">
      <Link href="/systems" className="text-sm text-zinc-400 hover:text-zinc-200">
        ← Back to Systems
      </Link>
      <h1 className="text-2xl font-semibold text-zinc-100">Habit Details</h1>

      <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <label className="space-y-1 text-sm">
          <span className="text-zinc-400">Name</span>
          <input
            value={currentName}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-md border border-zinc-700 bg-black px-3 py-2 text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-500"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-zinc-400">Description</span>
          <textarea
            value={currentDescription}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className="w-full rounded-md border border-zinc-700 bg-black px-3 py-2 text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-500"
          />
        </label>
        <div className="space-y-2">
          <span className="text-sm text-zinc-400">Days of week</span>
          <div className="flex flex-wrap gap-2">
            {WEEK_DAYS.map((day) => {
              const active = currentSelectedDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
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

        {error ? <p className="text-sm text-red-300">{error}</p> : null}

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            onClick={() => void onSave()}
            disabled={saving || deleting}
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => void onDelete()}
            disabled={saving || deleting}
            className="rounded-md border border-red-900 bg-red-950/40 px-4 py-2 text-sm text-red-300 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete Habit"}
          </button>
        </div>
      </div>
    </main>
  );
}
