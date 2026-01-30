export enum QuizImageLabelAlignment {
  TOP = "top",
  BOTTOM = "bottom",
  LEFT = "left",
  RIGHT = "right",
}

export interface QuizImageLabel {
  id: string;
  content: string;
  left?: number;
  top?: number;
  alignment?: QuizImageLabelAlignment;
  fillOrder?: number;
}

export interface QuizImageLabelAnswer extends QuizImageLabel {
  answerId?: string;
  isCorrect?: boolean;
  isError?: boolean;
}
