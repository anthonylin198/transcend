"use client";

import { useState } from "react";
import Link from "next/link";
import { api, useMutation } from "@transcend/convex";
import {
  blockSummary,
  replaceMovement,
  replaceNote,
  wodCategories,
  type MovementPath,
  type StoredWod,
  type WodMovement,
  type WodSection,
} from "@/lib/wod";

const fieldClass =
  "w-full rounded-md border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 outline-none ring-zinc-500 placeholder:text-zinc-600 focus:ring-2";

function parseNumber(value: string) {
  if (value.trim() === "" || value === ".") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | undefined;
  onChange: (next: number | undefined) => void;
}) {
  const [text, setText] = useState(value == null ? "" : String(value));

  return (
    <label className="flex flex-col gap-1 text-xs text-zinc-500">
      {label}
      <input
        value={text}
        inputMode="decimal"
        onChange={(event) => {
          const next = event.target.value;
          if (next !== "" && !/^\d*\.?\d*$/.test(next)) return;
          setText(next);
          onChange(parseNumber(next));
        }}
        onBlur={() => {
          const parsed = parseNumber(text);
          setText(parsed == null ? "" : String(parsed));
          onChange(parsed);
        }}
        className={fieldClass}
      />
    </label>
  );
}

function omitUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as T;
}

function MovementFields({
  movement,
  onChange,
}: {
  movement: WodMovement;
  onChange: (next: WodMovement) => void;
}) {
  const set = (patch: Partial<WodMovement>) =>
    onChange(omitUndefined({ ...movement, ...patch }));

  return (
    <div className="space-y-2 rounded-md border border-zinc-800 bg-zinc-950/60 p-3">
      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        Movement
        <input
          value={movement.name}
          onChange={(event) => set({ name: event.target.value })}
          className={fieldClass}
        />
      </label>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <NumberField
          label="Reps"
          value={movement.reps}
          onChange={(reps) => set({ reps })}
        />
        <label className="flex items-end gap-2 pb-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={Boolean(movement.perSide)}
            onChange={(event) =>
              set({ perSide: event.target.checked ? true : undefined })
            }
          />
          Per side
        </label>
        <NumberField
          label="Reps per side"
          value={movement.repsPerSide}
          onChange={(repsPerSide) => set({ repsPerSide })}
        />
        <NumberField
          label="Distance"
          value={movement.distance}
          onChange={(distance) => set({ distance })}
        />
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Unit
          <input
            value={movement.unit ?? ""}
            onChange={(event) => set({ unit: event.target.value || undefined })}
            placeholder="m, cal, mile"
            className={fieldClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-zinc-500 sm:col-span-2 lg:col-span-3">
          Prescription
          <input
            value={movement.prescription ?? ""}
            onChange={(event) =>
              set({ prescription: event.target.value || undefined })
            }
            placeholder="Optional"
            className={fieldClass}
          />
        </label>
      </div>
      {movement.weight ? (
        <div className="grid gap-2 sm:grid-cols-4">
          <NumberField
            label="Male"
            value={movement.weight.male}
            onChange={(male) =>
              set({
                weight: {
                  male: male ?? 0,
                  female: movement.weight?.female ?? 0,
                  unit: movement.weight?.unit ?? "lb",
                },
              })
            }
          />
          <NumberField
            label="Female"
            value={movement.weight.female}
            onChange={(female) =>
              set({
                weight: {
                  male: movement.weight?.male ?? 0,
                  female: female ?? 0,
                  unit: movement.weight?.unit ?? "lb",
                },
              })
            }
          />
          <label className="flex flex-col gap-1 text-xs text-zinc-500">
            Weight unit
            <input
              value={movement.weight.unit}
              onChange={(event) =>
                set({
                  weight: {
                    male: movement.weight?.male ?? 0,
                    female: movement.weight?.female ?? 0,
                    unit: event.target.value,
                  },
                })
              }
              className={fieldClass}
            />
          </label>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => set({ weight: undefined })}
              className="rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-300"
            >
              Remove weight
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => set({ weight: { male: 0, female: 0, unit: "lb" } })}
          className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300"
        >
          Add weight
        </button>
      )}
    </div>
  );
}

function MovementList({
  movements,
  path,
  onChange,
}: {
  movements: WodMovement[];
  path: Omit<MovementPath, "movementIndex">;
  onChange: (path: MovementPath, next: WodMovement) => void;
}) {
  if (movements.length === 0) {
    return <p className="text-sm text-zinc-500">No movements</p>;
  }
  return (
    <div className="space-y-2">
      {movements.map((movement, movementIndex) => (
        <MovementFields
          key={movementIndex}
          movement={movement}
          onChange={(next) => onChange({ ...path, movementIndex }, next)}
        />
      ))}
    </div>
  );
}

