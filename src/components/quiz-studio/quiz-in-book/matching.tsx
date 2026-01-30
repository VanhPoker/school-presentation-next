import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { GetQuestionByPkQuery } from '@/graphql/generated'
import { isEmpty } from 'lodash-es'
import { checkUserAnswerForQuiz } from '@/services/ai'
import { useListChatMessagesStore } from '@/stores/use-list-chat-messages-store'
import { useBookSidebarStore } from '@/stores/use-book-sidebar-store'
import useQuizInBook from './_hooks/useQuizInBook'
import { useReadOriginalBookStore } from '@/stores/use-read-original-book-store'
import {
  getAccessTokenFromCookie,
  getUserInfoFromCookie
} from '@/server-action/auth'
const Matching = dynamic(
  () => import('@/components/quiz-studio/quiz-rehearsal/quiz-types/matching'),
  { ssr: false }
)

type Props = {
  items: GetQuestionByPkQuery['questions_by_pk']
  id: string
}
export default function QuizInBookMatching({ items, id }: Props) {
  const setMetadata = useListChatMessagesStore((state) => state.setMetadata)
  const setStatus = useBookSidebarStore((state) => state.setStatus)
  const [data, setData] = useState(items)
  const [userAnswers, setUserAnswers] = useState<any[]>([])
  const [resultQuiz, setResultQuiz] = useState<Record<string, any>>([])
  const [countReset, setContReset] = useState<number>(0)

  const [choiceContents, setChoiceContents] = useState<[string, string][]>([])
  const [availableChoices, setAvailableChoices] = useState<{
    [key: string]: string[]
  }>({})
  const [imageData, setImageData] = useState<any>(null)

  const {
    isActiveQuizChecking,
    isActiveQuizExplaining,
    isActiveQuizRefreshing
  } = useQuizInBook()
  const isChecking = isActiveQuizChecking(id)
  const isExplaining = isActiveQuizExplaining(id)
  const isRefreshing = isActiveQuizRefreshing(id)

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
    if (userAnswers.length === 0 || !accessToken || !userInfoId) {
      useReadOriginalBookStore.setState((state) => {
        const newQuizResults = state?.quizResults?.map((item) =>
          item?.id === id ? { ...item, status: 'wrong' } : item
        )
        state.quizResults = newQuizResults as typeof state.quizResults
        state.quizAction = ''
      })
      return
    }
    const answersResultFormat: {
      user_id: string
      hotspots_id: string
      question_id: string
      item_drop: object
      label: string
    }[] = []
    userAnswers.forEach((item) => {
      const data = item.child[0]
      if (!data || !data.item_drop.label) return
      const { item_drop } = data
      answersResultFormat.push({
        user_id: userInfoId,
        hotspots_id: data.id,
        question_id: id,
        item_drop: {
          user_id: userInfoId,
          hotspots_id: data.id,
          question_id: id,
          label: item_drop.label
        },
        label: data.label
      })
    })
    const res = await checkUserAnswerForQuiz(answersResultFormat)
    const dataRes = res.data
    const questions_hotspots = data?.questions_hotspots
    const leftChoices = [...(questions_hotspots || [])]
      .filter((item: any) => item.left === 0)
      .sort((a: any, b: any) => a.label?.localeCompare(b.label))
    const rightChoices = [...(questions_hotspots || [])]
      .filter((item: any) => item.left === 1)
      .sort((a: any, b: any) => a.label?.localeCompare(b.label))

    const _choiceContents: [string, string][] = []
    leftChoices.forEach((leftChoice: any) => {
      const matchedAnswer = userAnswers.find(
        (select: any) => select.child[0].id === leftChoice.id
      )
      if (matchedAnswer && matchedAnswer.child[0].item_drop) {
        const rightChoice = questions_hotspots?.find(
          (item: any) => item.id === matchedAnswer.child[0].item_drop.id
        )
        const pair: [string, string] = [
          leftChoice.content,
          rightChoice?.content || ''
        ]
        _choiceContents.push(pair)
      }
    })
    setChoiceContents(_choiceContents)

    const _availableChoices: { [key: string]: string[] } = {}
    if (leftChoices.length > 0) {
      _availableChoices['list 1'] = leftChoices.map((item: any) => item.content)
    }
    if (rightChoices.length > 0) {
      _availableChoices['list 2'] = rightChoices.map(
        (item: any) => item.content
      )
    }
    setAvailableChoices(_availableChoices)

    const _imageData = data?.file_urls ? { content: data.file_urls.url } : null
    setImageData(_imageData)

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

    const checkUserAnswers = userAnswers.map((x) => {
      x.child = x.child.map((y: any) => {
        if (!isEmpty(y.item_drop)) {
          y.is_correct = y.label === y.item_drop.label ? true : false
          y.item_drop.is_correct = y.label === y.item_drop.label ? true : false
        }
        return { ...y }
      })
      return { ...x }
    })
    setResultQuiz(checkUserAnswers)
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
    useReadOriginalBookStore.setState((state) => {
      const newQuizResults = state?.quizResults?.map((item) =>
        item?.id === id ? { ...item, status: 'idle' } : item
      )
      state.quizResults = newQuizResults as typeof state.quizResults
      state.quizAction = ''
    })
    setContReset((count) => count + 1)
    setData(items)
    setUserAnswers([])
    setResultQuiz([])
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
    <div id="fill-in-the-blank">
      <div className="w-full px-3">
        <Matching
          key={countReset}
          item={data}
          results={resultQuiz}
          config={{
            isInBook: true,
            dragColor: 'bg-gray-100'
          }}
          handleJSONChange={(res) => {
            setUserAnswers(res)
          }}
        />
      </div>
    </div>
  )
}
