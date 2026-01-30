'use client'

import { memo, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { Hotspots } from '@/graphql/generated'

// Lazy load quiz-studio components
const Choice = dynamic(
  () => import('@/components/quiz-studio/quiz-rehearsal/quiz-types/choice'),
  { ssr: false, loading: () => <LoadingIndicator /> }
)
const Matching = dynamic(
  () => import('@/components/quiz-studio/quiz-rehearsal/quiz-types/matching'),
  { ssr: false, loading: () => <LoadingIndicator /> }
)
const Sticker = dynamic(
  () => import('@/components/quiz-studio/quiz-rehearsal/quiz-types/sticker'),
  { ssr: false, loading: () => <LoadingIndicator /> }
)
const DragDrop = dynamic(
  () =>
    import(
      '@/components/quiz-studio/quiz-rehearsal/quiz-types/fill-drag-drop/drag-box'
    ),
  { ssr: false, loading: () => <LoadingIndicator /> }
)
const Fill = dynamic(
  () =>
    import(
      '@/components/quiz-studio/quiz-rehearsal/quiz-types/fill-drag-drop/fill-box'
    ),
  { ssr: false, loading: () => <LoadingIndicator /> }
)
const Essay = dynamic(
  () => import('@/components/quiz-studio/quiz-rehearsal/quiz-types/essay'),
  { ssr: false, loading: () => <LoadingIndicator /> }
)
const DropBox = dynamic(
  () =>
    import(
      '@/components/quiz-studio/quiz-rehearsal/quiz-types/fill-drag-drop/drop-box'
    ),
  { ssr: false, loading: () => <LoadingIndicator /> }
)

function LoadingIndicator() {
  return <div className="text-center py-4 text-gray-500">Đang tải...</div>
}

/**
 * GameQuizRenderer - Wrapper để sử dụng quiz-studio components trong game
 * Hỗ trợ đầy đủ tất cả loại câu hỏi với UI giống hệt quiz-studio
 */

export interface GameQuestion {
  id: string
  content: string
  categoryCode: string
  choices: GameChoice[]
  timeLimit: number
  explanation?: string
  imageUrl?: string
  assetType?: string
  answerPositions?: string
  mediaWidth?: number
  questionsHotspots?: any[]
  previewProps?: Record<string, any>
}

export interface GameChoice {
  id: string
  content: string
  fileUrl?: string
  assetUrl?: string
  assetType?: string
  file_urls?: { url?: string }
  label?: string
  left?: number
  top?: number
  fillOrder?: number
  isCorrect?: boolean
}

interface GameQuizRendererProps {
  question: GameQuestion
  onAnswer: (choiceIds: string[]) => void
  isCorrect?: boolean
  externalAnswers?: any[]
  disabled?: boolean
}

function GameQuizRenderer({
  question,
  onAnswer,
  isCorrect,
  externalAnswers,
  disabled = false
}: GameQuizRendererProps) {
  const { categoryCode, choices, previewProps } = question

  // Convert choices to hotspots format (using any for file_urls to bypass type mismatch)
  const hotspots = useMemo(() => {
    return choices.map((choice) => ({
      id: choice.id,
      content: choice.content,
      // Use file_urls directly from backend, or fallback to fileUrl for legacy support
      file_urls:
        choice.file_urls ||
        (choice.fileUrl ? { url: choice.fileUrl } : undefined),
      asset_type: choice.assetType,
      label: choice.label,
      left: choice.left,
      top: choice.top,
      is_correct: choice.isCorrect
    })) as unknown as Hotspots[]
  }, [choices])

  // Convert externalAnswers to quiz-studio format
  const formattedExternalAnswers = useMemo(() => {
    if (!externalAnswers) return undefined

    // For fill_in_blank, matching, drag_and_drop - pass directly without wrapping
    if (
      ['fill_in_the_blank', 'matching', 'drag_and_drop', 'drop_box'].includes(
        categoryCode
      )
    ) {
      return externalAnswers
    }

    // For simple choice questions - wrap in hotspots_id
    return externalAnswers.map((id) => ({ hotspots_id: id }))
  }, [externalAnswers, categoryCode])

  // Handler for choice types
  const handleChoiceChange = (payload: { hotspots_id: string }[]) => {
    if (disabled) return
    onAnswer(payload.map((p) => p.hotspots_id))
  }

  // Handler for matching type
  const handleMatchingChange = (payload: any[]) => {
    if (disabled) return
    const matches = payload.flatMap(
      (p: any) =>
        p.child?.filter((c: any) => c.item_drop)?.map((c: any) => c.id) || []
    )
    onAnswer(matches.length > 0 ? matches : ['matched'])
  }

  // Handler for sticker type - send full position data for backend validation
  // Quizzes module requires: hotspotsId, top, left, alignment to validate placement
  const handleStickerChange = (labels: any[]) => {
    if (disabled) return

    console.log('[DEBUG] handleStickerChange labels:', labels)

    // Encode each label's full data as JSON for backend position validation
    // Format: JSON string with {hotspotsId, top, left, alignment}
    const stickerData = labels
      .filter((l: any) => l.hotspotsId)
      .map((l: any) =>
        JSON.stringify({
          hotspotsId: l.hotspotsId,
          top: l.top,
          left: l.left,
          alignment: l.alignment,
          fillOrder: l.fillOrder
        })
      )

    console.log('[DEBUG] handleStickerChange encoded data:', stickerData)
    onAnswer(stickerData.length > 0 ? stickerData : ['labeled'])
  }

  // Handler for fill/drag-drop - extract content from complex payload
  // For fill_in_blank: extract item_drop.content (user's typed text)
  // For drop_box: extract answer_id (selected option ID)
  const handleFillChange = (payload: any) => {
    if (disabled) return

    console.log('[DEBUG] handleFillChange RAW payload:', payload)
    console.log('[DEBUG] handleFillChange payload type:', typeof payload)
    console.log(
      '[DEBUG] handleFillChange question categoryCode:',
      question.categoryCode
    )

    // Parse JSON if it's a string
    let parsedPayload = payload
    if (typeof payload === 'string') {
      try {
        parsedPayload = JSON.parse(payload)
      } catch (e) {
        console.log('[DEBUG] handleFillChange: Failed to parse JSON')
      }
    }

    // Extract filled data from the payload based on question type
    // For fill_in_blank: we need the TEXT CONTENT user typed
    // For drop_box: we need the selected answer ID
    const extractFilledData = (nodes: any[]): string[] => {
      const data: string[] = []
      const traverse = (node: any) => {
        if (node?.type === 'fill-drag-drop' && node.attrs?.id) {
          console.log('[DEBUG] Found fill-drag-drop node:', {
            id: node.attrs.id,
            hasItemDrop: !!node.attrs?.item_drop,
            itemDropContent: node.attrs?.item_drop?.content,
            itemDropAnswerId: node.attrs?.item_drop?.answer_id,
            itemDropLabel: node.attrs?.item_drop?.label
          })

          if (node.attrs?.item_drop) {
            const itemDrop = node.attrs.item_drop

            console.log(
              '[DEBUG] Processing item_drop for question type:',
              question.categoryCode,
              'content:',
              itemDrop.content,
              'label:',
              itemDrop.label,
              'answer_id:',
              itemDrop.answer_id
            )

            // For fill_in_blank: extract the content TEXT (what user typed)
            if (question.categoryCode === 'fill_in_the_blank') {
              // Send the actual text content for backend to compare
              // content may be wrapped in HTML like <p>text</p>
              const content = itemDrop.content || ''
              console.log('[DEBUG] fill_in_blank: extracted content:', content)
              data.push(content)
            }
            // For matching: combine leftId:rightId with labels
            else if (question.categoryCode === 'matching' && itemDrop.label) {
              // Format: leftId:rightId (for label comparison)
              data.push(`${node.attrs.id}:${itemDrop.answer_id || itemDrop.id}`)
            }
            // For drag_and_drop: extract content or ID
            else if (question.categoryCode === 'drag_and_drop') {
              if (itemDrop.content) {
                data.push(itemDrop.content)
              } else {
                data.push(node.attrs.id)
              }
            }
            // For drop_box: only push the selected answer_id (not the container hotspot ID)
            else if (question.categoryCode === 'drop_box') {
              if (itemDrop.answer_id) {
                data.push(itemDrop.answer_id)
              }
              // Don't push container ID - we only need the selected answer
            }
            // Default fallback: just use the hotspot ID
            else {
              data.push(node.attrs.id)
              if (itemDrop.answer_id) {
                data.push(itemDrop.answer_id)
              }
            }
          }
        }
        if (node?.content && Array.isArray(node.content)) {
          node.content.forEach(traverse)
        }
      }
      if (Array.isArray(nodes)) {
        nodes.forEach(traverse)
      }
      return data
    }

    const filledData = extractFilledData(parsedPayload)
    console.log('[DEBUG] handleFillChange extracted data:', filledData)
    onAnswer(filledData.length > 0 ? filledData : ['no_fill'])
  }

  // Handler for essay
  const handleEssayChange = (content: string) => {
    if (disabled) return
    onAnswer([content])
  }

  // Layout classes - no bg-white since parent has white background
  const wrapperClass = 'w-full'
  const innerClass = 'w-full'
  const wideInnerClass = 'w-full'

  const hasPreviewData = previewProps && Object.keys(previewProps).length > 0

  switch (categoryCode) {
    case 'single_choice':
    case 'multiple_answers':
      // Get question image URL (from imageUrl or previewProps.file_urls.url)
      const questionImageUrl =
        question.imageUrl ||
        previewProps?.imageUrl ||
        previewProps?.file_urls?.url
      return (
        <div className={wrapperClass}>
          {/* Question Image (if exists) */}
          {questionImageUrl && (
            <div className="flex justify-center mb-4">
              <div className="relative w-full max-w-md aspect-[4/3]">
                <Image
                  src={questionImageUrl}
                  alt="Question image"
                  fill
                  className="object-contain rounded-lg"
                  unoptimized
                />
              </div>
            </div>
          )}
          <div className={`${innerClass}`}>
            <Choice
              key={question.id}
              hotspots={hasPreviewData ? previewProps?.hotspots : hotspots}
              isMultiple={categoryCode === 'multiple_answers'}
              onChange={handleChoiceChange}
              isCorrect={isCorrect}
              externalAnswers={formattedExternalAnswers}
            />
          </div>
        </div>
      )

    case 'matching':
      console.log('[DEBUG] Matching previewProps:', previewProps)
      console.log(
        '[DEBUG] Matching questions_hotspots:',
        previewProps?.questions_hotspots
      )
      if (!hasPreviewData || !previewProps?.questions_hotspots) {
        return (
          <FallbackUI
            choices={choices}
            onAnswer={onAnswer}
            disabled={disabled}
            label="Nối đáp án"
          />
        )
      }
      // Handler for matching - extract paired IDs as 'left_id:right_id' format (inline to avoid forward ref)
      const matchingHandler = (matchingData: any[]) => {
        if (disabled) return
        console.log('[DEBUG] handleMatchingChange:', matchingData)
        const pairs: string[] = []
        matchingData?.forEach((row: any) => {
          const left = row?.child?.[0]
          if (left?.id && left?.item_drop?.id) {
            pairs.push(`${left.id}:${left.item_drop.id}`)
          }
        })
        console.log('[DEBUG] handleMatchingChange extracted pairs:', pairs)
        onAnswer(pairs.length > 0 ? pairs : ['no_match'])
      }
      return (
        <div className={wrapperClass}>
          <div className={`${wideInnerClass}`}>
            <Matching
              key={question.id}
              item={previewProps}
              handleJSONChange={matchingHandler}
              results={undefined}
              externalAnswers={formattedExternalAnswers}
            />
          </div>
        </div>
      )

    case 'sticker':
      console.log('[DEBUG] Sticker previewProps:', previewProps)
      console.log('[DEBUG] questionsHotpots:', previewProps?.questionsHotpots)
      console.log('[DEBUG] answerPositions:', previewProps?.answerPositions)
      console.log('[DEBUG] originMediaWidth:', previewProps?.originMediaWidth)
      if (!hasPreviewData || !previewProps?.imageUrl) {
        return (
          <FallbackUI
            choices={choices}
            onAnswer={onAnswer}
            disabled={disabled}
            label="Dán nhãn"
          />
        )
      }
      return (
        <div className={wrapperClass}>
          <div className={`${innerClass}`}>
            <Sticker
              key={question.id}
              imageUrl={previewProps?.imageUrl || ''}
              questionsHotpots={previewProps?.questionsHotpots || []}
              originMediaWidth={previewProps?.originMediaWidth || 800}
              answerPositions={previewProps?.answerPositions || '[]'}
              onChange={handleStickerChange}
              isCorrect={isCorrect}
              containerClass="h-full"
              externalAnswers={externalAnswers}
            />
          </div>
        </div>
      )

    case 'fill_in_the_blank':
      if (!hasPreviewData || !previewProps?.questions_hotspots) {
        return (
          <FallbackUI
            choices={choices}
            onAnswer={onAnswer}
            disabled={disabled}
            label="Điền vào chỗ trống"
          />
        )
      }
      return (
        <div className={wrapperClass}>
          <div className={`${wideInnerClass}`}>
            <Fill
              key={question.id}
              item={previewProps}
              handleJSONChange={handleFillChange}
              results={undefined}
              isCorrect={isCorrect}
              externalAnswers={formattedExternalAnswers}
            />
          </div>
        </div>
      )

    case 'drag_and_drop':
      if (!hasPreviewData || !previewProps?.questions_hotspots) {
        return (
          <FallbackUI
            choices={choices}
            onAnswer={onAnswer}
            disabled={disabled}
            label="Kéo thả"
          />
        )
      }
      return (
        <div className={wrapperClass}>
          <div className={`${wideInnerClass}`}>
            <DragDrop
              key={question.id}
              item={previewProps}
              handleJSONChange={handleFillChange}
              results={undefined}
              isCorrect={isCorrect}
              externalAnswers={formattedExternalAnswers}
            />
          </div>
        </div>
      )

    case 'essay':
      return (
        <div className={wrapperClass}>
          <div className={`${innerClass}`}>
            <Essay
              key={question.id}
              handleEssayChange={handleEssayChange}
              externalAnswer={externalAnswers?.[0] || ''}
            />
          </div>
        </div>
      )

    case 'drop_box':
      // drop_box needs: content_preview (JSON string), questions_hotspots (with children), question_category.code
      if (!hasPreviewData || !previewProps?.content_preview) {
        return (
          <FallbackUI
            choices={choices}
            onAnswer={onAnswer}
            disabled={disabled}
            label="Kéo thả vào ô trống"
          />
        )
      }
      // Build item format for DropBox component
      const dropBoxItem = {
        ...previewProps,
        question_category: { code: categoryCode },
        // Ensure questions_hotspots has children array (choices mapped)
        questions_hotspots:
          previewProps?.questions_hotspots?.map((hs: any) => ({
            ...hs,
            children:
              hs.children ||
              choices.filter((c: GameChoice) => c.fillOrder === hs.fill_order)
          })) || []
      }
      return (
        <div className={wrapperClass}>
          <div className={`${wideInnerClass}`}>
            <DropBox
              key={question.id}
              item={dropBoxItem}
              handleJSONChange={handleFillChange}
              results={undefined}
              isCorrect={isCorrect}
              externalAnswers={formattedExternalAnswers}
            />
          </div>
        </div>
      )

    default:
      return (
        <FallbackUI
          choices={choices}
          onAnswer={onAnswer}
          disabled={disabled}
          label={categoryCode}
        />
      )
  }
}

// Fallback UI
function FallbackUI({
  choices,
  onAnswer,
  disabled,
  label
}: {
  choices: GameChoice[]
  onAnswer: (ids: string[]) => void
  disabled: boolean
  label: string
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mx-auto">
      <div className="col-span-full text-center text-white/50 text-sm mb-2">
        {label}
      </div>
      {choices.map((choice, index) => (
        <button
          key={choice.id}
          onClick={() => !disabled && onAnswer([choice.id])}
          disabled={disabled}
          className="p-4 rounded-xl border-2 border-white/30 bg-white/10 hover:bg-white/20 text-white text-left transition-all disabled:opacity-50"
        >
          <span className="font-bold mr-2">
            {String.fromCharCode(65 + index)}.
          </span>
          <span dangerouslySetInnerHTML={{ __html: choice.content }} />
        </button>
      ))}
    </div>
  )
}

export default memo(GameQuizRenderer)
