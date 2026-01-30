import { InputRule, mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import InputFillDragDrop from "./component";

const InputFillDragDropRegex = /__$/;
const MAX_ANSWERS = 10;

export default Node.create({
  name: "fill-drag-drop",
  group: "inline",
  inline: true,
  atom: false,
  content: "block*",

  addAttributes() {
    return {
      id: { default: null },
      quizId: { default: null },
      is_correct: { default: null },
      description: { default: null },
      fill_order: { default: null },
      content: { default: null },
      is_new: { default: null },
      is_deleted: { default: null },
      item_drop: { default: null },
      children: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-fill-drag-drop]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["fill-drag-drop", mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(InputFillDragDrop);
  },

  addInputRules() {
    return [
      new InputRule({
        find: InputFillDragDropRegex,
        //@ts-expect-error todo
        handler: ({ state, range }) => {
          // No op in View Mode
          return null;
        },
      }),
    ];
  },
});
