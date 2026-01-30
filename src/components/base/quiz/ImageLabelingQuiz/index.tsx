import QuizFooterQuizResult from '../quiz-footer-quiz-result'
import { useMemo, useState } from 'react'
import DOMPurify from 'dompurify'
import {
  LIST_ENCOURAGE_TEXT,
  LIST_WARNING_TEXT
} from '@/mock-data/quiz-study/config'
import { generateRandomNumber } from '@/helper/generateRandomNumber'
import ImageLabelingPreview from '@/components/quiz-studio/quiz-rehearsal/quiz-types/ImageLabelingPreview'
import { QuizImageLabelAnswer } from '@/types/quiz-create'
import { GetQuestionByPkQuery } from '@/graphql/generated'
import { checkUserAnswerForQuiz } from '@/services/ai'
import { useListChatMessagesStore } from '@/stores/use-list-chat-messages-store'
import { useBookSidebarStore } from '@/stores/use-book-sidebar-store'
import {
  getAccessTokenFromCookie,
  getUserInfoFromCookie
} from '@/server-action/auth'

type ImageLabelingQuizProps = {
  content: string
  isPratice?: boolean
  isPreview?: boolean
  assertType?: string
  mediaWidth: number
  answerPositions: string
  url?: string
  id: string
  answers?: any[]
  items: GetQuestionByPkQuery['questions_by_pk']
}
export default function ImageLabelingQuiz({
  content,
  isPratice = false,
  id,
  answerPositions,
  mediaWidth,
  answers = [],
  url,
  items
}: ImageLabelingQuizProps) {
  const [resultStatus, setResultStatus] = useState<
    'idle' | 'correct' | 'wrong'
  >('idle')
  const [loading, setLoading] = useState(false)
  const [userAnswers, setUserAnswers] = useState<QuizImageLabelAnswer[]>([])
  const setMetadata = useListChatMessagesStore((state) => state.setMetadata)
  const setStatus = useBookSidebarStore((state) => state.setStatus)

  const [choiceContents, setChoiceContents] = useState<string[]>([])
  const [availableChoices, setAvailableChoices] = useState<string[]>([])
  const [imageData, setImageData] = useState<any>(null)

  const validateQuestionContent = useMemo(() => {
    if (!content) return ''
    return DOMPurify.sanitize(content)
  }, [content])

  const formatQuestionName = (questionName: string): string => {
    if (!questionName || typeof questionName !== 'string') return ''
    const cleaned = questionName.replace(
      /<math-inline[^>]*>([\s\S]*?)<\/math-inline>/g,
      (_, latexContent: string) => latexContent.trim()
    )
    return cleaned
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
    const isSomeAnswerEmpty = userAnswers.some(
      (item) => item.hotspotsId === '' || !item.alignment
    )
    if (
      userAnswers.length === 0 ||
      isSomeAnswerEmpty ||
      !accessToken ||
      !userInfoId
    ) {
      setResultStatus('wrong')
      return
    }
    setLoading(true)
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

    const _choiceContents: string[] = []
    dataRes.results?.forEach((select: any) => {
      const matchedChoice = answers.find(
        (item: any) => item.id === select.hotspots_id
      )
      if (matchedChoice) {
        _choiceContents.push(matchedChoice.content)
      }
    })
    setChoiceContents(_choiceContents)

    const _availableChoices: string[] = []
    answers.forEach((item: any) => {
      _availableChoices.push(item.content)
    })
    setAvailableChoices(_availableChoices)

    const _imageData = items?.file_urls
      ? { content: items?.file_urls ? items?.file_urls.url : '' }
      : null
    setImageData(_imageData)

    if (dataRes?.is_all_correct) {
      setResultStatus('correct')
    } else {
      setMetadata({
        type: 'wrong_answer',
        user_answer_quiz: {
          is_correct: false,
          quiz_id: id,
          type: items?.question_category?.code || '',
          image: _imageData || undefined,
          question: { content: formatQuestionName(content || '') },
          available_choices: _availableChoices,
          user_answer: { content: _choiceContents }
        }
      })
      setStatus({ isShowChatbot: true })
      setResultStatus('wrong')
    }
    setLoading(false)
  }

  const handleExplain = () => {
    setStatus({ isShowChatbot: true })
    setMetadata({
      type: 'explain',
      user_answer_quiz: {
        is_correct: true,
        quiz_id: id,
        type: items?.question_category?.code || '',
        image: imageData || undefined,
        question: { content: formatQuestionName(content || '') },
        available_choices: availableChoices,
        user_answer: { content: choiceContents }
      }
    })
  }

  return (
    <div id="image-labeling">
      <div className="flex mb-9">
        <div
          className="px-4 flex-1 mb-4"
          dangerouslySetInnerHTML={{ __html: validateQuestionContent }}
        />
      </div>
      <ImageLabelingPreview
        imageUrl={url || ''}
        questionsHotpots={answers}
        originMediaWidth={mediaWidth}
        onChange={(data) => {
          setUserAnswers(data)
        }}
        answerPositions={answerPositions}
        containerClass="h-[500px]"
      />
      {isPratice && (
        <QuizFooterQuizResult
          loading={loading}
          disable={!url}
          background={resultData.background}
          handleExplain={handleExplain}
          handleCheckAnswer={handleCheckAnswer}
          handleRefresh={() => {
            setResultStatus('idle')
            setUserAnswers([])
          }}
          content={resultData.content}
          status={resultStatus}
          color={resultData.color}
        />
      )}
    </div>
  )
}
