"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { downloadBlob, resumeDownloadName } from "@/lib/resume/filename";
import { resumeTheme } from "@/lib/resume/resumeTheme";
import type { Resume } from "@/lib/resume/types";
import {
  formatSyntaxError,
  parseResumeJson,
} from "@/lib/resume/validateResume";
import { JsonEditor } from "./JsonEditor";
import { ResumePreview } from "./ResumePreview";
import { useResumePdf } from "./useResumePdf";

type SaveStatus = "saved" | "saving" | "invalid" | "error";

const saveStatusLabel: Record<SaveStatus, string> = {
  saved: "Saved",
  saving: "Saving…",
  invalid: "Fix JSON to save",
  error: "Save failed",
};

export function ResumeBuilderApp({
  title,
  initialContent,
  savedContent,
  onSave,
}: {
  title: string;
  initialContent: string;
  savedContent: string;
  onSave: (content: string) => Promise<unknown>;
}) {
  const [text, setText] = useState(initialContent);
  const [resume, setResume] = useState<Resume | null>(() => {
    const parsed = parseResumeJson(initialContent);
    return parsed.ok ? parsed.resume : null;
  });
  const [error, setError] = useState<string | null>(() => {
    const parsed = parseResumeJson(initialContent);
    return parsed.ok ? null : parsed.error;
  });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(
    error === null ? "saved" : "invalid",
  );
  const [copyLabel, setCopyLabel] = useState("Copy JSON");
  const textRef = useRef(text);
  const { snapshot, rendering, renderError } = useResumePdf(resume);

  useEffect(() => {
    textRef.current = text;
    const timeout = window.setTimeout(() => {
      const parsed = parseResumeJson(text);
      if (!parsed.ok) {
        setError(parsed.error);
        setSaveStatus("invalid");
        return;
      }

      const next = parsed.resume;
      setResume((current) =>
        current && JSON.stringify(current) === JSON.stringify(next)
          ? current
          : next,
      );
      setError(null);

      if (text === savedContent) {
        setSaveStatus("saved");
        return;
      }

      const savingText = text;
      setSaveStatus("saving");
      void onSave(savingText)
        .then(() => {
          if (textRef.current === savingText) setSaveStatus("saved");
        })
        .catch(() => {
          if (textRef.current === savingText) setSaveStatus("error");
        });
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [onSave, savedContent, text]);

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(text);
      setCopyLabel("Copied");
      window.setTimeout(() => setCopyLabel("Copy JSON"), 1400);
    } catch {
      setCopyLabel("Copy failed");
      window.setTimeout(() => setCopyLabel("Copy JSON"), 1400);
    }
  }

  function formatJson() {
    try {
      const parsed = JSON.parse(text) as unknown;
      setText(JSON.stringify(parsed, null, 2));
    } catch (syntaxError) {
      setError(formatSyntaxError(text, syntaxError));
    }
  }

  function downloadJson() {
    const blob = new Blob([text], { type: "application/json" });
    downloadBlob(blob, resumeDownloadName(resume?.personal.name, "json"));
  }

  function exportPdf() {
    if (!snapshot) return;
    downloadBlob(
      snapshot.blob,
      resumeDownloadName(snapshot.resume.personal.name, "pdf"),
    );
  }

  const saveLabel = saveStatusLabel[saveStatus];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: resumeTheme.colors.primary }}
          />
          <Link
            href="/resume-builder"
            className="shrink-0 text-xs font-medium text-neutral-500 hover:text-neutral-800"
          >
            Resumes
          </Link>
          <span className="text-neutral-300">/</span>
          <h1 className="truncate text-sm font-semibold tracking-tight text-neutral-900">
            {title}
          </h1>
          <span
            className={`shrink-0 text-xs ${
              saveStatus === "invalid" || saveStatus === "error"
                ? "text-red-600"
                : "text-neutral-400"
            }`}
          >
            {saveLabel}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ToolbarButton onClick={copyJson}>{copyLabel}</ToolbarButton>
          <ToolbarButton onClick={formatJson}>Format JSON</ToolbarButton>
          <ToolbarButton onClick={downloadJson}>Download JSON</ToolbarButton>
          <ToolbarButton onClick={exportPdf} primary disabled={!snapshot}>
            Export PDF
          </ToolbarButton>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <section className="flex w-[40%] min-w-0 flex-col border-r border-neutral-200 bg-white">
          {error ? (
            <div
              role="alert"
              className="max-h-24 shrink-0 overflow-auto border-b border-red-100 bg-red-50 px-3 py-2 text-xs leading-5 text-red-700"
            >
              {error}
            </div>
          ) : null}
          <div className="resume-json-editor min-h-0 flex-1">
            <JsonEditor value={text} onChange={setText} />
          </div>
        </section>
        <ResumePreview
          snapshot={snapshot}
          rendering={rendering}
          renderError={renderError}
          invalid={error !== null}
        />
      </div>
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  primary = false,
  disabled = false,
}: {
  children: string;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  if (primary) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="rounded-md px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        style={{ backgroundColor: resumeTheme.colors.primary }}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
