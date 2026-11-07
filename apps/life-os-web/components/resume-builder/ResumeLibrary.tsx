"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, useMutation, useQuery } from "@transcend/convex";
import { sampleResumeJson } from "@/lib/resume/sampleResume";
import { resumeTheme } from "@/lib/resume/resumeTheme";

const updatedFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function ResumeLibrary() {
  const router = useRouter();
  const resumes = useQuery(api.resumes.listResumes.listResumes, {});
  const createResume = useMutation(api.resumes.createResume.createResume);
  const renameResume = useMutation(api.resumes.renameResume.renameResume);
  const duplicateResume = useMutation(
    api.resumes.duplicateResume.duplicateResume,
  );
  const deleteResume = useMutation(api.resumes.deleteResume.deleteResume);
  const [title, setTitle] = useState("Untitled resume");
  const [creating, setCreating] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onCreate(event: React.FormEvent) {
    event.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle || creating) return;

    setCreating(true);
    setError(null);
    try {
      const resumeId = await createResume({
        title: nextTitle,
        content: sampleResumeJson,
      });
      router.push(`/resume-builder/${resumeId}`);
    } catch (createError) {
      setError(messageFrom(createError, "Could not create resume"));
      setCreating(false);
    }
  }

  async function onRename(event: React.FormEvent) {
    event.preventDefault();
    if (!renamingId) return;
    const nextTitle = renameValue.trim();
    if (!nextTitle) {
      setError("Title is required");
      return;
    }

    setPendingId(renamingId);
    setError(null);
    try {
      await renameResume({ resumeId: renamingId, title: nextTitle });
      setRenamingId(null);
    } catch (renameError) {
      setError(messageFrom(renameError, "Could not rename resume"));
    } finally {
      setPendingId(null);
    }
  }

  async function onDuplicate(resumeId: string) {
    setPendingId(resumeId);
    setError(null);
    try {
      await duplicateResume({ resumeId });
    } catch (duplicateError) {
      setError(messageFrom(duplicateError, "Could not duplicate resume"));
    } finally {
      setPendingId(null);
    }
  }

  async function onDelete(resumeId: string, resumeTitle: string) {
    if (!window.confirm(`Delete “${resumeTitle}”? This cannot be undone.`)) {
      return;
    }

    setPendingId(resumeId);
    setError(null);
    try {
      await deleteResume({ resumeId });
      if (renamingId === resumeId) setRenamingId(null);
    } catch (deleteError) {
      setError(messageFrom(deleteError, "Could not delete resume"));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-5 py-10">
        <header className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: resumeTheme.colors.primary }}
            />
            <h1 className="text-lg font-semibold tracking-tight">Resumes</h1>
          </div>
          <p className="text-sm text-neutral-500">
            Create a new resume or open one you already saved.
          </p>
        </header>

        <form onSubmit={onCreate} className="flex flex-col gap-1.5">
          <label
            htmlFor="new-resume-title"
            className="text-xs font-medium text-neutral-600"
          >
            New resume
          </label>
          <div className="flex gap-2">
            <input
              id="new-resume-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              className="min-w-0 flex-1 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500"
            />
            <button
              type="submit"
              disabled={creating || title.trim().length === 0}
              className="rounded-md px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundColor: resumeTheme.colors.primary }}
            >
              {creating ? "Creating…" : "Create"}
            </button>
          </div>
        </form>

        {error ? (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {resumes === undefined ? (
          <p className="text-sm text-neutral-500">Loading resumes…</p>
        ) : resumes.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 bg-white/60 px-4 py-8 text-center text-sm text-neutral-500">
            No saved resumes yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {resumes.map((resume) => {
              const busy = pendingId === resume._id;
              const renaming = renamingId === resume._id;

              return (
                <li
                  key={resume._id}
                  className="rounded-lg border border-neutral-200 bg-white px-4 py-3"
                >
                  {renaming ? (
                    <form onSubmit={onRename} className="flex flex-col gap-2">
                      <input
                        value={renameValue}
                        onChange={(event) => setRenameValue(event.target.value)}
                        aria-label="Resume title"
                        maxLength={120}
                        autoFocus
                        className="min-w-0 rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={busy || renameValue.trim().length === 0}
                          className="rounded-md px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
                          style={{
                            backgroundColor: resumeTheme.colors.primary,
                          }}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setRenamingId(null)}
                          className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-800"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-neutral-900">
                          {resume.title}
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-500">
                          Updated {updatedFormat.format(resume.updatedAt)}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                        <Link
                          href={`/resume-builder/${resume._id}`}
                          className="rounded-md px-2.5 py-1.5 text-xs font-medium text-white hover:opacity-90"
                          style={{
                            backgroundColor: resumeTheme.colors.primary,
                          }}
                        >
                          Open
                        </Link>
                        <RowButton
                          disabled={busy}
                          onClick={() => {
                            setRenamingId(resume._id);
                            setRenameValue(resume.title);
                          }}
                        >
                          Rename
                        </RowButton>
                        <RowButton
                          disabled={busy}
                          onClick={() => void onDuplicate(resume._id)}
                        >
                          Duplicate
                        </RowButton>
                        <RowButton
                          disabled={busy}
                          onClick={() =>
                            void onDelete(resume._id, resume.title)
                          }
                        >
                          Delete
                        </RowButton>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function RowButton({
  children,
  onClick,
  disabled,
}: {
  children: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-800 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function messageFrom(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}
