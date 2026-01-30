import './style.scss'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { GetQuestionByPkQuery } from '@/graphql/generated'
import { toasts } from '@/components/ui/toast-color'
import useQuizStudioEditor from '@/hooks/use-quiz-studio-editor'
import { checkUserAnswerForQuiz } from '@/services/ai'
import { cleanObject } from '@/helper/cleanObject'
import { useListChatMessagesStore } from '@/stores/use-list-chat-messages-store'
import { useBookSidebarStore } from '@/stores/use-book-sidebar-store'
import useQuizInBook from '../_hooks/useQuizInBook'
import { useReadOriginalBookStore } from '@/stores/use-read-original-book-store'
import {
  getAccessTokenFromCookie,
  getUserInfoFromCookie
} from '@/server-action/auth'
import { cn } from '@/lib/utils'
const DropBox = dynamic(
  () =>
    import(
      '@/components/quiz-studio/quiz-rehearsal/quiz-types/fill-drag-drop/drop-box'
    ),
  { ssr: false }
)

type Props = {
  items: GetQuestionByPkQuery['questions_by_pk']
  id: string
  className?: string
}

export default function QuizInBookDropbox({ items, id, className }: Props) {
  const [data, setData] = useState(items)
  const userAnswersRef = useRef([])
  const [resultQuiz, setResultQuiz] = useState<Record<string, any>>([])
  const [countReset, setContReset] = useState<number>(0)
  const setMetadata = useListChatMessagesStore((state) => state.setMetadata)
  const setStatus = useBookSidebarStore((state) => state.setStatus)
  const [choiceContents, setChoiceContents] = useState<string[]>([])
  const [availableChoices, setAvailableChoices] = useState<{
    [key: string]: string[]
  }>({})
  const [imageData, setImageData] = useState<any>(null)

  const { collectFillDragDrop } = useQuizStudioEditor()
  const {
    isActiveQuizChecking,
    isActiveQuizExplaining,
    isActiveQuizRefreshing
  } = useQuizInBook()
  const isChecking = isActiveQuizChecking(id)
  const isExplaining = isActiveQuizExplaining(id)
  const isRefreshing = isActiveQuizRefreshing(id)

  const formatQuestionName = (quesionName: string) => {
    if (!quesionName) return '<blank_1>'
    let formattedName = quesionName
    let index = 1
    formattedName = formattedName.replace(/<fill-drag-drop[^>]*>/g, () => {
      return `<blank_${index++}>`
    })
    formattedName = formattedName.replace(
      /<math-inline[^>]*>(.*?)<\/math-inline>/g,
      (_, content) => {
        const match = content.match(/\\cfrac\{.*?\}\{.*?\}/)
        return match ? match[0] : ''
      }
    )
    return formattedName
  }

  const handleCheckAnswer = async () => {
    const accessToken = await getAccessTokenFromCookie()
    const userInfoId = await getUserInfoFromCookie()
    if (userAnswersRef.current.length === 0 || !userInfoId || !accessToken) {
      useReadOriginalBookStore.setState((state) => {
        const newQuizResults = state?.quizResults?.map((item) =>
          item?.id === id ? { ...item, status: 'wrong' } : item
        )
        state.quizResults = newQuizResults as typeof state.quizResults
        state.quizAction = ''
      })
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
        item_drop: {
          ...item.item_drop,
          user_id: userInfoId,
          answer_id: item.item_drop?.answer_id
        }
      }))
    )
    const dataRes = res.data
    const isAllCorrect = dataRes?.is_all_correct
    const results = dataRes?.results
    const questionsHotspots = data?.questions_hotspots || []
    const sortedQuizMainChoices = [...questionsHotspots]
      .sort((a: any, b: any) => a.fill_order - b.fill_order)
      .filter((x: any) => {
        return x.children && x.children.length > 0
      })
      .map((x: any) => {
        const newChildren = [...x.children].sort((a, b) => {
          if (a.is_correct) return -1
          if (b.is_correct) return 1
          return 0
        })
        return {
          ...x,
          children: [...newChildren]
        }
      })

    const _choiceContents: string[] = new Array(
      sortedQuizMainChoices.length
    ).fill('')
    attrsAnswers.forEach((select: any) => {
      const matchedChoice = sortedQuizMainChoices
        .flatMap((choice: any) => choice.children)
        .find((item: any) => item.id === select.item_drop?.answer_id)
      if (matchedChoice) {
        const parentChoice = sortedQuizMainChoices.find((choice: any) =>
          choice.children.some((child: any) => child.id === matchedChoice.id)
        )

        if (parentChoice) {
          const index = parentChoice.fill_order - 1
          _choiceContents[index] = matchedChoice.content
        }
      }
    })
    setChoiceContents(_choiceContents)

    const _availableChoices: { [key: string]: string[] } = {}
    sortedQuizMainChoices.forEach((item: any) => {
      item.children.map((child: any) => {
        const blankKey = `blank_${child.fill_order}`
        if (!_availableChoices[blankKey]) {
          _availableChoices[blankKey] = []
        }
        _availableChoices[blankKey].push(child.content)
      })
    })
    setAvailableChoices(_availableChoices)

    const _imageData = data?.file_urls
      ? { content: data?.file_urls ? data?.file_urls.url : '' }
      : null
    setImageData(_imageData)

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
    } else {
      setMetadata({
        type: 'wrong_answer',
        user_answer_quiz: {
          is_correct: false,
          quiz_id: id,
          type: data?.question_category?.code || '',
          image: _imageData || undefined,
          question: { content: formatQuestionName(data?.name || '') },
          available_choices: _availableChoices,
          user_answer: { content: _choiceContents }
        }
      })
      setStatus({ isShowChatbot: true, isModalMode: true })
      useReadOriginalBookStore.setState((state) => {
        const newQuizResults = state?.quizResults?.map((item) =>
          item?.id === id ? { ...item, status: 'wrong' } : item
        )
        state.quizResults = newQuizResults as typeof state.quizResults
        state.quizAction = ''
      })
    }
    const resultAnswers = results?.map((x: any) => {
      x.item_drop.content = x.content
      return cleanObject(x)
    })
    setResultQuiz(resultAnswers)
  }

  const handleExplain = () => {
    useReadOriginalBookStore.setState({
      quizAction: ''
    })
    setStatus({ isShowChatbot: true, isModalMode: true })
    setMetadata({
      type: 'explain',
      user_answer_quiz: {
        is_correct: true,
        quiz_id: id,
        type: data?.question_category?.code || '',
        image: imageData || undefined,
        question: { content: formatQuestionName(data?.name || '') },
        available_choices: availableChoices,
        user_answer: { content: choiceContents }
      }
    })
  }

  const handleRefresh = () => {
    setContReset((count) => count + 1)
    useReadOriginalBookStore.setState((state) => {
      const newQuizResults = state?.quizResults?.map((item) =>
        item?.id === id ? { ...item, status: 'idle' } : item
      )
      state.quizResults = newQuizResults as typeof state.quizResults
      state.quizAction = ''
    })
    setData(items)
    setResultQuiz([])
    userAnswersRef.current = []
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
    <div id="dropbox" className={cn(className)}>
      <div className="w-full mb-5 dropbox-quiz">
        <DropBox
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
