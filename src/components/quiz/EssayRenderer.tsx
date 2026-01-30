import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { Bold, Italic, List, ListOrdered } from "lucide-react";

interface EssayRendererProps {
  onAnswer: (answer: string) => void;
  disabled?: boolean;
  defaultValue?: string;
}

export const EssayRenderer = ({
  onAnswer,
  disabled,
  defaultValue = "",
}: EssayRendererProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Nhập câu trả lời của bạn...",
      }),
    ],
    content: defaultValue,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onAnswer(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[150px] p-4 border rounded-md bg-white",
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full flex flex-col gap-2">
      {!disabled && (
        <div className="flex items-center gap-1 border rounded-md p-1 bg-gray-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={editor.isActive("bold") ? "bg-gray-200" : ""}
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={editor.isActive("italic") ? "bg-gray-200" : ""}
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive("bulletList") ? "bg-gray-200" : ""}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive("orderedList") ? "bg-gray-200" : ""}
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
        </div>
      )}
      <EditorContent editor={editor} className="w-full" />
    </div>
  );
};
