"use client";

import { memo } from "react";
import GameQuizRenderer, {
  GameQuestion,
} from "@/components/quiz/game-ported/GameQuizRenderer";
import RenderTiptapContent from "@/components/base/render-tiptap-content";
import { cn } from "@/lib/utils";

interface GameOneQuestionRendererProps {
  question: GameQuestion;
  onAnswer: (choiceIds: string[]) => void;
  isCorrect?: boolean;
  disabled?: boolean;
  externalAnswers?: any[];
}

/**
 * Wrapper for GameQuizRenderer to ensure consistent styling for single question view
 * in Presentation Mode.
 */
function GameOneQuestionRenderer({
  question,
  onAnswer,
  isCorrect,
  disabled,
  externalAnswers,
}: GameOneQuestionRendererProps) {
  return (
    <div className="w-full max-w-4xl mx-auto h-full flex flex-col items-center justify-center">
      {/* Question Text */}
      <div className="w-full mb-8 px-4 flex justify-center">
        <div className="prose dark:prose-invert max-w-none text-2xl md:text-3xl font-bold text-center leading-relaxed drop-shadow-sm [&_.tiptap]:text-center [&_p]:text-center">
          <RenderTiptapContent content={question.content} />
        </div>
      </div>

      {/* Answer Area - using the ported renderer */}
      <div
        className={cn(
          "w-full flex-1 overflow-y-auto px-4 pb-20 custom-scrollbar",
          disabled && "opacity-90 pointer-events-none",
        )}
      >
        <GameQuizRenderer
          question={question}
          onAnswer={onAnswer}
          isCorrect={isCorrect}
          disabled={disabled}
          externalAnswers={externalAnswers}
        />
      </div>
    </div>
  );
}

export default memo(GameOneQuestionRenderer);
