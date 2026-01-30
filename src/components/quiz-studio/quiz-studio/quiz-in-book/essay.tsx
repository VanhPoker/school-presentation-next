import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { toasts } from '@/components/ui/toast-color'
import { checkUserAnswerForQuiz } from '@/services/ai'
import { useBookSidebarStore } from '@/stores/use-book-sidebar-store'
import { useListChatMessagesStore } from '@/stores/use-list-chat-messages-store'
import { useReadOriginalBookStore } from '@/stores/use-read-original-book-store'
import { Material_Code } from '@/types/material/type'
import { QUIZ_TYPE } from '@/types/quiz-studio'
import DOMPurify from 'dompurify'
import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'
import useQuizInBook from './_hooks/useQuizInBook'
import {
  getAccessTokenFromCookie,
  getUserInfoFromCookie
} from '@/server-action/auth'
import LatexEditor from '@/components/base/latex-editor'

const MediaRender = dynamic(() => import('@/components/base/media-render'), {
  ssr: false
})

type WritingQuizProps = {
  textColor?: string
  answers?: any[]
  name?: string
  assertType?: string
  isPratice?: boolean
  url?: string
  id: string
  isPreview?: boolean
}
export default function QuizInBookEssay({
  textColor = '#181D27',
  answers = [],
  assertType,
  id,
  url,
  name
}: WritingQuizProps) {
  const setMetadata = useListChatMessagesStore((state) => state.setMetadata)
  const [content, setContent] = useState('')
  //
  const {
    isActiveQuizChecking,
    isActiveQuizExplaining,
    isActiveQuizRefreshing
  } = useQuizInBook()
  const isChecking = isActiveQuizChecking(id)
  const isExplaining = isActiveQuizExplaining(id)
  const isRefreshing = isActiveQuizRefreshing(id)
  const validateQuestionContent = useMemo(() => {
    if (!name) return ''
    return DOMPurify.sanitize(name)
  }, [])

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

  const handleCheckAnswer = async () => {
    const accessToken = await getAccessTokenFromCookie()
    const userInfoId = await getUserInfoFromCookie()
    if (content === '' || !accessToken || !userInfoId) {
      useReadOriginalBookStore.setState((state) => {
        const newQuizResults = state?.quizResults?.map((item) =>
          item?.id === id ? { ...item, status: 'wrong' } : item
        )
        state.quizResults = newQuizResults as typeof state.quizResults
        state.quizAction = ''
      })
      return
    }

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
            type: QUIZ_TYPE.essay,
            image: url ? { content: url || '' } : undefined,
            question: { content: formatQuestionName(name || '') },
            available_choices: availableChoices,
            user_answer: { content: [content] }
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
    } catch (error) {
      toasts.error('Có lỗi xảy ra khi sử dụng AI để chấm')
      console.error('error', error)
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
        type: QUIZ_TYPE.essay,
        image: url ? { content: url || '' } : undefined,
        question: { content: formatQuestionName(name || '') },
        available_choices: availableChoices,
        user_answer: { content: [content] }
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
    setContent('')
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
    <div id="writing-quiz" style={{ color: textColor }}>
      <div className="flex gap-4 flex-col">
        <div className="px-4 flex-1 mb-4">
          <LatexEditor content={validateQuestionContent || ''} />
        </div>
        {assertType && (
          <MediaRender
            url={url ? url : ''}
            type={assertType as Material_Code}
            containerClass="flex-1 max-w-80 mx-auto"
          />
        )}
      </div>
      <Separator className="mx-auto my-6 max-w-64" />
      <div className="flex flex-col gap-1.5 px-4 mb-8">
        <Label htmlFor="answer">
          Trả lời <sup className="text-rose-500 text-sm">*</sup>
        </Label>
        <Textarea
          id="answer"
          value={content}
          placeholder="Nhập câu trả lời"
          rows={7}
          onChange={(e) => {
            if (e.target.value.length > 1000) return
            setContent(e.target.value)
          }}
          maxLength={1000}
          className="w-full bg-white writing-quiz"
        />
      </div>
    </div>
  )
}
