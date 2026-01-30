import { cn } from "@/lib/utils";
import { Material_Code } from "@/lib/material-utils";
import { useDraggable } from "@dnd-kit/core";
import dynamic from "next/dynamic";
import { CSSProperties, memo, useEffect, useRef } from "react";
import { ItemChildProps } from "./type";
// import useDoQuiz from '../../_hooks/useDoQuiz'
const LatexEditor = dynamic(() => import("@/components/base/latex-editor"), {
  ssr: false,
});
const MediaRender = dynamic(() => import("@/components/base/media-render"), {
  ssr: false,
});

const ItemDrag = ({
  item,
  is_sticky,
  drag_type,
  borderColor,
  handleCheckAfterDrop,
  style: customStyle,
}: ItemChildProps & { style?: React.CSSProperties }) => {
  const { id, embedded_url, file_urls, content, asset_type, is_correct } = item;
  // const { isQuizPreview } = useDoQuiz()
  const isQuizPreview = true; // Default stub
  const mediaRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: "drag-item-" + id,
      data: {
        type: drag_type,
        id: id,
      },
    });

  let url = "";
  if (file_urls && file_urls.url) {
    url = file_urls.url;
  }
  if (embedded_url) {
    url = embedded_url;
  }

  const style = {
    borderColor: borderColor,
    zIndex: isDragging ? 999 : 1,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    visibility: isDragging
      ? "hidden"
      : ("visible" as CSSProperties["visibility"]),
  };

  const getMax = (a: number, b: number) => {
    return Math.max(a, b);
  };

  useEffect(() => {
    if (
      is_sticky &&
      handleCheckAfterDrop &&
      (mediaRef.current || contentRef.current)
    ) {
      setTimeout(() => {
        const mediaHeight = mediaRef.current?.offsetHeight || 0;
        const contentHeight = contentRef.current?.offsetHeight || 0;
        let paddingHeight = 0;
        let borderHeight = 0;
        const isDekstop = window.innerWidth >= 1024;
        if (!isDekstop) {
          paddingHeight = 16;
          borderHeight = 4;
        }
        const finalHeight =
          mediaHeight + contentHeight + paddingHeight + borderHeight;
        handleCheckAfterDrop(finalHeight);
      }, 30);
    }
  }, [is_sticky, item, content]);

  return (
    <div
      className={cn(
        "item_drag w-full relative flex max-md:flex-wrap gap-2 items-center justify-start rounded-xl min-h-28 bg-white",
        "border-2 border-gray-300 p-2",
        is_sticky && "border-blue-500 h-full",
        !content && "pl-5",
        !isQuizPreview && is_correct === false && "!border-red-500 bg-red-50",
        !isQuizPreview &&
          is_correct === true &&
          "!border-green-500 bg-green-50",
        // Mobile:
        url !== "" &&
          content &&
          "max-sm:!grid max-sm:!grid-cols-1 max-sm:!gap-2 max-sm:!items-center max-sm:!justify-items-center",
        url === "" &&
          content &&
          "max-sm:!flex max-sm:!items-center max-sm:!justify-center",
      )}
      style={{ ...style, ...customStyle }}
      ref={setNodeRef}
    >
      <div
        className="absolute top-0 right-0 left-0 bottom-0 z-20 cursor-move"
        {...listeners}
        {...attributes}
      ></div>
      {url !== "" && (
        <div
          ref={mediaRef}
          className={cn(
            "relative z-[2]",
            !content && asset_type?.includes(Material_Code.AUDIO) && "w-full",
            // Mobile: image always on top
            "max-md:w-full max-md:flex max-md:justify-center",
          )}
        >
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
            handleImageLoadDone={(check) => {
              if (
                check &&
                is_sticky &&
                mediaRef.current &&
                contentRef.current
              ) {
                const mediaHeight = mediaRef.current.offsetHeight;
                const contentHeight = contentRef.current.offsetHeight;
                const finalHeight = getMax(mediaHeight, contentHeight);
                if (handleCheckAfterDrop) handleCheckAfterDrop(finalHeight);
              }
            }}
          />
        </div>
      )}
      <div
        ref={contentRef}
        className={cn(
          "relative z-[2] break-words whitespace-normal overflow-hidden",
          content &&
            cn(
              "text-center w-full max-md:text-sm max-sm:text-center max-md:w-full max-sm:text-xs",
              // url !== '' ? 'max-sm:mt-2' : 'max-sm:mt-0'
            ),
        )}
      >
        {content && <LatexEditor content={content} />}
      </div>
      <div
        style={{ borderColor: is_correct === null ? borderColor : "" }}
        className={cn(
          "item-drag absolute -left-4 top-1/2 -translate-y-1/2 border-2 border-gray-300 !border-r-transparent w-4 h-7 rounded-s-lg bg-white",
          !isQuizPreview &&
            is_correct === false &&
            "border-red-500 bg-red-50 !border-r-red-50",
          !isQuizPreview &&
            is_correct === true &&
            "border-green-500 bg-green-50 !border-r-green-50",
        )}
      ></div>
    </div>
  );
};

export default memo(ItemDrag);
