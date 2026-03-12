"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { api, useMutation, useQuery } from "@transcend/convex";
import { getHomeBootstrapRange } from "@/lib/homeBootstrapRange";

export default function IntakePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const bootstrapRange = useMemo(() => getHomeBootstrapRange(), []);
  const homeBootstrap = useQuery(api.home.bootstrap.bootstrap, bootstrapRange);
  const createIntakeListItem = useMutation(
    api.intake.createIntakeListItem.createIntakeListItem,
  );

  const items = homeBootstrap?.intakeListItems ?? [];

  const onCreate = async () => {
    const nextTitle = title.trim();
    const nextDescription = description.trim();
    if (!nextTitle || saving) return;
    setSaving(true);
    try {
      await createIntakeListItem({
        title: nextTitle,
        description: nextDescription.length > 0 ? nextDescription : undefined,
      });
      setTitle("");
      setDescription("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="space-y-5">
      <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <h1 className="text-xl font-semibold text-zinc-100">Intake List</h1>
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Title"
            className="rounded-md border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100"
          />
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Description (optional)"
            className="rounded-md border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100"
          />
          <button
            type="button"
            onClick={() => void onCreate()}
            disabled={saving || !title.trim()}
            className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
          >
            {saving ? "Adding..." : "Add"}
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-800 bg-zinc-950">
        {items.length === 0 ? (
          <p className="p-4 text-sm text-zinc-400">No intake items yet.</p>
        ) : (
          items.map((item) => (
            <Link
              key={item._id}
              href={`/intake/${item._id}`}
              className="block border-b border-zinc-800 px-4 py-3 text-sm last:border-b-0 hover:bg-zinc-900"
            >
              <p
                className={`font-medium ${
                  item.completed
                    ? "text-zinc-500 line-through"
                    : "text-zinc-100"
                }`}
              >
                {item.title}
              </p>
              {item.description ? (
                <p className="mt-1 text-zinc-400">{item.description}</p>
              ) : null}
            </Link>
          ))
        )}
      </section>
    </main>
  );
}
