import React, { useEffect, useRef, useState } from "react";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import { Drop_Type } from "../../matching/type";
// import { isEmpty } from "lodash";
const isEmpty = (value: any) => {
  return (
    value == null ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === "object" && Object.keys(value).length === 0) ||
    (typeof value === "string" && value.length === 0)
  );
};
import InputPractiseFill from "./input-practise-fill";
import InputPractiseDrag from "./input-practise-drag";
import InputPractiseDrop from "./input-practise-drop";

import { InputChildProps } from "./types";

const QUIZ_TYPE = {
  fill_in_the_blank: "fill_in_the_blank",
  drag_and_drop: "drag_and_drop",
  drop_box: "drop_box",
};

export default function InputFillDragDrop({
  deleteNode,
  updateAttributes,
  node,
  editor,
}: NodeViewProps) {
  const {
    id,
    quizId,
    is_correct,
    description,
    fill_order,
    content,
    item_drop,
    children,
  } = node.attrs;

  const [boderColor, setBorderColor] = useState<string>("");
  const [valueInput, setValueInput] = useState<string>("");
  const [isPractise, setIsPractise] = useState(false);
  const [isFill, setIsFill] = useState(false);
  const [isDrag, setIsDrag] = useState(false);
  const [isDrop, setIsDrop] = useState(false);
  const [currentIdAnswer, setCurrentIdAnswer] = useState<string>("");
  const [isTable] = useState(editor.isActive("table"));
  const [dropType, setDropType] = useState<string>(Drop_Type.empty);
  const isContentTextSet = useRef(false);

  const { setNodeRef, isOver } = useDroppable({
    id: "input-drop-zone-" + id,
    data: {
      id: id,
      type: dropType,
    },
  });

  const handleChangeInputValue = (value: string, id?: string) => {
    // Basic text update
    const finalValueInput = value; // Don't wrap in P tags to keep it simple for now, or match logic
    setValueInput(finalValueInput);

    // Update attributes for Tiptap JSON syncing
    if (isPractise && isFill) {
      updateAttributes({
        ...node.attrs,
        item_drop: {
          ...node.attrs.item_drop,
          content: finalValueInput,
        },
      });
    }

    if (isPractise && isDrop) {
      const checkItem = children.find((x: any) => {
        return x.id === id;
      });
      if (checkItem) {
        const { fill_order, is_correct } = checkItem;
        updateAttributes({
          ...node.attrs,
          item_drop: {
            ...node.attrs.item_drop,
            content: finalValueInput,
            fill_order: fill_order,
            is_correct: is_correct,
            answer_id: id,
          },
        });
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    // This looks like legacy native DragDrop. DndKit handles this in the main component (DragBox).
    // So this might not be triggered if DndKit captures it.
    // However, the original code had it.
    e.preventDefault();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  useEffect(() => {
    if (fill_order) {
      // Inline common colors
      const colors = ["#F04438", "#12B76A", "#2E90FA", "#FD853A", "#9E77ED"];
      const bordercolor = colors[fill_order - 1] || "";
      setBorderColor(bordercolor || "");
    }
  }, [fill_order]);

  useEffect(() => {
    // Assuming Game Mode is always "Practise"
    setIsPractise(true);

    // Safety check if description is missing (sometimes happens)
    const desc = description || "";

    if (desc.includes(QUIZ_TYPE.fill_in_the_blank) || desc.includes("fill")) {
      setIsFill(true);
      setIsDrag(false);
      setIsDrop(false);
    } else if (
      desc.includes(QUIZ_TYPE.drag_and_drop) ||
      desc.includes("drag")
    ) {
      setIsFill(false);
      setIsDrag(true);
      setIsDrop(false);
    } else if (desc.includes(QUIZ_TYPE.drop_box) || desc.includes("drop")) {
      setIsFill(false);
      setIsDrag(false);
      setIsDrop(true);
    } else {
      // Fallback detection based on props
      if (children && children.length > 0) {
        setIsDrop(true);
      } else {
        // Default to fill
        setIsFill(true);
      }
    }
  }, [description, children]);

  useEffect(() => {
    if (!isContentTextSet.current) {
      if (content) {
        setValueInput(content);
      } else {
        setValueInput("");
      }
      isContentTextSet.current = true;
    }
  }, [content]);

  useEffect(() => {
    if (isEmpty(item_drop)) {
      setDropType(Drop_Type.empty);
    } else {
      setValueInput(item_drop.content || "");
      setDropType(Drop_Type.replace);
    }
  }, [item_drop]);

  return (
    <NodeViewWrapper
      className={cn("inline-block", isTable && "max-w-full")}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {isPractise && isDrag && (
        <div
          ref={setNodeRef}
          contentEditable="false"
          suppressContentEditableWarning
          className={cn(
            `isPractiseDrag rounded-lg transition-all border-2 bg-white px-1 py-0 mx-1 mb-1 min-h-9 cursor-move border-dashed relative`,
            isOver && "border-blue-500",
            is_correct === false && "border-red-500",
            is_correct === true && "border-green-500",
          )}
        >
          <InputPractiseDrag isTable={isTable} item_drop={item_drop} />
        </div>
      )}
      {isPractise && isFill && (
        <div
          contentEditable="false"
          suppressContentEditableWarning
          className={cn(
            "isPractiseFill rounded-lg transition-all border-2 bg-white px-1 py-1 mx-1 mb-1 min-h-9 cursor-text",
            is_correct === false && "border-red-500",
            is_correct === true && "border-green-500",
          )}
        >
          <InputPractiseFill
            isTable={isTable}
            valueInput={valueInput}
            handleChangeInputValue={handleChangeInputValue}
          />
        </div>
      )}
      {isPractise && isDrop && (
        <div
          contentEditable="false"
          suppressContentEditableWarning
          className={cn(
            "isPractiseDrop rounded-lg transition-all border-2 bg-white px-1 py-0 mx-1 mb-1 min-h-9 cursor-text",
            is_correct === false && "border-red-500",
            is_correct === true && "border-green-500",
          )}
        >
          <InputPractiseDrop
            isTable={isTable}
            childrenList={children}
            handleChangeInputValue={handleChangeInputValue}
            item_drop={item_drop}
          />
        </div>
      )}
    </NodeViewWrapper>
  );
}
