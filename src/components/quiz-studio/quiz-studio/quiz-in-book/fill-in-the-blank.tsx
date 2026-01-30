import { toasts } from '@/components/ui/toast-color'
import { GetQuestionByPkQuery } from '@/graphql/generated'
import { cleanObject } from '@/helper/cleanObject'
import useQuizStudioEditor from '@/hooks/use-quiz-studio-editor'
import { checkUserAnswerForQuiz } from '@/services/ai'
import { useBookSidebarStore } from '@/stores/use-book-sidebar-store'
import { useListChatMessagesStore } from '@/stores/use-list-chat-messages-store'
import { useReadOriginalBookStore } from '@/stores/use-read-original-book-store'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import useQuizInBook from './_hooks/useQuizInBook'
import {
  getAccessTokenFromCookie,
  getUserInfoFromCookie
} from '@/server-action/auth'
import { cn } from '@/lib/utils'

const FillQuiz = dynamic(
  () =>
    import(
      '@/components/quiz-studio/quiz-rehearsal/quiz-types/fill-drag-drop/fill-box'
    ),
  { ssr: false }
)

type FillInTheBlankQuizProps = {
  items: GetQuestionByPkQuery['questions_by_pk']
  id: string
  className?: string
}

export default function QuizInBookFillInTheBlank({
  items,
  id,
  className
}: FillInTheBlankQuizProps) {
  const [data] = useState(items)
  const userAnswersRef = useRef([])
  const [resultQuiz, setResultQuiz] = useState<Record<string, any>>([])
  const [countReset] = useState<number>(0)
  const [, setResultStatus] = useState<'idle' | 'correct' | 'wrong'>('idle')

  const [choiceContents, setChoiceContents] = useState<string[]>([])
  const { collectFillDragDrop } = useQuizStudioEditor()
  const setMetadata = useListChatMessagesStore((state) => state.setMetadata)
  const setStatus = useBookSidebarStore((state) => state.setStatus)
  //
  const {
    isActiveQuizChecking,
    isActiveQuizExplaining,
    isActiveQuizRefreshing
  } = useQuizInBook()
  const isChecking = isActiveQuizChecking(id)
  const isExplaining = isActiveQuizExplaining(id)
  const isRefreshing = isActiveQuizRefreshing(id)

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

  // const resultData = useMemo(() => {
  //   if (resultStatus === 'idle') {
  //     return {
  //       background: 'unset',
  //       color: undefined,
  //       content: ''
  //     }
  //   }
  //   if (resultStatus === 'correct') {
  //     return {
  //       background: '#ECFDF3',
  //       color: '#079455',
  //       content:
  //         LIST_ENCOURAGE_TEXT[
  //           generateRandomNumber(0, LIST_ENCOURAGE_TEXT.length - 1)
  //         ]
  //     }
  //   }
  //   if (resultStatus === 'wrong') {
  //     return {
  //       background: '#FEF3F2',
  //       color: '#D92D20',
  //       content:
  //         LIST_WARNING_TEXT[generateRandomNumber(0, LIST_WARNING_TEXT.length - 1)]
  //     }
  //   }
  //   return { background: 'unset', content: '', color: undefined }
  // }, [resultStatus])

  const handleCheckAnswer = async () => {
    const accessToken = await getAccessTokenFromCookie()
    const userInfoId = await getUserInfoFromCookie()
    if (userAnswersRef.current.length === 0 || !accessToken || !userInfoId) {
      useReadOriginalBookStore.setState((state) => {
        const newQuizResults = state?.quizResults?.map((item) =>
          item?.id === id ? { ...item, status: 'wrong' } : item
        )
        state.quizResults = newQuizResults as typeof state.quizResults
        state.quizAction = ''
      })
      setResultStatus('wrong')
      return
    }

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
        content_preview: item.content_preview,
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
      return
    }
    if (isAllCorrect) {
      useReadOriginalBookStore.setState((state) => {
        const newQuizResults = state?.quizResults?.map((item) =>
          item?.id === id ? { ...item, status: 'correct' } : item
        )
        state.quizResults = newQuizResults as typeof state.quizResults
        state.quizAction = ''
      })
      setResultStatus('correct')
    } else {
      setMetadata({
        type: 'wrong_answer',
        user_answer_quiz: {
          is_correct: false,
          quiz_id: id,
          type: data?.question_category?.code || '',
          question: {
            content: formatQuestionName(data?.content_preview || '')
          },
          user_answer: { content: _choiceContents }
        }
      })
      useReadOriginalBookStore.setState((state) => {
        const newQuizResults = state?.quizResults?.map((item) =>
          item?.id === id ? { ...item, status: 'wrong' } : item
        )
        state.quizResults = newQuizResults as typeof state.quizResults
        state.quizAction = ''
      })
      setStatus({ isShowChatbot: true, isModalMode: true })
      setResultStatus('wrong')
    }
    const resultAnswers = results.map((x: any) => {
      return {
        ...cleanObject(x),
        content: x.content
      }
    })
    setResultQuiz(resultAnswers)
  }

  const handleExplain = () => {
    setStatus({ isShowChatbot: true, isModalMode: true })
    useReadOriginalBookStore.setState({
      quizAction: ''
    })
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
    <div id="fill-in-the-blank" className={cn(className)}>
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
    </div>
  )
}
