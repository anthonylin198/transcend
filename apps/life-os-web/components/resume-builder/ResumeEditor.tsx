"use client";

import Link from "next/link";
import { useCallback } from "react";
import { api, useMutation, useQuery } from "@transcend/convex";
import { ResumeBuilderApp } from "./ResumeBuilderApp";

export function ResumeEditor({ resumeId }: { resumeId: string }) {
  const resume = useQuery(api.resumes.getResume.getResume, { resumeId });
  const updateResumeContent = useMutation(
    api.resumes.updateResumeContent.updateResumeContent,
  );
  const onSave = useCallback(
    (content: string) => updateResumeContent({ resumeId, content }),
    [resumeId, updateResumeContent],
  );

  if (resume === undefined) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-neutral-500">
        Loading resume…
      </div>
    );
  }

  if (resume === null) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-sm font-semibold text-neutral-900">
          Resume not found
        </h1>
        <p className="text-sm text-neutral-500">
          It may have been deleted, or it belongs to another account.
        </p>
        <Link
          href="/resume-builder"
          className="text-sm font-medium text-neutral-800 underline"
        >
          Back to resumes
        </Link>
      </div>
    );
  }

  return (
    <ResumeBuilderApp
      key={resume._id}
      title={resume.title}
      initialContent={resume.content}
      savedContent={resume.content}
      onSave={onSave}
    />
  );
}
