"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from "pdfjs-dist";
import type { ResumePdfSnapshot } from "./useResumePdf";

const FRAME_PADDING = 28;
const PAGE_GAP = 16;
const MIN_ZOOM = 30;
const MAX_ZOOM = 200;

type Zoom = { mode: "fit" } | { mode: "percent"; value: number };

type Pdfjs = typeof import("pdfjs-dist");

let pdfjsPromise: Promise<Pdfjs> | null = null;

function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((pdfjs) => {
      if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();
      }
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

function isCancelled(error: unknown) {
  return (
    error instanceof Error &&
    (error.name === "RenderingCancelledException" ||
      error.message.toLowerCase().includes("cancel"))
  );
}

export function ResumePreview({
  snapshot,
  rendering,
  renderError,
  invalid,
}: {
  snapshot: ResumePdfSnapshot | null;
  rendering: boolean;
  renderError: string | null;
  invalid: boolean;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const fitPercentRef = useRef(100);
  const [zoom, setZoom] = useState<Zoom>({ mode: "fit" });
  const [centered, setCentered] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const stage = stageRef.current;
    if (!frame || !stage || !snapshot) return;

    let cancelled = false;
    let token = 0;
    let activeTask: { cancel: () => void } | null = null;
    let loadingTask: PDFDocumentLoadingTask | null = null;
    let doc: PDFDocumentProxy | null = null;

    const draw = async () => {
      if (!doc || cancelled) return;
      const my = ++token;
      activeTask?.cancel();

      const first = await doc.getPage(1);
      if (my !== token) return;
      const base = first.getViewport({ scale: 1 });
      const availW = Math.max(frame.clientWidth - FRAME_PADDING * 2, 1);
      const availH = Math.max(frame.clientHeight - FRAME_PADDING * 2, 1);
      const fit = Math.min(availW / base.width, availH / base.height);
      const fitPercent = Math.max(1, Math.round(fit * 100));
      fitPercentRef.current = fitPercent;

      const cssScale = zoom.mode === "fit" ? fit : zoom.value / 100;
      const outputScale = window.devicePixelRatio || 1;
      const pageCount = doc.numPages;
      const contentHeight =
        pageCount * base.height * cssScale +
        PAGE_GAP * Math.max(pageCount - 1, 0);
      const contentWidth = base.width * cssScale;

      const fragment = document.createDocumentFragment();
      for (let number = 1; number <= pageCount; number += 1) {
        if (my !== token) return;
        const page = number === 1 ? first : await doc.getPage(number);
        if (my !== token) return;
        const viewport = page.getViewport({ scale: cssScale * outputScale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = `${Math.floor(viewport.width / outputScale)}px`;
        canvas.style.height = `${Math.floor(viewport.height / outputScale)}px`;
        canvas.className =
          "block bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)]";
        fragment.appendChild(canvas);
        const task = page.render({ canvas, viewport });
        activeTask = task;
        try {
          await task.promise;
        } catch (error) {
          if (cancelled || my !== token || isCancelled(error)) return;
          setPreviewError(
            error instanceof Error
              ? error.message
              : "Could not show the preview.",
          );
          return;
        }
      }

      if (my !== token) return;
      stage.replaceChildren(fragment);
      setCentered(contentHeight <= availH && contentWidth <= availW);
      setPreviewError(null);
    };

    void (async () => {
      try {
        const pdfjs = await loadPdfjs();
        const data = new Uint8Array(await snapshot.blob.arrayBuffer());
        if (cancelled) return;
        loadingTask = pdfjs.getDocument({ data });
        const loaded = await loadingTask.promise;
        if (cancelled) {
          await loadingTask.destroy();
          return;
        }
        doc = loaded;
        await draw();
        if (cancelled) return;
      } catch (error) {
        if (cancelled || isCancelled(error)) return;
        setPreviewError(
          error instanceof Error
            ? error.message
            : "Could not show the preview.",
        );
      }
    })();

    const observer = new ResizeObserver(() => {
      if (zoom.mode === "fit") void draw();
    });
    observer.observe(frame);

    return () => {
      cancelled = true;
      token += 1;
      activeTask?.cancel();
      observer.disconnect();
      void loadingTask?.destroy();
    };
  }, [snapshot, zoom]);

  function stepZoom(direction: -1 | 1) {
    setZoom((current) => {
      const base =
        current.mode === "fit" ? fitPercentRef.current : current.value;
      const next = Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, base + direction * 10),
      );
      return { mode: "percent", value: next };
    });
  }

  const status =
    rendering && !snapshot
      ? "Generating preview…"
      : rendering
        ? "Updating preview…"
        : renderError || previewError
          ? "Preview failed"
          : invalid && snapshot
            ? "Showing last valid preview"
            : null;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#e4e7ec]">
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-3">
        <p className="text-xs text-neutral-500">{status}</p>
        <div className="flex items-center gap-1">
          <ZoomButton label="Zoom out" onClick={() => stepZoom(-1)}>
            −
          </ZoomButton>
          <button
            type="button"
            onClick={() => setZoom({ mode: "fit" })}
            className="min-w-12 rounded px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
          >
            {zoom.mode === "fit" ? "Fit" : `${zoom.value}%`}
          </button>
          <ZoomButton label="Zoom in" onClick={() => stepZoom(1)}>
            +
          </ZoomButton>
        </div>
      </div>

      <div ref={frameRef} className="relative min-h-0 flex-1 overflow-auto">
        {snapshot ? (
          <div
            className={`flex min-h-full min-w-full justify-center p-7 ${
              centered ? "items-center" : "items-start"
            }`}
          >
            <div ref={stageRef} className="flex flex-col items-center gap-4" />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center px-8">
            <div className="flex aspect-[8.5/11] w-full max-w-[460px] items-center justify-center bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
              <p className="px-8 text-center text-sm text-neutral-500">
                {renderError
                  ? renderError
                  : invalid
                    ? "Fix the JSON to preview the resume."
                    : "Generating preview…"}
              </p>
            </div>
          </div>
        )}
        {(renderError || previewError) && snapshot && !rendering ? (
          <p className="pointer-events-none absolute bottom-3 left-3 right-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 shadow">
            {renderError || previewError}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function ZoomButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-6 w-6 items-center justify-center rounded text-sm text-neutral-700 hover:bg-neutral-100"
    >
      {children}
    </button>
  );
}
