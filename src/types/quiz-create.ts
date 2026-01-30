export enum QuizCreateResource {
  MANUAL = "manual",
  AI_GEN = "ai-gen",
  STORAGE = "storage",
}

export enum QuizImageLabelAlignment {
  LEFT = "LEFT",
  RIGHT = "RIGHT",
  TOP = "TOP",
  BOTTOM = "BOTTOM",
}
export interface QuizImageLabel {
  left: number;
  top: number;
  id: string;
  value: string;
  alignment: QuizImageLabelAlignment;
  content?: string;
  is_correct?: boolean;
  is_existed?: boolean;
  is_deleted?: boolean;
  is_new?: boolean;
}
export interface QuizImageLabelAnswer extends Partial<QuizImageLabel> {
  answerId?: string;
  hotspotsId?: string;
  isError?: boolean;
  isCorrect?: boolean;
  fillOrder?: number;
}
