"use client";

import { pdf } from "@react-pdf/renderer";
import { useEffect, useRef, useState } from "react";
import { ResumeDocument } from "@/lib/resume/pdf/ResumeDocument";
import { resumeTheme } from "@/lib/resume/resumeTheme";
import type { Resume } from "@/lib/resume/types";

export interface ResumePdfSnapshot {
  url: string;
  blob: Blob;
  resume: Resume;
}

/**
 * Renders the same ResumeDocument used for download.
 * Invalid JSON leaves the previous snapshot in place.
 */
export function useResumePdf(resume: Resume | null) {
  const [snapshot, setSnapshot] = useState<ResumePdfSnapshot | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [failedResume, setFailedResume] = useState<Resume | null>(null);
  const urlRef = useRef<string | null>(null);
  const rendering =
    resume !== null && snapshot?.resume !== resume && failedResume !== resume;

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  useEffect(() => {
    if (!resume) return;
    let active = true;

    pdf(<ResumeDocument resume={resume} theme={resumeTheme} />)
      .toBlob()
      .then((blob) => {
        if (!active) return;
        const pdfBlob =
          blob.type === "application/pdf"
            ? blob
            : new Blob([blob], { type: "application/pdf" });
        const url = URL.createObjectURL(pdfBlob);
        const previous = urlRef.current;
        urlRef.current = url;
        setSnapshot({ url, blob: pdfBlob, resume });
        setRenderError(null);
        setFailedResume(null);
        if (previous) {
          window.setTimeout(() => URL.revokeObjectURL(previous), 1500);
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        setFailedResume(resume);
        setRenderError(
          error instanceof Error ? error.message : "Could not render the PDF.",
        );
      });

    return () => {
      active = false;
    };
  }, [resume]);

  return { snapshot, rendering, renderError };
}
