import { create } from "zustand";

interface QuizFormStudioStore {
  arrayQuizzAnswers: any[];
  setArrayQuizzAnswers: (answers: any[]) => void;
  setIdAnswerDelete: (id: string) => void;
  setObjAnswerContent: (content: any) => void;
}

export const useQuizFormStudioStore = create<QuizFormStudioStore>((set) => ({
  arrayQuizzAnswers: [],
  setArrayQuizzAnswers: (answers) => set({ arrayQuizzAnswers: answers }),
  setIdAnswerDelete: (id) => console.log("Mock setIdAnswerDelete", id),
  setObjAnswerContent: (content) =>
    console.log("Mock setObjAnswerContent", content),
}));
