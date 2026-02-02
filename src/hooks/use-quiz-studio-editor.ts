import { v4 as uuidv4 } from "uuid";

export default function useQuizStudioEditor() {
  const InputfillDragDropNodes = ["fill-drag-drop"];

  const isValidJSON = (str: string) => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };

  const collectFillDragDrop = (items: any, result: any = []) => {
    let arrays: any = items;
    if (isValidJSON(items)) {
      const parseItems = JSON.parse(items);
      arrays = parseItems;
    }
    if (Array.isArray(arrays)) {
      arrays.forEach((node: any) => {
        if (!node) return node;
        if (InputfillDragDropNodes.includes(node.type)) {
          result.push(node);
        }
        if (Array.isArray(node.content) && node.content.length > 0) {
          collectFillDragDrop(node.content, result);
        }
      });
    }
    return result;
  };

  const updateFillDragDrop = (
    items: any,
    is_list: boolean | undefined,
    is_practise: boolean | undefined,
    codeQuiz: string | undefined,
  ) => {
    return items.map((node: any) => {
      if (!node) return node;
      if (InputfillDragDropNodes.includes(node.type)) {
        if (is_list) {
          node.attrs.description = "list - " + codeQuiz;
        }
        if (is_practise) {
          node.attrs.description = "practise - " + codeQuiz;
        }
        if (!is_list && !is_practise) {
          node.attrs.description = "edit - " + codeQuiz;
          if (node.attrs.is_correct === null) {
            node.attrs.is_correct = true;
          }
          if (node.attrs.is_new === null) {
            node.attrs.is_new = true;
          }
          if (node.attrs.is_deleted === null) {
            node.attrs.is_deleted = false;
          }
          if (node.attrs.id === null) {
            node.attrs.id = uuidv4().slice(0, 5); // uuid mimic nanoid(5)
          }
        }
        return {
          ...node,
        };
      }
      if (node.content) {
        return {
          ...node,
          content: updateFillDragDrop(
            node.content,
            is_list,
            is_practise,
            codeQuiz,
          ),
        };
      }
      return node;
    });
  };

  const replaceDescriptionFillDragDrop = (
    items: any,
    is_list: boolean | undefined,
    is_practise: boolean | undefined,
    id: string | undefined,
    codeQuizOverride?: string, // Optional: use this codeQuiz if description doesn't have one
  ) => {
    return items.map((node: any) => {
      if (!node) return node;
      if (InputfillDragDropNodes.includes(node.type)) {
        node.attrs.quizId = id ? id : null;

        // Extract existing codeQuiz from description if exists, or use override
        let codeQuiz = codeQuizOverride || "";
        if (
          node.attrs.description &&
          typeof node.attrs.description === "string"
        ) {
          // Format: "mode - codeQuiz" (e.g., "edit - fill_in_the_blank")
          const parts = node.attrs.description.split(" - ");
          if (parts.length > 1) {
            codeQuiz = parts.slice(1).join(" - "); // Handle codeQuiz with dashes
          } else {
            // Maybe description is just the codeQuiz or something else, keep it
            codeQuiz = node.attrs.description;
          }
        }

        // Set description directly based on mode
        if (is_list) {
          node.attrs.description = "list - " + codeQuiz;
        } else if (is_practise) {
          node.attrs.description = "practise - " + codeQuiz;
        } else {
          node.attrs.description = "edit - " + codeQuiz;
        }

        return {
          ...node,
        };
      }
      if (node.content) {
        return {
          ...node,
          content: replaceDescriptionFillDragDrop(
            node.content,
            is_list,
            is_practise,
            id,
            codeQuizOverride,
          ),
        };
      }
      return node;
    });
  };

  return {
    InputfillDragDropNodes,
    isValidJSON,
    collectFillDragDrop,
    updateFillDragDrop,
    replaceDescriptionFillDragDrop,
  };
}
