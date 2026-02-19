"use client";

/**
 * JSON Editor component using CodeMirror 6.
 * Provides syntax highlighting, line numbers, and bracket matching for JSON input.
 * Dynamically imported (SSR disabled) since CodeMirror requires browser APIs.
 */

import { useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  editorRef?: React.MutableRefObject<EditorView | null>;
}

/** Custom theme extensions to fit our app styling */
const customTheme = EditorView.theme({
  "&": {
    height: "100%",
    fontSize: "13px",
  },
  ".cm-scroller": {
    fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
    padding: "8px 0",
  },
  ".cm-content": {
    padding: "0 8px",
  },
  ".cm-line": {
    padding: "0 4px",
  },
});

export function JsonEditor({ value, onChange, editorRef }: JsonEditorProps) {
  const handleChange = useCallback(
    (val: string) => {
      onChange(val);
    },
    [onChange]
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-[11px] font-medium text-muted uppercase tracking-wider">
          JSON Input
        </span>
        <span className="text-[10px] text-muted/60">
          {value.length > 0
            ? `${value.length.toLocaleString()} chars`
            : "Paste or type JSON"}
        </span>
      </div>
      <div className="flex-1 overflow-hidden">
        <CodeMirror
          value={value}
          onChange={handleChange}
          extensions={[json(), customTheme]}
          theme={oneDark}
          placeholder='{\n  "paste": "your JSON here"\n}'
          height="100%"
          style={{ height: "100%" }}
          onCreateEditor={(view) => {
            if (editorRef) {
              editorRef.current = view;
            }
          }}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightActiveLine: true,
            bracketMatching: true,
            closeBrackets: true,
            foldGutter: true,
            indentOnInput: true,
            autocompletion: false,
            searchKeymap: true,
          }}
        />
      </div>
    </div>
  );
}
