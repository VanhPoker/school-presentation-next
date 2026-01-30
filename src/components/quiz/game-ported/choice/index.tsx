import RenderTiptapContent from "@/components/base/render-tiptap-content";
import AudioWaveform from "@/components/ui/wave-audio-player";
import { Hotspots } from "@/graphql/generated";
import { cn } from "@/lib/utils";
import { isArray } from "lodash-es";
import Image from "next/image";
import { memo, useEffect, useState } from "react";
import ReactPlayer from "react-player";

type Payload = {
  hotspots_id: string;
};

type Props = {
  hotspots: Hotspots[];
  isMultiple?: boolean;
  onChange?: (payload: Payload[]) => void;
  isCorrect?: boolean;
  externalAnswers?: any[];
};

interface Choice {
  id: string;
  content: string;
  fileUrl?: string;
  assetType?: string;
  isSelected?: boolean;
  label?: string;
}

const Choice = ({
  hotspots,
  isMultiple = false,
  onChange,
  isCorrect,
  externalAnswers,
}: Props) => {
  const [choices, setChoices] = useState<Choice[]>([]);
  const [isAllCorrect, setIsAllCorrect] = useState<boolean | undefined>();
  const textOnlyChoices = choices.filter((item) => !item.fileUrl);
  const imageChoices = choices.filter((item) => item.fileUrl);
  const hasImageChoices = imageChoices.length > 0;

  const renderMedia = (fileUrl?: string, assetType?: string) => {
    if (!fileUrl || !assetType) return null;
    if (assetType === "images") {
      return (
        <div className="aspect-[4/3] relative w-full mb-3 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
          <Image
            src={fileUrl}
            alt="Choice item"
            fill
            className="object-contain"
          />
        </div>
      );
    }

    if (assetType === "audios") {
      return (
        <div className="w-full mb-3 flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <AudioWaveform audioUrl={fileUrl} />
        </div>
      );
    }
    if (assetType === "videos") {
      return (
        <div className="aspect-video w-full mb-3 rounded-lg overflow-hidden">
          <ReactPlayer
            url={fileUrl}
            controls={true}
            width="100%"
            height="100%"
            alt="video-link"
          />
        </div>
      );
    }
    return null;
  };

  const renderItem = (item: Choice, index: number) => {
    // Determine label (use provided label or fallback to A, B, C...)
    const label = item.label || String.fromCharCode(65 + index);

    return (
      <div className="flex flex-col w-full h-full">
        {renderMedia(item.fileUrl, item.assetType)}

        <div className="flex items-start gap-3 w-full flex-1">
          {/* Label Badge */}
          <div
            className={cn(
              "flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg font-bold text-lg border-2 transition-colors",
              item.isSelected
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700",
            )}
          >
            {label}
          </div>

          {/* Content */}
          <div className="flex-1 text-left pt-0.5 min-h-[1.75rem] flex items-center">
            <span
              className={cn(
                "prose dark:prose-invert max-w-none text-base leading-normal",
                // Remove margins from p tags in tiptap content
                "[&_p]:m-0 [&_p]:leading-normal",
              )}
            >
              <RenderTiptapContent content={item?.content || ""} />
            </span>
          </div>
        </div>
      </div>
    );
  };

  const handleClickChoice = (id: string) => () => {
    let newChoices: Choice[] = [];
    if (isMultiple) {
      const currentIsSelected = choices?.find(
        (item) => item?.id === id,
      )?.isSelected;
      newChoices = choices?.map((item) =>
        item?.id === id
          ? {
              ...item,
              isSelected: !currentIsSelected,
            }
          : item,
      );
    } else {
      newChoices = choices?.map((item) =>
        item?.id === id
          ? {
              ...item,
              isSelected: true,
            }
          : { ...item, isSelected: false },
      );
    }
    setChoices(newChoices);
    setIsAllCorrect(undefined);
    if (onChange) {
      const payload = newChoices
        ?.filter((item) => item?.isSelected)
        ?.map((item) => ({
          hotspots_id: item?.id,
        }));
      onChange(payload);
    }
  };

  useEffect(() => {
    let newChoices = hotspots?.map((item) => ({
      id: item?.id,
      content: item?.content,
      fileUrl: item?.file_urls?.url,
      assetType: item?.asset_type,
      label: item?.label, // Map label
      isSelected: false,
    }));
    if (isArray(externalAnswers)) {
      newChoices = newChoices?.map((item) => {
        const isSelected = externalAnswers?.some(
          (answer) => answer?.hotspots_id === item?.id,
        );
        return {
          ...item,
          isSelected,
        };
      });
    }
    setChoices(newChoices as Choice[]);
  }, [hotspots, externalAnswers]);

  useEffect(() => setIsAllCorrect(isCorrect), [isCorrect]);

  return (
    <div className="space-y-4 w-full">
      <div
        className={cn(
          "grid gap-4 w-full",
          // Use responsive grid: 1 col mobile, 2 cols tablet+
          hasImageChoices
            ? "grid-cols-1 sm:grid-cols-2"
            : "grid-cols-1 sm:grid-cols-2",
        )}
      >
        {choices?.map((item, index) => (
          <div
            key={item?.id}
            className={cn(
              "group relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md",
              // Default state
              "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700",
              // Hover state (if not selected)
              !item.isSelected &&
                "hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800",
              // Selected state
              {
                "border-blue-500 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-900/20 shadow-sm ring-1 ring-blue-500":
                  item?.isSelected,
                "border-red-500 bg-red-50/50 dark:border-red-500 dark:bg-red-900/20 ring-red-500":
                  item?.isSelected && isAllCorrect === false,
                "border-emerald-500 bg-emerald-50/50 dark:border-emerald-500 dark:bg-emerald-900/20 ring-emerald-500":
                  item?.isSelected && isAllCorrect === true,
              },
            )}
            onClick={handleClickChoice(item?.id)}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(Choice);
