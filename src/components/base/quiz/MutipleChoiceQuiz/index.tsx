import { AnswersLayoutType, Material_Code } from '@/types/material/type'
import { useMemo, useState } from 'react'
import DOMPurify from 'dompurify'
import MutipleChoiceQuizItem from './MutipleChoiceQuizItem'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'
import {
  LIST_ENCOURAGE_TEXT,
  LIST_WARNING_TEXT
} from '@/mock-data/quiz-study/config'
import { generateRandomNumber } from '@/helper/generateRandomNumber'
import QuizFooterQuizResult from '../quiz-footer-quiz-result'
import RenderTiptapContent from '../../render-tiptap-content'
import { useBookSidebarStore } from '@/stores/use-book-sidebar-store'
import { useListChatMessagesStore } from '@/stores/use-list-chat-messages-store'
import { checkUserAnswerForQuiz } from '@/services/ai'
import { toasts } from '@/components/ui/toast-color'
import {
  getAccessTokenFromCookie,
  getUserInfoFromCookie
} from '@/server-action/auth'
const MediaRender = dynamic(() => import('@/components/base/media-render'), {
  ssr: false
})
type MutipleChoiceQuizProps = {
  textColor?: string
  answersLayout?: AnswersLayoutType
  answers?: any[]
  name?: string
  url: string
  type: string
  id: string
  isPratice?: boolean
  assertType?: string
  isPreview?: boolean
  isSingleChoice?: boolean
}
export default function MutipleChoiceQuiz({
  textColor = '#181D27',
  assertType,
  isPratice,
  answersLayout = AnswersLayoutType.ONE_COLUMN,
  answers = [],
  type,
  id,
  name,
  url,
  isPreview = false,
  isSingleChoice = true
}: MutipleChoiceQuizProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const setStatus = useBookSidebarStore((state) => state.setStatus)
  const setMetadata = useListChatMessagesStore((state) => state.setMetadata)
  const [resultStatus, setResultStatus] = useState<
    'idle' | 'correct' | 'wrong'
  >('idle')
  const validateName = useMemo(() => {
    if (!name) return ''
    return DOMPurify.sanitize(name, { ADD_TAGS: ['math-inline'] })
  }, [])

  const resultData = useMemo(() => {
    if (resultStatus === 'idle') {
      return {
        background: 'unset',
        color: undefined,
        content: ''
      }
    }
    if (resultStatus === 'correct') {
      return {
        background: '#ECFDF3',
        color: '#079455',
        content:
          LIST_ENCOURAGE_TEXT[
            generateRandomNumber(0, LIST_ENCOURAGE_TEXT.length - 1)
          ]
      }
    }
    if (resultStatus === 'wrong') {
      return {
        background: '#FEF3F2',
        color: '#D92D20',
        content:
          LIST_WARNING_TEXT[
            generateRandomNumber(0, LIST_WARNING_TEXT.length - 1)
          ]
      }
    }
    return { background: 'unset', content: '', color: undefined }
  }, [resultStatus])
  const handleCheckAnswer = async () => {
    const accessToken = await getAccessTokenFromCookie()
    const userInfoId = await getUserInfoFromCookie()
    if (!userInfoId || !accessToken) return
    if (selectedAnswers.length === 0) {
      setResultStatus('wrong')
      return
    }
    setLoading(true)
    const res = await checkUserAnswerForQuiz(
      selectedAnswers.map((item) => ({
        user_id: userInfoId,
        hotspots_id: item.id,
        question_id: id
      }))
    )
    const data = res.data
    if (!Array(data?.results)) {
      toasts.error('Có lỗi xảy ra khi kiểm tra kết quả')
      setLoading(false)
      return
    }
    if (data?.is_all_correct) {
      setResultStatus('correct')
    } else {
      const resultsAnswerIndex: number[] = []

      data.results.forEach((resultItem: any) => {
        const matchedIndex = answers.findIndex(
          (item) => item.id === resultItem.hotspots_id
        )
        if (matchedIndex >= 0) {
          resultsAnswerIndex.push(matchedIndex)
        }
      })
      setStatus({ isShowChatbot: true })
      setMetadata({
        type: 'wrong_answer',
        user_answer_quiz: {
          is_correct: false,
          quiz_id: id,
          type: type,
          question: { content: name || '' },
          user_answer: { choice: resultsAnswerIndex, content: '' } // `choice`: mảng lưu index của đáp án học sinh chọn, `content:` để trống
        }
      })
      setResultStatus('wrong')
    }
    setLoading(false)
  }
  const handleExplain = () => {
    const choiceIndexs: number[] = []
    selectedAnswers.forEach((select) => {
      const matchedIndex = answers.findIndex((item) => item.id === select.id)
      if (matchedIndex >= 0) {
        choiceIndexs.push(matchedIndex)
      }
    })
    setStatus({ isShowChatbot: true })
    setMetadata({
      type: 'explain',
      user_answer_quiz: {
        quiz_id: id,
        type: type,
        question: { content: name || '' },
        user_answer: { choice: choiceIndexs, content: '' } // `choice`: mảng lưu index của đáp án học sinh chọn, `content:` để trống
      }
    })
  }

  return (
    <div style={{ color: textColor }}>
      <div className="flex flex-col gap-4 px-4">
        {name && (
          <div
            className={cn(
              'flex-1 flex',
              url ? 'justify-center flex-col' : 'flex-wrap'
            )}
          >
            <RenderTiptapContent content={validateName} />
          </div>
        )}
        {assertType && (
          <MediaRender
            url={url}
            type={assertType as Material_Code}
            containerClass={cn(
              'flex-1 mx-auto',
              assertType !== 'audios' ? 'max-w-96' : 'w-full'
            )}
          />
        )}
      </div>
      <Separator className="mx-auto my-6 max-w-64 px-4" />
      <div
        className="grid gap-4 px-4 mb-8"
        style={{
          gridTemplateColumns: `repeat(${answersLayout}, minmax(0, 1fr))`
        }}
      >
        {answers.map((answer) => {
          const { content, file_urls, id, embedded_url, asset_url } = answer
          const selectedIndex = selectedAnswers.findIndex(
            (item) => item.id === id
          )
          return (
            <MutipleChoiceQuizItem
              key={id}
              color={resultData?.color}
              background={resultData.background}
              isSelected={selectedIndex >= 0}
              content={content}
              answersLayout={answersLayout}
              assertType={answer?.asset_type}
              imageUrl={asset_url ? file_urls?.url : embedded_url}
              onClick={() => {
                if (resultStatus !== 'idle') return
                if (!isPreview) return
                if (isSingleChoice) {
                  setSelectedAnswers([answer])
                } else {
                  if (selectedIndex >= 0) {
                    const cloned = [...selectedAnswers]
                    cloned.splice(selectedIndex, 1)
                    setSelectedAnswers(cloned)
                  } else {
                    setSelectedAnswers((prev) => [...prev, answer])
                  }
                }
              }}
            />
          )
        })}
      </div>
      {isPratice && (
        <QuizFooterQuizResult
          background={resultData.background}
          handleCheckAnswer={handleCheckAnswer}
          handleRefresh={() => {
            setSelectedAnswers([])
            setResultStatus('idle')
          }}
          loading={loading}
          disable={loading}
          handleExplain={handleExplain}
          content={resultData.content}
          status={resultStatus}
          color={resultData.color}
        />
      )}
    </div>
  )
}
