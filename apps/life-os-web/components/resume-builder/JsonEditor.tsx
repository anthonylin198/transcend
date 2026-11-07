"use client";

import { json, jsonParseLinter } from "@codemirror/lang-json";
import { linter, lintGutter } from "@codemirror/lint";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { useMemo } from "react";

const editorTheme = EditorView.theme({
  "&": {
    height: "100%",
    backgroundColor: "#ffffff",
  },
  ".cm-scroller": {
    fontFamily:
      "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: "12.5px",
    lineHeight: "1.55",
  },
  ".cm-content": {
    paddingTop: "12px",
    paddingBottom: "24px",
  },
  ".cm-gutters": {
    backgroundColor: "#fafafa",
    color: "#a3a3a3",
    borderRight: "1px solid #eeeeee",
  },
  ".cm-activeLine": {
    backgroundColor: "#f3fafb",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "#f4f4f5",
  },
  "&.cm-focused": {
    outline: "none",
  },
});

export function JsonEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const extensions = useMemo(
    () => [
      json(),
      linter(jsonParseLinter()),
      lintGutter(),
      editorTheme,
      EditorView.lineWrapping,
    ],
    [],
  );

  return (
    <CodeMirror
      value={value}
      height="100%"
      theme="light"
      extensions={extensions}
      onChange={onChange}
      autoFocus
      basicSetup
      indentWithTab
      className="h-full text-sm"
    />
  );
}
