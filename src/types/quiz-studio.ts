export const QUIZ_TYPE = {
  fill_in_the_blank: "fill_in_the_blank",
  drag_and_drop: "drag_and_drop",
  drop_box: "drop_box",
  multiple_choice: "multiple_choice",
  single_choice: "single_choice",
  matching: "matching",
  essay: "essay",
  true_false: "true_false",
  ordering: "ordering",
};

export interface RenderQuestionAnswersProps {
  item: any;
  results?: any;
  config?: any;
  handleJSONChange?: (json: any) => void;
  isCorrect?: boolean;
  externalAnswers?: any[];
}
