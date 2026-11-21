"use client";

import { useState } from "react";
import { api, useMutation, useQuery } from "@transcend/convex";
import { wodCategoryLabels } from "@/lib/wod";

function dayLabel(cycleStart: string, offset: number) {
  const [year, month, day] = cycleStart.split("-").map(Number);
  if (!year || !month || !day) return `Day ${offset + 1}`;
  const date = new Date(year, month - 1, day + offset);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

export default function SchedulePage() {
  const workouts = useQuery(api.wods.listWods.listWods);
  const schedule = useQuery(api.wods.getWodSchedule.getWodSchedule);
  const setWodSchedule = useMutation(api.wods.setWodSchedule.setWodSchedule);
  const [draft, setDraft] = useState<{
    cycleStart: string;
    wodSlugs: string[];
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const cycleStart = draft?.cycleStart ?? schedule?.cycleStart ?? "2026-11-16";
  const wodSlugs = draft?.wodSlugs ?? schedule?.wodSlugs ?? [];
  const unchanged =
    schedule != null &&
    cycleStart === schedule.cycleStart &&
    wodSlugs.join("\n") === schedule.wodSlugs.join("\n");
  const weeks: string[][] = [];
  for (let index = 0; index < wodSlugs.length; index += 7) {
    weeks.push(wodSlugs.slice(index, index + 7));
  }

  const setSlug = (index: number, slug: string) => {
    const next = [...wodSlugs];
    next[index] = slug;
    setDraft({ cycleStart, wodSlugs: next });
    setSaved(false);
    setError(null);
  };

  const onSave = async () => {
    if (saving || wodSlugs.length === 0) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await setWodSchedule({ cycleStart, wodSlugs });
      setSaved(true);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save schedule",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="space-y-5">
      <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100">Schedule</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              The cycle starts on the date below, then repeats. Day one is the
              first workout in the list.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void onSave()}
            disabled={
              saving ||
              schedule === undefined ||
              workouts === undefined ||
              wodSlugs.length === 0 ||
              unchanged
            }
            className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
        <label className="mt-4 flex max-w-xs flex-col gap-1.5 text-sm text-zinc-300">
          Cycle start
          <input
            type="date"
            value={cycleStart}
            onChange={(event) => {
              setDraft({ cycleStart: event.target.value, wodSlugs });
              setSaved(false);
              setError(null);
            }}
            disabled={schedule == null}
            className="rounded-md border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 disabled:opacity-60"
          />
        </label>
        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
        {saved ? <p className="mt-3 text-sm text-zinc-400">Saved.</p> : null}
      </section>

      {schedule === undefined || workouts === undefined ? (
        <p className="text-sm text-zinc-400">Loading...</p>
      ) : schedule === null ? (
        <p className="text-sm text-zinc-400">No schedule yet.</p>
      ) : (
        weeks.map((week, weekIndex) => (
          <section
            key={weekIndex}
            className="rounded-lg border border-zinc-800 bg-zinc-950 p-4"
          >
            <h2 className="text-sm font-semibold text-zinc-200">
              Week {weekIndex + 1}
            </h2>
            <div className="mt-3 space-y-3">
              {week.map((slug, dayIndex) => {
                const index = weekIndex * 7 + dayIndex;
                return (
                  <label
                    key={index}
                    className="grid gap-1 text-sm text-zinc-400 sm:grid-cols-[9rem_1fr] sm:items-center sm:gap-3"
                  >
                    <span>{dayLabel(cycleStart, index)}</span>
                    <select
                      value={slug}
                      onChange={(event) => setSlug(index, event.target.value)}
                      className="rounded-md border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100"
                    >
                      {workouts.map((wod) => (
                        <option key={wod.slug} value={wod.slug}>
                          {wod.title} · {wodCategoryLabels[wod.category]}
                        </option>
                      ))}
                    </select>
                  </label>
                );
              })}
            </div>
          </section>
        ))
      )}
    </main>
  );
}
