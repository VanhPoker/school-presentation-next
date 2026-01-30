import { SlideElement } from "@/types/slide";
import { Material_Code, getCategoryIcon } from "@/lib/material-utils";
import { cn } from "@/lib/utils";

interface QuizElementProps {
  element: SlideElement;
}

export function QuizElement({ element }: QuizElementProps) {
  const { content } = element;

  return (
    <div className="w-full h-full bg-sidebar border-2 border-primary/50 rounded-xl relative overflow-hidden group">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary via-background to-background" />

      {/* Content Container */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        {content.thumbnail ? (
          <img
            src={content.thumbnail}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-20 blur-[2px]"
          />
        ) : null}

        <div className="z-10 bg-background/80 backdrop-blur-md p-4 rounded-full shadow-glow mb-4 border border-primary/20">
          {getCategoryIcon(Material_Code.EXAM, 32)}
        </div>

        <h3 className="z-10 text-lg font-bold text-foreground truncate max-w-full px-4 text-center">
          {content.title || "Bài kiểm tra"}
        </h3>

        <div className="z-10 mt-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-xs font-medium text-primary">
          Interactive Quiz
        </div>
      </div>

      {/* Editor Overlay Hint */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <span className="text-white font-medium text-sm">
          Hiển thị khi trình chiếu
        </span>
      </div>
    </div>
  );
}
