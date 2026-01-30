import './style.scss'
import dynamic from 'next/dynamic'
import QuizFooterQuizResult from '../quiz-footer-quiz-result'
import { useMemo, useRef, useState } from 'react'
import {
  LIST_ENCOURAGE_TEXT,
  LIST_WARNING_TEXT
} from '@/mock-data/quiz-study/config'
import { generateRandomNumber } from '@/helper/generateRandomNumber'
import { GetQuestionByPkQuery } from '@/graphql/generated'
import { toasts } from '@/components/ui/toast-color'
import useQuizStudioEditor from '@/hooks/use-quiz-studio-editor'
import { checkUserAnswerForQuiz } from '@/services/ai'
import { cleanObject } from '@/helper/cleanObject'
import { useListChatMessagesStore } from '@/stores/use-list-chat-messages-store'
import { useBookSidebarStore } from '@/stores/use-book-sidebar-store'
import {
  getAccessTokenFromCookie,
  getUserInfoFromCookie
} from '@/server-action/auth'
const FillQuiz = dynamic(
  () =>
    import(
      '@/components/quiz-studio/quiz-rehearsal/quiz-types/fill-drag-drop/fill-box'
    ),
  { ssr: false }
)

type FillInTheBlankQuizProps = {
  items: GetQuestionByPkQuery['questions_by_pk']
  isPratice?: boolean
  id: string
}

export default function FillInTheBlankQuiz({
  items,
  isPratice = false,
  id
}: FillInTheBlankQuizProps) {
  const [data, setData] = useState(items)
  const [loading, setLoading] = useState(false)
  const userAnswersRef = useRef([])
  const [resultQuiz, setResultQuiz] = useState<Record<string, any>>([])
  const [countReset, setContReset] = useState<number>(0)
  const [resultStatus, setResultStatus] = useState<
    'idle' | 'correct' | 'wrong'
  >('idle')

  const [choiceContents, setChoiceContents] = useState<string[]>([])

  const { collectFillDragDrop } = useQuizStudioEditor()
  const setMetadata = useListChatMessagesStore((state) => state.setMetadata)
  const setStatus = useBookSidebarStore((state) => state.setStatus)

  const formatQuestionName = (questionName: string) => {
    if (!questionName) return '<blank_1>'
    let index = 1
    let formatted = questionName.replace(
      /<fill-drag-drop[^>]*>.*?<\/fill-drag-drop>/g,
      () => `<blank_${index++}>`
    )
    formatted = formatted.replace(
      /<math-inline[^>]*>(.*?)<\/math-inline>/g,
      (_, content) => {
        const match = content.match(/\\cfrac{.*?}{.*?}/)
        return match ? match[0] : ''
      }
    )
    return formatted
  }

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
    if (userAnswersRef.current.length === 0 || !userInfoId || !accessToken) {
      setResultStatus('wrong')
      return
    }
    setLoading(true)
    const getAllNodeFillDragDrop = collectFillDragDrop(userAnswersRef.current)
    const attrsAnswers = getAllNodeFillDragDrop.map((x: any) => {
      return x.attrs
    })
    const res = await checkUserAnswerForQuiz(
      attrsAnswers.map((item: any) => ({
        ...item,
        user_id: userInfoId,
        question_id: id,
        hotspots_id: item.id,
        item_drop: {
          ...item.item_drop,
          user_id: userInfoId
        }
      }))
    )
    const dataRes = res.data
    const isAllCorrect = dataRes?.is_all_correct
    const results = dataRes?.results || []

    const _choiceContents: string[] = []
    attrsAnswers.forEach((select: any) => {
      if (select?.item_drop) {
        _choiceContents.push(select?.item_drop?.content || '')
      }
    })
    setChoiceContents(_choiceContents)

    if (!Array(results)) {
      toasts.error('Có lỗi xảy ra khi kiểm tra kết quả')
      setLoading(false)
      return
    }
    if (isAllCorrect) {
      setResultStatus('correct')
    } else {
      setMetadata({
        type: 'wrong_answer',
        user_answer_quiz: {
          is_correct: false,
          quiz_id: id,
          type: data?.question_category?.code || '',
          question: { content: formatQuestionName(data?.name || '') },
          user_answer: { content: _choiceContents }
        }
      })
      setStatus({ isShowChatbot: true })
      setResultStatus('wrong')
    }
    const resultAnswers = results.map((x: any) => {
      x.item_drop.content = x.content
      return cleanObject(x)
    })
    setResultQuiz(resultAnswers)
    setLoading(false)
  }

  const handleExplain = () => {
    setStatus({ isShowChatbot: true })
    setMetadata({
      type: 'explain',
      user_answer_quiz: {
        is_correct: true,
        quiz_id: id,
        type: data?.question_category?.code || '',
        question: { content: formatQuestionName(data?.name || '') },
        user_answer: { content: choiceContents }
      }
    })
  }

  return (
    <div id="fill-in-the-blank">
      <div className="w-full mb-5 fill-in-the-blank-quiz">
        <FillQuiz
          key={countReset}
          item={data}
          results={resultQuiz}
          config={{
            isInBook: true
          }}
          handleJSONChange={(res) => {
            userAnswersRef.current = res
          }}
        />
      </div>
      {isPratice && (
        <QuizFooterQuizResult
          loading={loading}
          disable={loading}
          background={resultData.background}
          handleExplain={handleExplain}
          handleCheckAnswer={handleCheckAnswer}
          handleRefresh={() => {
            setContReset((count) => count + 1)
            setResultStatus('idle')
            setData(items)
            setResultQuiz([])
            userAnswersRef.current = []
          }}
          content={resultData.content}
          status={resultStatus}
          color={resultData.color}
        />
      )}
    </div>
  )
}
