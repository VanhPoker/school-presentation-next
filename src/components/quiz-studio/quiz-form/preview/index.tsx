'use client'

import { QUIZ_CATEGORY_CODE, QUIZ_TYPE } from '@/types/quiz-studio'
import { useLocalStorage } from 'react-use'
import ChoiceAnswerQuizPreview from './choice_quiz_preview'
// import Latex from '@/components/ui/latex'
import { useEffect, useState } from 'react'
import DragDrop from '../../quiz-rehearsal/quiz-types/fill-drag-drop/drag-box'
import FillDragDrop from '../../quiz-rehearsal/quiz-types/fill-drag-drop/fill-box'
import Matching from '../../quiz-rehearsal/quiz-types/matching'
import Sticker from '../../quiz-rehearsal/quiz-types/sticker'
import EssayQuizPreview from './essay_quiz_preview'
import QuizMediaPreview from './quiz-media-preview'

export interface ObjQuizFormStudio {
  asset_type: string
  asset_url: string
  category_id: string
  code: string
  content_preview: string
  embedded_url: string
  file_urls: {
    url: string
  }
  layout_answer: number
  material_id: string
  name: string

  media_width?: number
  answer_positions?: any
  point: number
  questions_hotspots: {
    data: Hotspot[]
  }
  time: number
}

export interface Hotspot {
  asset_type: string
  asset_url: string
  content: string
  embedded_url: string
  file_urls: {
    url: string
  }
  id: string
  is_deleted: boolean
  is_new: boolean
  order_number: number
}

export default function QuizFormPreviewMain() {
  const quizStudio: {
    state?: {
      objQuizFormStudio?: ObjQuizFormStudio
    }
  } = useLocalStorage('quizStudio')[0] || {}

  const objQuizFormStudio = quizStudio.state?.objQuizFormStudio
  const questionName = objQuizFormStudio?.name
  const questionAnswers = objQuizFormStudio?.questions_hotspots?.data

  // const editor = useEditor({
  //   extensions: [StarterKit as AnyExtension, MathInline],
  //   content: questionName,
  //   editable: false
  // })

  const renderQuestionPreview = (code: any) => {
    switch (code) {
      case QUIZ_CATEGORY_CODE.SINGLE_CHOICE:
      case QUIZ_CATEGORY_CODE.MULTIPLE_ANSWERS:
        return (
          <div className="max-w-[768px] mx-auto ">
            <ChoiceAnswerQuizPreview
              questionAnswers={questionAnswers || []}
              content={questionName}
              content_preview={objQuizFormStudio?.content_preview}
              asset_type={objQuizFormStudio?.asset_type}
              url={
                objQuizFormStudio?.file_urls?.url
                  ? objQuizFormStudio?.file_urls?.url
                  : objQuizFormStudio?.embedded_url
              }
              code={code}
            />
          </div>
        )
      case QUIZ_CATEGORY_CODE.ESSAY:
        return (
          <EssayQuizPreview
            content={questionName}
            content_preview={objQuizFormStudio?.content_preview}
            asset_type={objQuizFormStudio?.asset_type}
            url={
              objQuizFormStudio?.file_urls?.url
                ? objQuizFormStudio?.file_urls?.url
                : objQuizFormStudio?.embedded_url
            }
          />
        )

      case QUIZ_CATEGORY_CODE.FILL_IN_THE_BLANK:
        return (
          <FillDragDrop
            item={{
              question_category: code,
              file_urls: objQuizFormStudio?.file_urls,
              asset_type: objQuizFormStudio?.asset_type,
              embedded_url: objQuizFormStudio?.embedded_url,
              content_preview: objQuizFormStudio?.content_preview,
              name: questionName,
              questions_hotspots: objQuizFormStudio?.questions_hotspots.data
            }}
          />
        )

      case QUIZ_CATEGORY_CODE.DRAG_AND_DROP:
        return (
          <DragDrop
            item={{
              question_category: code,
              file_urls: objQuizFormStudio?.file_urls,
              asset_type: objQuizFormStudio?.asset_type,
              embedded_url: objQuizFormStudio?.embedded_url,
              content_preview: objQuizFormStudio?.content_preview,
              name: questionName,
              questions_hotspots: objQuizFormStudio?.questions_hotspots.data
            }}
          />
        )
      case QUIZ_CATEGORY_CODE.MATCHING:
        return (
          <Matching
            item={{
              question_category: code,
              file_urls: objQuizFormStudio?.file_urls,
              asset_type: objQuizFormStudio?.asset_type,
              embedded_url: objQuizFormStudio?.embedded_url,
              content_preview: objQuizFormStudio?.content_preview,
              name: questionName,
              questions_hotspots: objQuizFormStudio?.questions_hotspots.data
            }}
          />
        )
      case QUIZ_CATEGORY_CODE.STICKER:
        return (
          <Sticker
            imageUrl={
              (objQuizFormStudio?.file_urls?.url
                ? objQuizFormStudio?.file_urls?.url
                : objQuizFormStudio?.embedded_url) as string
            }
            containerClass="h-full"
            questionsHotpots={questionAnswers as any[]}
            originMediaWidth={objQuizFormStudio?.media_width as number}
            answerPositions={objQuizFormStudio?.answer_positions}
          />
        )
      case QUIZ_CATEGORY_CODE.VIDEO_RESPONSE:
      case QUIZ_CATEGORY_CODE.AUDIO_RESPONSE:
        return (
          <QuizMediaPreview
            content={questionName}
            content_preview={objQuizFormStudio?.content_preview}
            asset_type={objQuizFormStudio?.asset_type}
            code={
              code.includes('audio')
                ? QUIZ_TYPE.audio_response
                : QUIZ_TYPE.video_response
            }
            hotspots={objQuizFormStudio?.questions_hotspots.data}
            url={
              objQuizFormStudio?.file_urls?.url
                ? objQuizFormStudio?.file_urls?.url
                : objQuizFormStudio?.embedded_url
            }
          />
        )

      default:
        return null
    }
  }
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null
  return (
    <main className="flex h-[calc(100vh-72px)] bg-gray-200">
      <div className="w-full min-h-full p-6 ">
        <div className="h-full no-scrollbar bg-white pt-16 py-6 rounded-lg">
          <div className="bg-white rounded-lg overflow-y-auto h-full no-scrollbar">
            {renderQuestionPreview(objQuizFormStudio?.code)}
          </div>
        </div>
      </div>
    </main>
  )
}
