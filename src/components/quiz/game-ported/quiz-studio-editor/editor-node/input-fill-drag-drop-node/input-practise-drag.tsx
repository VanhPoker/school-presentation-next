import { cn } from "@/lib/utils";
import { memo } from "react";
import dynamic from "next/dynamic";
import { isEmpty } from "lodash-es";
import InputPractiseDragChild from "./input-practise-drag-child";
import { Drag_Type } from "../../../../matching/type"; // Need to check this import path!
import { InputChildProps } from "./component";

const LatexEditor = dynamic(() => import("@/components/base/latex-editor"), {
  ssr: false,
});

const InputPractiseDrag = ({ isTable, item_drop }: InputChildProps) => {
  return (
    <div className="flex items-center justify-center gap-2">
      {isEmpty(item_drop) ? (
        <div
          className={cn(isTable ? "min-w-20 w-full pl-1" : "min-w-20 w-auto")}
        >
          <LatexEditor
            content={""}
            editable={false}
            className={cn(
              isTable &&
                "[&_.ProseMirror]:overflow-hidden [&_.ProseMirror_p]:whitespace-nowrap",
            )}
            disableEnter={true}
          />
        </div>
      ) : (
        <InputPractiseDragChild
          isTable={isTable}
          dragType="drag_out" // Hardcoded or imported Drag_Type.out.
          // Drag_Type is from matching/type.
          // I should probably define Drag_Type in types/quiz-studio.ts or locally.
          // Original import: import { Drag_Type } from '@/components/quiz-studio/quiz-rehearsal/quiz-types/matching/type'
          item={item_drop}
        />
      )}
    </div>
  );
};

export default memo(InputPractiseDrag);
