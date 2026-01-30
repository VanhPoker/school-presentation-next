import { cn } from "@/lib/utils";
import { memo } from "react";
import dynamic from "next/dynamic";
// import { isEmpty } from "lodash";
const isEmpty = (value: any) => {
  return (
    value == null ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === "object" && Object.keys(value).length === 0) ||
    (typeof value === "string" && value.length === 0)
  );
};
import InputPractiseDragChild from "./input-practise-drag-child";
import { Drag_Type } from "../../matching/type";
import { InputChildProps } from "./types";
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
          <div className="h-6 bg-gray-100 rounded w-full"></div>
        </div>
      ) : (
        <InputPractiseDragChild
          isTable={isTable}
          dragType={Drag_Type.out}
          item={item_drop}
        />
      )}
    </div>
  );
};

export default memo(InputPractiseDrag);
