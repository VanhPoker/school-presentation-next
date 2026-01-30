import { cn } from "@/lib/utils";
import { memo, useEffect, useMemo, useState } from "react";
import { InputChildProps } from "./types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import dynamic from "next/dynamic";
const LatexEditor = dynamic(() => import("@/components/base/latex-editor"), {
  ssr: false,
});

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]; // clone để không mutate props
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    //@ts-expect-error todo
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const InputPractiseDrop = ({
  isTable,
  childrenList,
  handleChangeInputValue,
  item_drop,
}: InputChildProps & { item_drop?: any }) => {
  const [valueSelect, setValueSelect] = useState<string>("");
  const [idSelect, setIdSelect] = useState<string>("");
  // Normalize childrenList - handle cases where it's an object with 'data' property
  const normalizedChildrenList = useMemo(() => {
    if (!childrenList) return [];
    if (Array.isArray(childrenList)) return childrenList;
    // Handle case where children is { data: [...] }
    if (childrenList.data && Array.isArray(childrenList.data))
      return childrenList.data;
    return [];
  }, [childrenList]);

  const shuffled = useMemo(
    () => shuffleArray(normalizedChildrenList),
    [normalizedChildrenList],
  );
  useEffect(() => {
    if (item_drop && item_drop.answer_id) {
      const answerId = item_drop.answer_id;
      setIdSelect(answerId);
      const found = normalizedChildrenList?.find((x: any) => x.id === answerId);
      if (found) setValueSelect(found.content);
    }
  }, [item_drop, normalizedChildrenList]);

  useEffect(() => {
    if (idSelect) {
      const checkItem = normalizedChildrenList.find((x: any) => {
        return x.id === idSelect;
      });
      if (checkItem) {
        const { id, content } = checkItem;
        setValueSelect(content);
        if (handleChangeInputValue) handleChangeInputValue(content, id);
      } else {
        setValueSelect("Không tìm thấy");
        if (handleChangeInputValue)
          handleChangeInputValue("Không tìm thấy", "");
      }
    }
  }, [idSelect, normalizedChildrenList, handleChangeInputValue]); // Added dependencies to fix warning

  return (
    <div className="flex items-center justify-center gap-2">
      <div className={cn(isTable ? "min-w-20 w-full pl-1" : "min-w-40 w-auto")}>
        <Select
          value={idSelect}
          onValueChange={(id: string) => {
            setIdSelect(id);
          }}
        >
          <SelectTrigger
            className="rounded-lg w-full border-transparent p-0 shadow-none data-[state=open]:!border-transparent"
            value={idSelect}
          >
            <div className="flex items-center justify-center w-full">
              <LatexEditor content={valueSelect} />
            </div>
          </SelectTrigger>
          <SelectContent position="popper">
            {shuffled &&
              shuffled.map((item: any) => {
                const { id, content } = item;
                return (
                  <SelectItem key={id} value={id}>
                    <LatexEditor content={content} />
                  </SelectItem>
                );
              })}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default memo(InputPractiseDrop);
