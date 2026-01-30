import './style.scss'
import { Textarea } from '@/components/ui/textarea'
import { AnswersLayoutType, Material_Code } from '@/types/material/type'

const MediaRender = dynamic(() => import('@/components/base/media-render'), {
  ssr: false
})
import { useMemo, useState } from 'react'
import DOMPurify from 'dompurify'
import { Label } from '@/components/ui/label'
import dynamic from 'next/dynamic'
import { Separator } from '@/components/ui/separator'
import QuizFooterQuizResult from '../quiz-footer-quiz-result'
import {
  LIST_ENCOURAGE_TEXT,
  LIST_WARNING_TEXT
} from '@/mock-data/quiz-study/config'
import { generateRandomNumber } from '@/helper/generateRandomNumber'
import { checkUserAnswerForQuiz } from '@/services/ai'
import { toasts } from '@/components/ui/toast-color'
import { useListChatMessagesStore } from '@/stores/use-list-chat-messages-store'
import { useBookSidebarStore } from '@/stores/use-book-sidebar-store'
import { QUIZ_TYPE } from '@/types/quiz-studio'
import {
  getAccessTokenFromCookie,
  getUserInfoFromCookie
} from '@/server-action/auth'

type WritingQuizProps = {
  textColor?: string
  answersLayout?: AnswersLayoutType
  answers?: any[]
  name?: string
  assertType?: string
  isPratice?: boolean
  url?: string
  id: string
  isPreview?: boolean
}
export default function WritingQuiz({
  textColor = '#181D27',
  answers = [],
  isPratice,
  assertType,
  id,
  url,
  name,
  isPreview = false
}: WritingQuizProps) {
  const [resultStatus, setResultStatus] = useState<
    'idle' | 'correct' | 'wrong'
  >('idle')
  const setMetadata = useListChatMessagesStore((state) => state.setMetadata)
  const setStatus = useBookSidebarStore((state) => state.setStatus)

  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const validateQuestionContent = useMemo(() => {
    if (!name) return ''
    return DOMPurify.sanitize(name)
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
            generateRandomNumber(0, LIST_ENCOURAGE_TEXT.length)
          ]
      }
    }
    if (resultStatus === 'wrong') {
      return {
        background: '#FEF3F2',
        color: '#D92D20',
        content:
          LIST_WARNING_TEXT[generateRandomNumber(0, LIST_WARNING_TEXT.length)]
      }
    }
    return { background: 'unset', content: '', color: undefined }
  }, [resultStatus])
  const handleCheckAnswer = async () => {
    const accessToken = await getAccessTokenFromCookie()
    const userInfoId = await getUserInfoFromCookie()
    if (!answers[0] || !userInfoId || !accessToken) {
      return
    }
    setLoading(true)
    try {
      const res = await checkUserAnswerForQuiz([
        {
          content: content,
          user_id: userInfoId,
          question_id: id
        }
      ])
      const data = res.data
      if (data.is_all_correct) {
        setResultStatus('correct')
      } else {
        setStatus({ isShowChatbot: true })
        setMetadata({
          type: 'wrong_answer',
          user_answer_quiz: {
            is_correct: false,
            quiz_id: id,
            type: QUIZ_TYPE.essay,
            question: { content: name || '' },
            user_answer: {
              choice: [],
              content: content
            } // `choice` để trống, `content` là câu trả lời của học sinh.
          }
        })
        setResultStatus('wrong')
      }
    } catch (error) {
      toasts.error('Có lỗi xảy ra khi sử dụng AI để chấm')
      console.error('error', error)
    }
    setLoading(false)
  }
  const handleExplain = () => {}
  return (
    <div id="writing-quiz" style={{ color: textColor }}>
      <div className="flex gap-4 flex-col">
        <div
          className="px-4 flex-1 mb-4"
          dangerouslySetInnerHTML={{ __html: validateQuestionContent }}
        />
        {assertType && (
          <MediaRender
            url={url ? url : ''}
            type={assertType as Material_Code}
            containerClass="flex-1 max-w-80 mx-auto"
          />
        )}
      </div>
      <Separator className="mx-auto my-6 max-w-64" />
      <div
        className="flex flex-col gap-1.5 px-4 mb-8"
        // style={{
        //   gridTemplateColumns: `repeat(${answersLayout}, minmax(0, 1fr))`
        // }}
      >
        <Label htmlFor="answer">
          Trả lời <sup className="text-rose-500 text-sm">*</sup>
        </Label>
        <Textarea
          id="answer"
          value={content}
          placeholder="Nhập câu trả lời"
          disabled={!isPreview || loading}
          rows={7}
          onChange={(e) => {
            if (e.target.value.length > 1000) return
            setContent(e.target.value)
          }}
          maxLength={answers?.[0].max_characters || 1000}
          className="w-full bg-white writing-quiz"
        />
      </div>
      {isPratice && (
        <QuizFooterQuizResult
          loading={loading}
          background={resultData.background}
          handleCheckAnswer={handleCheckAnswer}
          handleRefresh={() => {
            setResultStatus('idle')
          }}
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
