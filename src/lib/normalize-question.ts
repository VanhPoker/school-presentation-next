import { GameQuestion } from "@/components/quiz/game-ported/GameQuizRenderer";

/**
 * Normalizes preview_props from backend (snake_case) to frontend format (camelCase)
 * Based on question category code, similar to game frontend's getQuestionPreviewProps
 */
function normalizePreviewProps(
  previewProps: any,
  categoryCode: string,
  rawQuestion: any,
): Record<string, any> | undefined {
  if (!previewProps) return undefined;

  console.log("[normalizePreviewProps] Processing:", {
    categoryCode,
    keys: Object.keys(previewProps),
  });

  // For sticker questions: need to convert snake_case to camelCase
  if (categoryCode === "sticker") {
    return {
      ...previewProps,
      // Convert image_url to imageUrl
      imageUrl:
        previewProps.imageUrl ||
        previewProps.image_url ||
        previewProps.file_urls?.url ||
        rawQuestion.image_url,
      // Convert questions_hotspots to questionsHotpots (note the typo in original code)
      questionsHotpots:
        previewProps.questionsHotpots ||
        previewProps.questions_hotspots ||
        previewProps.hotspots ||
        rawQuestion.choices,
      // Convert origin_media_width to originMediaWidth
      originMediaWidth:
        previewProps.originMediaWidth ||
        previewProps.origin_media_width ||
        previewProps.media_width ||
        800,
      // Convert answer_positions to answerPositions
      answerPositions:
        previewProps.answerPositions || previewProps.answer_positions || "[]",
    };
  }

  // For matching/fill/drag_and_drop: keep snake_case keys as the components expect them
  if (
    categoryCode === "matching" ||
    categoryCode === "fill_in_the_blank" ||
    categoryCode === "drag_and_drop" ||
    categoryCode === "drop_box"
  ) {
    return {
      ...previewProps,
      // Ensure questions_hotspots is available
      questions_hotspots:
        previewProps.questions_hotspots ||
        previewProps.questionsHotspots ||
        rawQuestion.choices,
      // For drop_box, also need content_preview
      content_preview:
        previewProps.content_preview || previewProps.contentPreview,
    };
  }

  // For choice questions: normalize hotspots
  if (categoryCode === "single_choice" || categoryCode === "multiple_answers") {
    return {
      ...previewProps,
      hotspots:
        previewProps.hotspots ||
        previewProps.questions_hotspots ||
        rawQuestion.choices,
    };
  }

  // Default: return as-is
  return previewProps;
}

/**
 * Normalizes a raw question object from the WebSocket (snake_case)
 * to the GameQuestion interface (camelCase) used by the renderer.
 */
export function normalizeGameQuestion(rawQuestion: any): GameQuestion {
  // console.log("[normalizeGameQuestion] Raw Input:", rawQuestion); // Uncomment for verbose logging
  if (!rawQuestion) return rawQuestion;

  const categoryCode =
    rawQuestion.category_code || rawQuestion.categoryCode || "";
  const rawPreviewProps = rawQuestion.preview_props || rawQuestion.previewProps;

  return {
    ...rawQuestion,
    id: rawQuestion.id,
    content: rawQuestion.content,
    categoryCode,
    // Map choices if necessary (choices usually match GameChoice interface but key names might differ?)
    choices: Array.isArray(rawQuestion.choices)
      ? rawQuestion.choices.map((c: any) => ({
          ...c,
          id: c.id,
          content: c.content,
          isCorrect: c.is_correct || c.isCorrect,
          fillOrder: c.fill_order || c.fillOrder,
          assetType: c.asset_type || c.assetType,
          assetUrl: c.asset_url || c.assetUrl,
          fileUrl: c.file_url || c.fileUrl || c.file_urls?.url,
          // If file_urls is present, keep it
          file_urls: c.file_urls,
        }))
      : [],
    timeLimit: rawQuestion.time_limit || rawQuestion.timeLimit,
    explanation: rawQuestion.explanation,
    imageUrl: rawQuestion.image_url || rawQuestion.imageUrl,
    assetType: rawQuestion.asset_type || rawQuestion.assetType,
    answerPositions:
      rawQuestion.answer_positions || rawQuestion.answerPositions,
    questionsHotspots:
      rawQuestion.questions_hotspots || rawQuestion.questionsHotspots,
    // Normalize previewProps based on question type
    previewProps: normalizePreviewProps(
      rawPreviewProps,
      categoryCode,
      rawQuestion,
    ),
  };
}