export function WorkoutForm({ wod }: { wod: StoredWod }) {
  const updateWod = useMutation(api.wods.updateWod.updateWod);
  const [title, setTitle] = useState(wod.title);
  const [category, setCategory] = useState(wod.category);
  const [sections, setSections] = useState<WodSection[]>(wod.sections);
  const [baseline, setBaseline] = useState({
    title: wod.title,
    category: wod.category,
    sections: wod.sections,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const unchanged =
    title.trim() === baseline.title.trim() &&
    category === baseline.category &&
    JSON.stringify(sections) === JSON.stringify(baseline.sections);

  const onMovement = (path: MovementPath, next: WodMovement) => {
    setSections((current) => replaceMovement(current, path, next));
    setSaved(false);
    setError(null);
  };

  const onSave = async () => {
    if (saving || !title.trim()) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const nextTitle = title.trim();
      await updateWod({
        slug: wod.slug,
        title: nextTitle,
        category,
        sections,
      });
      setTitle(nextTitle);
      setBaseline({ title: nextTitle, category, sections });
      setSaved(true);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save workout",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/workouts"
          className="text-sm text-zinc-400 hover:text-zinc-200"
        >
          All workouts
        </Link>
        <button
          type="button"
          onClick={() => void onSave()}
          disabled={saving || unchanged || !title.trim()}
          className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Edit workout</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Title, category, movements, and notes save to the backend. Headings,
            intervals, and set tables stay as they are.
          </p>
        </div>
        <p className="text-xs tracking-wide text-zinc-500">{wod.slug}</p>
        <label className="flex flex-col gap-1.5 text-sm text-zinc-300">
          Title
          <input
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setSaved(false);
              setError(null);
            }}
            className={fieldClass}
          />
        </label>
        <label className="flex max-w-xs flex-col gap-1.5 text-sm text-zinc-300">
          Category
          <select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value as StoredWod["category"]);
              setSaved(false);
              setError(null);
            }}
            className={fieldClass}
          >
            {wodCategories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        {saved ? <p className="text-sm text-zinc-400">Saved.</p> : null}
      </div>

      {sections.map((section, sectionIndex) => (
        <section
          key={section.id}
          className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-950 p-4"
        >
          <div>
            <p className="text-xs tracking-wide text-zinc-500 uppercase">
              {section.type}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-zinc-100">
              {section.title}
            </h2>
          </div>
          {section.blocks.map((block, blockIndex) => {
            const summary = blockSummary(block);
            const path = { sectionIndex, blockIndex };
            if (block.type === "movementList") {
              return (
                <MovementList
                  key={blockIndex}
                  movements={block.items}
                  path={path}
                  onChange={onMovement}
                />
              );
            }
            if (
              block.type === "movementComplex" ||
              block.type === "alternative"
            ) {
              return (
                <div key={blockIndex} className="space-y-2">
                  <p className="text-sm text-zinc-300">
                    {block.type === "alternative"
                      ? block.label
                      : (block.label ?? "Complex")}
                  </p>
                  <MovementList
                    movements={block.movements}
                    path={path}
                    onChange={onMovement}
                  />
                </div>
              );
            }
            if (block.type === "note") {
              return (
                <label
                  key={blockIndex}
                  className="flex flex-col gap-1 text-xs text-zinc-500"
                >
                  Note
                  <textarea
                    value={block.text}
                    rows={3}
                    onChange={(event) => {
                      setSections((current) =>
                        replaceNote(
                          current,
                          sectionIndex,
                          blockIndex,
                          event.target.value,
                        ),
                      );
                      setSaved(false);
                      setError(null);
                    }}
                    className={fieldClass}
                  />
                </label>
              );
            }
            if (block.type === "variants") {
              return (
                <div key={blockIndex} className="space-y-4">
                  {block.options.map((option, variantIndex) => (
                    <div key={option.id} className="space-y-2">
                      <p className="text-sm font-medium text-zinc-200">
                        {option.label}
                      </p>
                      <MovementList
                        movements={option.movements}
                        path={{ ...path, variantIndex }}
                        onChange={onMovement}
                      />
                    </div>
                  ))}
                </div>
              );
            }
            return (
              <p key={blockIndex} className="text-sm text-zinc-500">
                {summary}
              </p>
            );
          })}
        </section>
      ))}
    </div>
  );
}
