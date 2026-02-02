import { memo, useEffect, useState } from "react";
import { RenderQuestionAnswersProps } from "@/types/quiz-studio";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import "./style.scss";
const MediaRender = dynamic(() => import("@/components/base/media-render"), {
  ssr: false,
});

import RenderTiptapContent from "@/components/base/render-tiptap-content";

// Replace stub with real component
const QuizStudioEditor = dynamic(
  () => import("@/components/quiz/game-ported/quiz-studio-editor/index"),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse h-20 bg-gray-100 rounded"></div>
    ),
  },
);

const FillBox = ({
  item,
  results,
  config,
  isCorrect,
  handleJSONChange,
  externalAnswers,
}: RenderQuestionAnswersProps) => {
  const {
    questions_hotspots,
    question_category,
    file_urls,
    asset_type,
    embedded_url,
    content_preview,
  } = item;
  const url = file_urls?.url;
  const code = question_category?.code;
  const [parseContentPreview, setParseContentPreview] = useState<any[]>([]);
  const [stringContentPreview, setStringContentPreview] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  const handleFomatContent = (
    items: any,
    newItems: any,
    isContinue: boolean,
  ) => {
    return items.map((node: any) => {
      if (node.attrs && node.attrs.fill_order) {
        const checkItem = newItems.find(
          (x: any) => x.fill_order === node.attrs.fill_order,
        );
        if (!isContinue) {
          node.attrs.is_correct = null;
          node.attrs.item_drop = { ...node.attrs, content: "" };
          if (!checkItem) return node;
          node.attrs.id = checkItem.id;
        } else {
          node.attrs.is_correct = null;
          if (checkItem) {
            if (checkItem.item_drop && checkItem.item_drop.content) {
              node.attrs.item_drop = checkItem.item_drop;
            } else {
              node.attrs.item_drop = { ...node.attrs, content: "" };
            }
            if (checkItem.id) node.attrs.id = checkItem.id;
          } else {
            node.attrs.item_drop = { ...node.attrs, content: "" };
          }
        }
      }
      if (node.content) {
        return {
          ...node,
          content: handleFomatContent(node.content, newItems, isContinue),
        };
      }
      return node;
    });
  };

  const handleFomatResult = (
    items: any,
    result: boolean | undefined,
    newItems: any,
  ) => {
    return items.map((node: any) => {
      if (node.attrs && node.attrs.fill_order) {
        node.attrs.is_correct = result;
        const checkItem = newItems.find((z: any) => {
          return z.hotspots_id === node.attrs.id;
        });
        if (checkItem) {
          node.attrs.item_drop = checkItem.item_drop;
        }
      }
      if (node.content) {
        return {
          ...node,
          content: handleFomatResult(node.content, result, newItems),
        };
      }
      return node;
    });
  };

  // Reset initialization state when question changes
  useEffect(() => {
    setIsInitialized(false);
  }, [item.id]);

  useEffect(() => {
    if (!isInitialized && content_preview && questions_hotspots) {
      const parseStringContentPreview = JSON.parse(content_preview);
      let fomatContentPreview;
      if (externalAnswers && externalAnswers.length > 0) {
        fomatContentPreview = handleFomatContent(
          parseStringContentPreview,
          externalAnswers,
          true,
        );
      } else {
        fomatContentPreview = handleFomatContent(
          parseStringContentPreview,
          questions_hotspots,
          false,
        );
      }

      setTimeout(() => {
        setParseContentPreview(fomatContentPreview);
        setStringContentPreview(JSON.stringify(fomatContentPreview));
        setIsInitialized(true);
      }, 10);
    }
  }, [content_preview, questions_hotspots, externalAnswers, isInitialized]);

  useEffect(() => {
    if (results && results.length > 0) {
      const fomatContentPreview = handleFomatResult(
        parseContentPreview,
        isCorrect,
        results,
      );
      setTimeout(() => {
        setParseContentPreview(fomatContentPreview);
        setStringContentPreview(JSON.stringify(fomatContentPreview));
      }, 10);
    }
  }, [results]);

  return (
    <div className="w-full h-full relative">
      <div
        className={cn(
          "w-full mx-auto",
          config && config.isInBook ? "max-w-full" : "max-w-[1024px]",
        )}
      >
        <div className="flex flex-col lg:flex-row gap-2 px-4 lg:px-0">
          {(url || embedded_url) && (
            <MediaRender
              type={asset_type}
              url={url || embedded_url}
              containerClass="aspect-[4/3] !rounded-md overflow-hidden bg-gray-200 w-full max-w-md lg:max-w-none lg:w-1/3 mx-auto lg:mx-0"
            />
          )}
          <div className="flex-1 space-y-3 flex items-start justify-start flex-col text-slate-900 text-base fill-drag-drop-editor">
            <QuizStudioEditor
              allowEdit={false}
              is_practise={true}
              content={stringContentPreview}
              placeholder="Nhập câu hỏi vào đây"
              fill={false}
              codeQuiz={code || ""}
              handleJSONChange={handleJSONChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(FillBox);
