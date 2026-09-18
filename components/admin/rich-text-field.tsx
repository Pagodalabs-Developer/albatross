"use client";

import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react";
import type { Editor } from "@tiptap/react";
import type { ComponentType } from "react";

type Tool = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  mark?: string;
  run: (editor: Editor) => void;
};

const TOOLS: Tool[] = [
  { icon: Bold, label: "Bold", mark: "bold", run: (e) => e.chain().focus().toggleBold().run() },
  { icon: Italic, label: "Italic", mark: "italic", run: (e) => e.chain().focus().toggleItalic().run() },
  {
    icon: Strikethrough,
    label: "Strikethrough",
    mark: "strike",
    run: (e) => e.chain().focus().toggleStrike().run(),
  },
  {
    icon: List,
    label: "Bulleted list",
    mark: "bulletList",
    run: (e) => e.chain().focus().toggleBulletList().run(),
  },
  {
    icon: ListOrdered,
    label: "Numbered list",
    mark: "orderedList",
    run: (e) => e.chain().focus().toggleOrderedList().run(),
  },
  {
    icon: Link2,
    label: "Link",
    mark: "link",
    run: (e) => {
      if (e.isActive("link")) {
        e.chain().focus().unsetLink().run();
        return;
      }
      const url = window.prompt("Link URL (https://…)");

      if (!url || !/^https?:\/\//.test(url)) return;
      e.chain().focus().setLink({ href: url }).run();
    },
  },
  { icon: Undo2, label: "Undo", run: (e) => e.chain().focus().undo().run() },
  { icon: Redo2, label: "Redo", run: (e) => e.chain().focus().redo().run() },
];

export function RichTextField({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: string;
}) {
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: false, codeBlock: false })],
    content: defaultValue ?? "",
    immediatelyRender: false, // the admin form server-renders first
    editorProps: {
      attributes: {
        class:
          "min-h-32 max-h-80 overflow-y-auto px-3 py-2 text-sm text-foreground outline-none [&_a]:text-brand [&_a]:underline [&_li]:ml-4 [&_ol]:list-decimal [&_p+p]:mt-3 [&_ul]:list-disc",
      },
    },
  });

  const state = useEditorState({
    editor,
    selector: ({ editor: current }) =>
      current
        ? {
            html: current.getHTML(),
            pressed: TOOLS.map((tool) => Boolean(tool.mark && current.isActive(tool.mark))),
          }
        : null,
  });

  return (
    <div className="overflow-hidden rounded-button border border-border bg-background focus-within:border-primary">
      <input type="hidden" name={name} value={state?.html ?? defaultValue ?? ""} />
      <div className="flex flex-wrap gap-0.5 border-b border-border-subtle p-1.5">
        {TOOLS.map(({ icon: Icon, label, mark, run }, i) => {
          const pressed = state?.pressed[i] ?? false;
          return (
            <button
              key={label}
              type="button"
              title={label}
              aria-label={label}
              aria-pressed={mark ? pressed : undefined}
              disabled={!editor}
              onClick={() => editor && run(editor)}
              className={`flex size-7 items-center justify-center rounded-button transition-colors ${
                pressed
                  ? "bg-primary-hover text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="size-3.5" />
            </button>
          );
        })}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
