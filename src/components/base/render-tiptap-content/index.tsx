import { MathInline } from "@/components/base/tiptap/extensions/math";
import { AnyExtension, useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import "./style.scss";

import InputFillDragDropNode from "@/components/base/tiptap/nodes/input-fill-drag-drop-node";
import { Table } from "@/components/base/tiptap/nodes/table/table";
import { TableRow } from "@/components/base/tiptap/nodes/table/table-row";
import { TableCell } from "@/components/base/tiptap/nodes/table/table-cell";
import { TableHeader } from "@/components/base/tiptap/nodes/table/table-header";
import { Heading } from "@/components/base/tiptap/extensions/heading";
type RenderTiptapContentProps = {
  content: string;
  id?: string;
};
export default function RenderTiptapContent({
  content,
  id = "render-tiptap-content",
}: RenderTiptapContentProps) {
  const editor = useEditor({
    immediatelyRender: true,
    extensions: [
      StarterKit.configure({
        dropcursor: false,
        heading: false,
      }) as AnyExtension,
      Heading,
      MathInline,
      InputFillDragDropNode,
      Table.configure({
        resizable: false,
        lastColumnResizable: false,
        allowTableNodeSelection: false,
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    editorProps: {
      attributes: {
        class: "!p-0 !min-h-[unset] w-full !max-w-none",
      },
    },
  });
  useEffect(() => {
    if (editor && content) {
      const trimmedContent = content.trim();
      let isJson = false;

      // Try to parse as JSON if it looks like an array or object
      if (trimmedContent.startsWith("[") || trimmedContent.startsWith("{")) {
        try {
          const parseData = JSON.parse(
            trimmedContent.replace(/<p>\s*<\/p>/gi, ""),
          );
          if (Array.isArray(parseData)) {
            console.log(
              "[RenderTiptapContent] Successfully parsed JSON array:",
              parseData,
            );
            editor.commands.setContent(
              parseData.filter((item) => item.content),
            );
            isJson = true;
          } else if (typeof parseData === "object") {
            // Handle single object doc if valid Tiptap JSON
            console.log(
              "[RenderTiptapContent] Successfully parsed JSON object:",
              parseData,
            );
            editor.commands.setContent(parseData);
            isJson = true;
          }
        } catch (error) {
          console.error("[RenderTiptapContent] JSON parse error:", error);
          // Fallback to HTML if parse fails
        }
      }

      if (!isJson) {
        console.log(
          "[RenderTiptapContent] Rendering as HTML/Text:",
          trimmedContent.substring(0, 50) + "...",
        );
        const cleanContent = content.replace(/<p>\s*<\/p>/gi, "");
        editor.commands.setContent(cleanContent);
      }

      editor.setOptions({ editable: false });
    }
  }, [content, editor]);
  if (!editor) return null;
  return (
    <EditorContent
      id="render-tiptap-content"
      className="w-full"
      editor={editor}
    />
  );
}
