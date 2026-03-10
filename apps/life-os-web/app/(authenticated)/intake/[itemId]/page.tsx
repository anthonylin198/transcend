"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { api, useMutation, useQuery } from "@transcend/convex";

export default function IntakeItemDetailsPage() {
  const params = useParams<{ itemId: string }>();
  const router = useRouter();
  const [title, setTitle] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [completed, setCompleted] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const homeBootstrap = useQuery(api.home.bootstrap.bootstrap, {});
  const updateIntakeListItem = useMutation(
    api.intake.updateIntakeListItem.updateIntakeListItem,
  );
  const setIntakeListItemCompletion = useMutation(
    api.intake.setIntakeListItemCompletion.setIntakeListItemCompletion,
  );
  const deleteIntakeListItem = useMutation(
    api.intake.deleteIntakeListItem.deleteIntakeListItem,
  );

  const intakeItem = useMemo(
    () => homeBootstrap?.intakeListItems.find((item) => item._id === params.itemId),
    [homeBootstrap?.intakeListItems, params.itemId],
  );

  const currentTitle = title ?? intakeItem?.title ?? "";
  const currentDescription = description ?? intakeItem?.description ?? "";
  const currentCompleted = completed ?? intakeItem?.completed ?? false;

  const onSave = async () => {
    if (!intakeItem || saving || deleting) return;
    const nextTitle = currentTitle.trim();
    const nextDescription = currentDescription.trim();
    if (!nextTitle) {
      setError("Title is required.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await updateIntakeListItem({
        intakeListItemId: intakeItem._id,
        title: nextTitle,
        description: nextDescription.length > 0 ? nextDescription : null,
      });
      if (currentCompleted !== intakeItem.completed) {
        await setIntakeListItemCompletion({
          intakeListItemId: intakeItem._id,
          completed: currentCompleted,
        });
      }
      router.push("/intake");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!intakeItem || deleting || saving) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteIntakeListItem({ intakeListItemId: intakeItem._id });
      router.push("/intake");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Failed to delete",
      );
      setDeleting(false);
    }
  };

  if (!intakeItem) {
    return (
      <main className="space-y-4">
        <p className="text-zinc-400">Intake item not found.</p>
        <Link href="/intake" className="text-sm text-zinc-200 underline">
          Back to Intake
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-2xl space-y-4">
      <Link href="/intake" className="text-sm text-zinc-400 hover:text-zinc-200">
        ← Back to Intake
      </Link>
      <h1 className="text-2xl font-semibold text-zinc-100">Intake Item Details</h1>

      <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <label className="space-y-1 text-sm">
          <span className="text-zinc-400">Title</span>
          <input
            value={currentTitle}
            onChange={(event) => setTitle(event.target.value)}
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

        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            checked={currentCompleted}
            onChange={(event) => setCompleted(event.target.checked)}
            type="checkbox"
            className="h-4 w-4 rounded border-zinc-600 bg-black"
          />
          Completed
        </label>

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
            {deleting ? "Deleting..." : "Delete Item"}
          </button>
        </div>
      </div>
    </main>
  );
}
