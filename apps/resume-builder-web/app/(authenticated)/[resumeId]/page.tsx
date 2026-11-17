"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

const ResumeEditor = dynamic(
  () =>
    import("@/components/resume-builder/ResumeEditor").then(
      (mod) => mod.ResumeEditor,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-neutral-500">
        Loading resume…
      </div>
    ),
  },
);

export default function ResumeEditorPage() {
  const params = useParams<{ resumeId: string }>();
  return <ResumeEditor resumeId={params.resumeId} />;
}
