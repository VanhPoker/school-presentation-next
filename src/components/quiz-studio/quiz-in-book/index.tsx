'use client'

import { cn } from '@/lib/utils'
import { QUIZ_CATEGORY_CODE } from '@/types/quiz-studio'
import QuizInBookChoice from './choices'
import QuizInBookEssay from './essay'
import QuizInBookFillInTheBlank from './fill-in-the-blank'
import QuizInBookSticker from './sticker'
import QuizInBookDragAndDrop from './drag-and-drop'
import QuizInBookMatching from './matching'
import QuizInBookDropbox from './drop-box'

type Props = {
  data: any
  className?: string
}

export default function QuizInBook({ data, className }: Props) {
  const questionAnswers = data?.questions_hotspots
  const questionName = data?.name
  const questionObject = {
    answer_positions: data?.answer_positions,
    asset_type: data?.asset_type || '',
    content_preview: data?.content_preview || '',
    embedded_url: data?.embedded_url || '',
    file_urls: {
      url: data?.file_urls?.url || ''
    },
    media_width: data?.media_width,
    questions_hotspots: {
      data: questionAnswers || []
    }
  }

  const renderQuestionPreview = (code: any) => {
    switch (code) {
      case QUIZ_CATEGORY_CODE.SINGLE_CHOICE:
      case QUIZ_CATEGORY_CODE.MULTIPLE_ANSWERS:
        return (
          <QuizInBookChoice
            id={data?.id}
            url={
              (questionObject?.file_urls?.url
                ? questionObject?.file_urls?.url
                : questionObject?.embedded_url) as string
            }
            assertType={questionObject?.asset_type}
            name={questionName || ''}
            answers={questionAnswers}
            type={code}
            isSingleChoice={
              code === QUIZ_CATEGORY_CODE.SINGLE_CHOICE ? true : false
            }
          />
        )
      case QUIZ_CATEGORY_CODE.ESSAY:
        return (
          <QuizInBookEssay
            id={data?.id}
            url={
              (questionObject?.file_urls?.url
                ? questionObject?.file_urls?.url
                : questionObject?.embedded_url) as string
            }
            assertType={questionObject?.asset_type}
            name={questionName || ''}
            answers={questionAnswers}
          />
        )

      case QUIZ_CATEGORY_CODE.FILL_IN_THE_BLANK:
        return (
          <QuizInBookFillInTheBlank
            id={data?.id}
            items={data}
            className="w-max max-w-[1000px] mx-auto"
          />
        )

      case QUIZ_CATEGORY_CODE.DRAG_AND_DROP:
        return (
          <QuizInBookDragAndDrop
            items={data}
            id={data?.id}
            className="w-max max-w-[1000px] mx-auto"
          />
        )
      case QUIZ_CATEGORY_CODE.MATCHING:
        return <QuizInBookMatching items={data} id={data?.id} />
      case QUIZ_CATEGORY_CODE.DROP_BOX:
        return (
          <QuizInBookDropbox
            items={data}
            id={data?.id}
            className="w-max max-w-[1000px] mx-auto"
          />
        )
      case QUIZ_CATEGORY_CODE.STICKER:
        return (
          <QuizInBookSticker
            id={data?.id}
            answerPositions={questionObject?.answer_positions || ''}
            mediaWidth={questionObject?.media_width}
            url={
              (questionObject?.file_urls?.url
                ? questionObject?.file_urls?.url
                : questionObject?.embedded_url) as string
            }
            assertType={questionObject?.asset_type}
            content={questionName || ''}
            answers={questionAnswers}
            className="h-full"
          />
        )
      default:
        return null
    }
  }

  return (
    <div className={cn('overflow-scroll max-w-full', className)}>
      {renderQuestionPreview(data?.question_category?.code)}
    </div>
  )
}
