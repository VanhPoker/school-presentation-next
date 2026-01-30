import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";

type QuizEditorProps = {
  editorRef?: React.RefObject<any>;
  handleEssayChange?: (content: string) => void;
  externalAnswer?: string;
};

const Essay = ({
  editorRef,
  handleEssayChange,
  externalAnswer,
}: QuizEditorProps) => {
  const [content, setContent] = useState(externalAnswer || "");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    if (handleEssayChange) {
      handleEssayChange(val);
    }
  };

  useEffect(() => {
    setContent(externalAnswer || "");
  }, [externalAnswer]);

  return (
    <div className="w-full">
      <Textarea
        value={content}
        onChange={handleChange}
        placeholder="Nhập câu trả lời của bạn..."
        className="min-h-[200px] text-lg p-4"
      />
    </div>
  );
};

export default Essay;
