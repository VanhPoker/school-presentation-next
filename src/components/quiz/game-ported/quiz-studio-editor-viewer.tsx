import { AnyExtension, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState } from "react";
import InputFillDragDropNode from "./editor-node/input-fill-drag-drop-node/index";
import { cn } from "@/lib/utils";

// Minimal set of extensions for Viewer
// We mock Table to avoid complex dependency, or just include StarterKit tables if available.
// StarterKit doesn't include Table by default.
// We will just skip Table for now or use a basic one if needed.
// IMPORTANT: Text align and Underline are used in original.

import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";

type QuizStudioEditorProps = {
  content: string;
  placeholder?: string;
  fill?: boolean;
  is_practise?: boolean;
  codeQuiz?: string;
  allowEdit?: boolean;
  handleJSONChange?: (value: string) => void;
  // Reduced props
};

export default function QuizStudioEditorViewer({
  content,
  placeholder,
  is_practise = true,
  codeQuiz,
  allowEdit = false,
  handleJSONChange,
}: QuizStudioEditorProps) {
  // We only need to trigger handleJSONChange when content updates via Node Interaction
  // Since allowEdit is false, only Node interactions change the doc.

  const editor = useEditor({
    immediatelyRender: false,
    editable: false, // Viewer mode
    extensions: [
      StarterKit.configure({
        heading: false,
      }) as AnyExtension,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      Subscript,
      Superscript,
      InputFillDragDropNode,
      // Table support skipped for simplicity unless critical
    ],
    editorProps: {
      attributes: {
        class: `tiptap-wrapper-2 focus:outline-none !max-w-full !w-full !min-h-full !h-full flex flex-col overflow-y-auto break-words font-normal [&_p]:w-full [&_p]:text-center !p-0`,
      },
    },
    onUpdate: ({ editor }) => {
      if (handleJSONChange) {
        const json = JSON.stringify(editor.getJSON().content);
        handleJSONChange(json);
      }
    },
    content: "", // Set via useEffect
  });

  useEffect(() => {
    if (editor && content) {
      try {
        // The content passed here is usually a stringified JSON of "content" array (not full field)
        // The original editor handled parsing.
        // Logic from original:
        // if (isValidJSON(content)) ... const parseContent = JSON.parse(content)
        // if (Array.isArray(parseContent)) ... editor.commands.setContent(newParseData)

        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          // Tiptap setContent expects a Document or JSON object or HTML.
          // If parsed is an array of nodes, we wrap it in doc?
          // No, editor.getJSON().content IS an array.
          // So we should setContent({ type: 'doc', content: parsed })
          editor.commands.setContent({
            type: "doc",
            content: parsed,
          });
        } else {
          // Maybe it's HTML string?
          editor.commands.setContent(content);
        }
      } catch (e) {
        // Fallback if not JSON
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4 cursor-default">
      <EditorContent
        editor={editor}
        className={cn(
          "tiptap-wrapper-1 max-w-full w-full max-h-full h-full flex flex-col items-center justify-center focus-visible:outline-0",
        )}
      />
    </div>
  );
}
