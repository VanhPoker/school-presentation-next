import { useEffect, useMemo, useState } from 'react'
import DOMPurify from 'dompurify'
import ImageLabelingPreview from '@/components/quiz-studio/quiz-rehearsal/quiz-types/ImageLabelingPreview'
import { QuizImageLabelAnswer } from '@/types/quiz-create'
import { checkUserAnswerForQuiz } from '@/services/ai'
import { useListChatMessagesStore } from '@/stores/use-list-chat-messages-store'
import { useReadOriginalBookStore } from '@/stores/use-read-original-book-store'
import { QUIZ_TYPE } from '@/types/quiz-studio'
import useQuizInBook from './_hooks/useQuizInBook'
import { useBookSidebarStore } from '@/stores/use-book-sidebar-store'
import { cn } from '@/lib/utils'
import {
  getAccessTokenFromCookie,
  getUserInfoFromCookie
} from '@/server-action/auth'
import { groupBy } from 'lodash-es'

type Props = {
  content: string
  assertType?: string
  mediaWidth: number
  answerPositions: string
  url?: string
  id: string
  answers?: any[]
  className?: string
}
export default function QuizInBookSticker({
  content,
  id,
  answerPositions,
  mediaWidth,
  answers = [],
  url,
  className
}: Props) {
  const [userAnswers, setUserAnswers] = useState<QuizImageLabelAnswer[]>([])
  const setMetadata = useListChatMessagesStore((state) => state.setMetadata)
  const validateQuestionContent = useMemo(() => {
    if (!content) return ''
    return DOMPurify.sanitize(content)
  }, [])
  const {
    isActiveQuizChecking,
    isActiveQuizExplaining,
    isActiveQuizRefreshing
  } = useQuizInBook()
  const isChecking = isActiveQuizChecking(id)
  const isExplaining = isActiveQuizExplaining(id)
  const isRefreshing = isActiveQuizRefreshing(id)

  const availableChoices = useMemo(
    () => answers.map((item: any) => item?.content),
    [answers]
  )

  const formatQuestionName = (questionName: string): string => {
    if (!questionName || typeof questionName !== 'string') return ''
    const cleaned = questionName.replace(
      /<math-inline[^>]*>([\s\S]*?)<\/math-inline>/g,
      (_, latexContent: string) => latexContent.trim()
    )
    return cleaned
  }

  const getChoiceContents = (
    answers: any[],
    userAnswers: QuizImageLabelAnswer[]
  ) => {
    const questionsHotpotsGroupById = groupBy(answers, 'id')
    const choiceContents = userAnswers?.map(
      (item: any) => questionsHotpotsGroupById[item?.hotspotsId]?.[0]?.content
    )
    return choiceContents
  }

  const getChoiceCoordinates = (userAnswers: QuizImageLabelAnswer[]) => {
    const coordinates = userAnswers
      ?.map((item: any) =>
        typeof item?.left === 'number' && typeof item?.top === 'number'
          ? ([item.left, item.top] as [number, number])
          : null
      )
      .filter((v): v is [number, number] => Array.isArray(v) && v.length === 2)
    return coordinates
  }

  const handleCheckAnswer = async () => {
    const accessToken = await getAccessTokenFromCookie()
    const userInfoId = await getUserInfoFromCookie()
    const isSomeAnswerEmpty = userAnswers.some(
      (item) => item.hotspotsId === '' || !item.alignment
    )
    if (
      userAnswers.length === 0 ||
      isSomeAnswerEmpty ||
      !accessToken ||
      !userInfoId
    ) {
      useReadOriginalBookStore.setState((state) => {
        const newQuizResults = state?.quizResults?.map((item) =>
          item?.id === id ? { ...item, status: 'wrong' } : item
        )
        state.quizResults = newQuizResults as typeof state.quizResults
        state.quizAction = ''
      })
      return
    }
    const formatData = userAnswers.map((item) => ({
      top: item.top || 0,
      left: item.left || 0,
      question_id: id,
      alignment: item.alignment!,
      hotspots_id: item.hotspotsId!,
      user_id: userInfoId
    }))

    const res = await checkUserAnswerForQuiz(formatData)
    const dataRes = res.data
    const imageData = url ? { content: url || '' } : null
    if (dataRes?.is_all_correct) {
      useReadOriginalBookStore.setState((state) => {
        const newQuizResults = state?.quizResults?.map((item) =>
          item?.id === id ? { ...item, status: 'correct' } : item
        )
        state.quizResults = newQuizResults as typeof state.quizResults
        state.quizAction = ''
      })
    } else {
      setMetadata({
        type: 'wrong_answer',
        user_answer_quiz: {
          is_correct: false,
          quiz_id: id,
          type: QUIZ_TYPE.sticker,
          image: imageData || undefined,
          question: { content: content || '' },
          available_choices: availableChoices,
          user_answer: { content: getChoiceContents(answers, userAnswers) },
          bbox: getChoiceCoordinates(userAnswers)
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
        isShowChatbot: true,
        isModalMode: true
      })
    }
  }

  const handleExplain = () => {
    useReadOriginalBookStore.setState({
      quizAction: ''
    })
    useBookSidebarStore.setState({
      isShowChatbot: true,
      isModalMode: true
    })
    setMetadata({
      type: 'explain',
      user_answer_quiz: {
        is_correct: true,
        quiz_id: id,
        type: QUIZ_TYPE.sticker,
        image: url ? { content: url || '' } : undefined,
        question: { content: formatQuestionName(content || '') },
        available_choices: availableChoices,
        bbox: getChoiceCoordinates(userAnswers),
        user_answer: { content: getChoiceContents(answers, userAnswers) }
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
    <div className={cn(className)}>
      <div
        className="px-4 flex-1 mb-9 text-center"
        dangerouslySetInnerHTML={{ __html: validateQuestionContent }}
      />
      <ImageLabelingPreview
        imageUrl={url || ''}
        questionsHotpots={answers}
        originMediaWidth={mediaWidth}
        onChange={(data) => {
          setUserAnswers(data)
        }}
        answerPositions={answerPositions}
        containerClass="h-full"
      />
    </div>
  )
}
