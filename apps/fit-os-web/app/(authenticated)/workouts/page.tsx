"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { api, useQuery } from "@transcend/convex";
import { wodCategories, wodCategoryLabels, type WodCategory } from "@/lib/wod";

export default function WorkoutsPage() {
  const workouts = useQuery(api.wods.listWods.listWods);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<WodCategory | "all">("all");
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (workouts ?? []).filter((wod) => {
      if (category !== "all" && wod.category !== category) return false;
      if (!needle) return true;
      return (
        wod.title.toLowerCase().includes(needle) ||
        wod.slug.toLowerCase().includes(needle)
      );
    });
  }, [category, query, workouts]);

  return (
    <main className="space-y-5">
      <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <h1 className="text-xl font-semibold text-zinc-100">Workouts</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
          These are the workouts FitOS shows. Edits here update the app without
          a new release.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            className="w-full rounded-md border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 outline-none ring-zinc-500 placeholder:text-zinc-600 focus:ring-2 sm:max-w-sm"
          />
          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as WodCategory | "all")
            }
            className="rounded-md border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100"
          >
            <option value="all">All categories</option>
            {wodCategories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {workouts === undefined ? (
        <p className="text-sm text-zinc-400">Loading...</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-zinc-400">
          {workouts.length === 0 ? "No workouts yet." : "No matches."}
        </p>
      ) : (
        <ul className="divide-y divide-zinc-800 rounded-lg border border-zinc-800">
          {visible.map((wod) => (
            <li key={wod.slug}>
              <Link
                href={`/workouts/${wod.slug}`}
                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-zinc-950"
              >
                <span>
                  <span className="block text-sm font-medium text-zinc-100">
                    {wod.title}
                  </span>
                  <span className="mt-1 block text-xs text-zinc-500">
                    {wodCategoryLabels[wod.category]}
                  </span>
                </span>
                <span className="text-sm text-zinc-500">Edit</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
