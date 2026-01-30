import { Button } from "@/components/ui/button";
import { useQuizFormStudioStore } from "@/stores/use-quiz-studio-store";
import { QUIZ_TYPE } from "@/types/quiz-studio";
import { BubbleMenu, Editor } from "@tiptap/react";
import { PlusIcon } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
// import { useShallow } from 'zustand/react/shallow' // Removing shallow to avoid dependency or use standard

interface BubbleQuizContentProps {
  id: string | undefined;
  codeQuiz: string | undefined;
  editor: Editor | null;
}

export default function BubbleFloatingFillMenu({
  id,
  editor,
  codeQuiz,
}: BubbleQuizContentProps) {
  // Simplified for playback/mock
  return null;
  /* 
     This menu is for ADDING blanks. In Play mode we don't need it.
     Returning null saves us from porting the logic.
  */
}
