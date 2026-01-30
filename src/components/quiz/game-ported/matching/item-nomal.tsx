import ItemDrop from "./item-drop";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { ItemChildProps } from "./type";
import { memo, useEffect, useRef, useState } from "react";
import { isEmpty } from "lodash-es";
import { Material_Code } from "@/lib/material-utils";
// import useDoQuiz from '../../_hooks/useDoQuiz'

const LatexEditor = dynamic(() => import("@/components/base/latex-editor"), {
  ssr: false,
});
const MediaRender = dynamic(() => import("@/components/base/media-render"), {
  ssr: false,
});

const ItemNomal = ({ item, borderColor }: ItemChildProps) => {
  // const { isQuizPreview } = useDoQuiz()
  const isQuizPreview = true; // Default to true or handle props
  const { id, embedded_url, file_urls, content, asset_type, is_correct } = item;
  const [heightItemDrop, setHeightItemDrop] = useState<string>("100%");
  const divRef = useRef<HTMLDivElement>(null);
  const saveHeightItem = useRef("");
  const [dragHeight, setDragHeight] = useState<number>(0);
  let url = "";
  if (file_urls && file_urls.url) {
    url = file_urls.url;
  }
  if (embedded_url) {
    url = embedded_url;
  }

  useEffect(() => {
    if (!isEmpty(item) && divRef.current && isEmpty(saveHeightItem.current)) {
      if (!isEmpty(content)) {
        setHeightItemDrop(`${divRef.current.offsetHeight}px`);
        saveHeightItem.current = `${divRef.current.offsetHeight}px`;
      }
    }
  }, [item]);

  useEffect(() => {
    setHeightItemDrop("auto");
  }, [content, url]);

  return (
    <div key={id} className="relative w-full z-[2]">
      <div
        ref={divRef}
        style={{
          height: heightItemDrop,
          borderColor: borderColor,
          transition: "height 0.3s ease",
        }}
        className={cn(
          "item_nomal w-full flex flex-col gap-2 items-center justify-center md:flex-row md:items-center md:justify-start border-2 border-blue-500 bg-white rounded-xl p-2 pr-6 min-h-28 relative z-[1] transition-all",
          !isQuizPreview && is_correct === false && "!border-red-500 bg-red-50",
          !isQuizPreview &&
            is_correct === true &&
            "!border-green-500 bg-green-50",
          // Mobile layout:
          "max-sm:flex-col max-sm:items-center max-sm:justify-center",
        )}
      >
        <div
          className={cn(
            !content && asset_type?.includes(Material_Code.AUDIO) && "w-full",
            // Mobile: imgage always on top
            "order-1 md:order-none",
          )}
        >
          {url !== "" && (
            <MediaRender
              url={url}
              type={(asset_type as Material_Code) || ""}
              containerClass={cn(
                "bg-gray-200 aspect-[4/3] rounded-xl overflow-hidden",
                // mobile
                "w-full max-w-[120px]",
                // tablet/desktop
                "md:w-[120px] md:max-w-none",
                asset_type?.includes(Material_Code.AUDIO) &&
                  "aspect-auto p-2 bg-transparent",
              )}
              isMini={
                content && asset_type?.includes(Material_Code.AUDIO)
                  ? true
                  : false
              }
            ></MediaRender>
          )}
        </div>
        {content && (
          <div
            className={cn(
              "w-full break-words whitespace-normal text-center overflow-hidden",
              "max-sm:text-center max-md:w-full max-md:text-sm max-sm:text-xs",
              // url !== '' ? 'max-sm:mt-2' : 'max-sm:mt-0',
              // Mobile: text always on bottom if have image, or in center if not have image
              "order-2 md:order-none",
            )}
          >
            <LatexEditor content={content} />
          </div>
        )}
        <div
          style={{ borderColor: borderColor }}
          className={`item-nomal absolute right-[-2px] top-1/2 -translate-y-1/2 border-2 border-blue-500 !border-r-transparent w-4 h-7 rounded-s-lg bg-white`}
        ></div>
      </div>
      <ItemDrop
        item={item}
        borderColor={borderColor}
        handleCheckAfterDrop={(dragItemHeight) => {
          if (divRef.current) {
            const normalHeight = divRef.current.offsetHeight;
            const padding = 24;
            if (dragItemHeight > normalHeight) {
              setHeightItemDrop(`${dragItemHeight + padding}px`);
              setDragHeight(dragItemHeight + padding);
            } else if (dragItemHeight < normalHeight) {
              setDragHeight(normalHeight);
              setHeightItemDrop(`${normalHeight}px`);
            }
          }
        }}
        dragHeight={dragHeight}
      />
    </div>
  );
};

export default memo(ItemNomal);
