import { AnswersLayoutType, Material_Code } from '@/types/material/type'
import { useEffect, useMemo, useState } from 'react'
import DOMPurify from 'dompurify'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'
import {
  LIST_ENCOURAGE_TEXT,
  LIST_WARNING_TEXT
} from '@/mock-data/quiz-study/config'
import { generateRandomNumber } from '@/helper/generateRandomNumber'
import { useBookSidebarStore } from '@/stores/use-book-sidebar-store'
import { useListChatMessagesStore } from '@/stores/use-list-chat-messages-store'
import { checkUserAnswerForQuiz } from '@/services/ai'
import { toasts } from '@/components/ui/toast-color'
import RenderTiptapContent from '@/components/base/render-tiptap-content'
import MutipleChoiceQuizItem from '@/components/base/quiz/MutipleChoiceQuiz/MutipleChoiceQuizItem'
import useQuizInBook from './_hooks/useQuizInBook'
import { useReadOriginalBookStore } from '@/stores/use-read-original-book-store'
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
export default function QuizInBookChoice({
  textColor = '#181D27',
  assertType,
  answersLayout = AnswersLayoutType.ONE_COLUMN,
  answers = [],
  type,
  id,
  name,
  url,
  isSingleChoice = true
}: MutipleChoiceQuizProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<any[]>([])
  const setStatus = useBookSidebarStore((state) => state.setStatus)
  const setMetadata = useListChatMessagesStore((state) => state.setMetadata)
  const [resultStatus, setResultStatus] = useState<
    'idle' | 'correct' | 'wrong'
  >('idle')
  //
  const {
    isActiveQuizChecking,
    isActiveQuizExplaining,
    isActiveQuizRefreshing
  } = useQuizInBook()
  const isChecking = isActiveQuizChecking(id)
  const isExplaining = isActiveQuizExplaining(id)
  const isRefreshing = isActiveQuizRefreshing(id)
  const validateName = useMemo(() => {
    if (!name) return ''
    return DOMPurify.sanitize(name, { ADD_TAGS: ['math-inline'] })
  }, [])
  // const correctAnswers = useMemo(
  //   () =>
  //     answers
  //       .filter((item: any) => item?.is_correct === true)
  //       .map((item: any) => item?.content),
  //   [answers]
  // )

  // const availableChoices = useMemo(
  //   () => answers.map((item: any) => item?.content),
  //   [answers]
  // )
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
    const userInfoId = await getUserInfoFromCookie()
    const accessToken = await getAccessTokenFromCookie()
    if (selectedAnswers.length === 0 || !accessToken || !userInfoId) {
      useReadOriginalBookStore.setState((state) => {
        const newQuizResults = state?.quizResults?.map((item) =>
          item?.id === id ? { ...item, status: 'wrong' } : item
        )
        state.quizResults = newQuizResults as typeof state.quizResults
        state.quizAction = ''
      })
      return
    }
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
      return
    }
    if (data?.is_all_correct) {
      setResultStatus('correct')
      useReadOriginalBookStore.setState((state) => {
        const newQuizResults = state?.quizResults?.map((item) =>
          item?.id === id ? { ...item, status: 'correct' } : item
        )
        state.quizResults = newQuizResults as typeof state.quizResults
        state.quizAction = ''
      })
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
      setStatus({ isShowChatbot: true, isModalMode: true })
      setResultStatus('wrong')
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
      useReadOriginalBookStore.setState((state) => {
        const newQuizResults = state?.quizResults?.map((item) =>
          item?.id === id ? { ...item, status: 'wrong' } : item
        )
        state.quizResults = newQuizResults as typeof state.quizResults
        state.quizAction = ''
      })
      useBookSidebarStore.setState({
        isShowChatbot: true
      })
    }
  }
  const handleExplain = () => {
    const choiceIndexs: number[] = []
    selectedAnswers.forEach((select) => {
      const matchedIndex = answers.findIndex((item) => item.id === select.id)
      if (matchedIndex >= 0) {
        choiceIndexs.push(matchedIndex)
      }
    })
    setStatus({ isShowChatbot: true, isModalMode: true })
    setMetadata({
      type: 'explain',
      user_answer_quiz: {
        quiz_id: id,
        type: type,
        question: { content: name || '' },
        user_answer: { choice: choiceIndexs, content: '' }
      }
    })
  }
  const handleRefresh = () => {
    useReadOriginalBookStore.setState((state) => {
      const newQuizResults = state?.quizResults?.map((item) =>
        item?.id === id ? { ...item, status: 'idle' } : item
      )
      state.quizResults = newQuizResults as typeof state.quizResults
      state.quizAction = ''
    })
    setResultStatus('idle')
  }
  // Check answer
  useEffect(() => {
    if (!isChecking) return
    handleCheckAnswer()
  }, [isChecking])

  // Explain
  useEffect(() => {
    if (!isExplaining) return
    handleExplain()
  }, [isExplaining])

  // Refresh
  useEffect(() => {
    if (!isRefreshing) return
    handleRefresh()
  }, [isRefreshing])
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
              assertType !== 'audios' ? 'max-w-56' : 'w-full'
            )}
          />
        )}
      </div>
      <Separator className="mx-auto my-4 max-w-64 px-4" />
      <div className="grid md:grid-cols-2 gap-4 px-4 mb-8">
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
    </div>
  )
}
