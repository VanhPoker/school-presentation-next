import { cn } from "@/lib/utils";
import { memo } from "react";
import dynamic from "next/dynamic";
import { InputChildProps } from "./types";
const LatexEditor = dynamic(() => import("@/components/base/latex-editor"), {
  ssr: false,
});

const InputPractiseFill = ({
  isTable,
  valueInput,
  handleChangeInputValue,
}: InputChildProps) => {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className={cn(isTable ? "min-w-20 w-full pl-1" : "min-w-40 w-auto")}>
        <div className="border rounded px-2 py-1 min-w-[100px] bg-white">
          <input
            className="w-full outline-none bg-transparent"
            value={valueInput?.replace(/<[^>]*>?/gm, "") || ""} // Strip HTML for input
            onChange={(e) => handleChangeInputValue?.(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default memo(InputPractiseFill);
