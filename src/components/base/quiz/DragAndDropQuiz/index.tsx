import dynamic from 'next/dynamic'
import QuizFooterQuizResult from '../quiz-footer-quiz-result'
import { useMemo, useState } from 'react'
import {
  LIST_ENCOURAGE_TEXT,
  LIST_WARNING_TEXT
} from '@/mock-data/quiz-study/config'
import { generateRandomNumber } from '@/helper/generateRandomNumber'
import { GetQuestionByPkQuery } from '@/graphql/generated'
import { checkUserAnswerForQuiz } from '@/services/ai'
import { toasts } from '@/components/ui/toast-color'
import useQuizStudioEditor from '@/hooks/use-quiz-studio-editor'
import { useListChatMessagesStore } from '@/stores/use-list-chat-messages-store'
import { useBookSidebarStore } from '@/stores/use-book-sidebar-store'
import {
  getAccessTokenFromCookie,
  getUserInfoFromCookie
} from '@/server-action/auth'
const DragDropQuiz = dynamic(
  () =>
    import(
      '@/components/quiz-studio/quiz-rehearsal/quiz-types/fill-drag-drop/drag-box'
    ),
  { ssr: false }
)

type DragAndDropProps = {
  items: GetQuestionByPkQuery['questions_by_pk']
  isPratice?: boolean
  id: string
}

export default function DragAndDropQuiz({
  items,
  isPratice = false,
  id
}: DragAndDropProps) {
  const [resultStatus, setResultStatus] = useState<
    'idle' | 'correct' | 'wrong'
  >('idle')
  const [data, setData] = useState(items)
  const [loading, setLoading] = useState(false)
  const [userAnswers, setUserAnswers] = useState<any[]>([])
  const [resultQuiz, setResultQuiz] = useState<Record<string, any>>([])
  const [countReset, setContReset] = useState<number>(0)
  const setMetadata = useListChatMessagesStore((state) => state.setMetadata)
  const { collectFillDragDrop } = useQuizStudioEditor()
  const setStatus = useBookSidebarStore((state) => state.setStatus)

  const [choiceContents, setChoiceContents] = useState<string[]>([])
  const [availableChoices, setAvailableChoices] = useState<string[]>([])
  const [imageData, setImageData] = useState<any>(null)

  const formatQuestionName = (questionName: string): string => {
    if (!questionName) return '<blank_1>'
    let index = 1
    let formatted = questionName.replace(
      /<fill-drag-drop[^>]*>[\s\S]*?<\/fill-drag-drop>/g,
      () => `<blank_${index++}>`
    )
    formatted = formatted.replace(
      /<math-inline[^>]*>([\s\S]*?)<\/math-inline>/g,
      (_, content: string) => content.trim()
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
    if (userAnswers.length === 0 || !userInfoId || !accessToken) {
      setResultStatus('wrong')
      return
    }
    setLoading(true)
    const getAllNodeFillDragDrop = collectFillDragDrop(userAnswers)
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
    const result = dataRes?.results || []
    const isAllCorrect = dataRes?.is_all_correct
    const quizMainChoices = data?.questions_hotspots
    const sortedQuizMainChoices = [...(quizMainChoices || [])].sort(
      (a: any, b: any) => a.fill_order - b.fill_order
    )

    const _choiceContents: string[] = []
    result?.forEach((select: any) => {
      if (select?.item_drop) {
        const matchedHotspot = sortedQuizMainChoices.find(
          (hotspots: any) => hotspots.id === select.hotspots_id
        )
        if (matchedHotspot) {
          const index = (matchedHotspot.fill_order ?? 1) - 1
          _choiceContents[index] = select?.item_drop?.content || ''
        }
      }
    })
    setChoiceContents(_choiceContents)

    const _availableChoices: string[] = []
    quizMainChoices?.forEach((item: any) => {
      _availableChoices.push(item.content)
    })
    setAvailableChoices(_availableChoices)

    const _imageData = data?.file_urls
      ? { content: data?.file_urls ? data?.file_urls.url : '' }
      : null
    setImageData(_imageData)

    if (!Array(dataRes?.results)) {
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
          image: _imageData || undefined,
          question: { content: formatQuestionName(data?.name || '') },
          available_choices: _availableChoices,
          user_answer: { content: _choiceContents }
        }
      })
      setStatus({ isShowChatbot: true })
      setResultStatus('wrong')
    }
    const resultAnswers = attrsAnswers.map((x: any) => {
      x.is_correct = isAllCorrect
      return x
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
        image: imageData || undefined,
        question: { content: formatQuestionName(data?.name || '') },
        available_choices: availableChoices,
        user_answer: { content: choiceContents }
      }
    })
  }

  return (
    <div id="drag-and-drop-quiz">
      <div className="w-full">
        <DragDropQuiz
          key={countReset}
          item={data}
          results={resultQuiz}
          config={{
            isInBook: true
          }}
          handleJSONChange={(res) => {
            setUserAnswers(res)
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
            setUserAnswers([])
            setResultQuiz([])
          }}
          content={resultData.content}
          status={resultStatus}
          color={resultData.color}
        />
      )}
    </div>
  )
}
