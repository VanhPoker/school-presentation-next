import { useMemo, useState } from 'react'
import DOMPurify from 'dompurify'
import dynamic from 'next/dynamic'
import { Separator } from '@/components/ui/separator'
import QuizFooterQuizResult from '../quiz-footer-quiz-result'
import {
  LIST_ENCOURAGE_TEXT,
  LIST_WARNING_TEXT
} from '@/mock-data/quiz-study/config'
import { generateRandomNumber } from '@/helper/generateRandomNumber'
import { useLocalStorage } from 'react-use'
import { Material_Code } from '@/types/material/type'

const MediaRender = dynamic(() => import('@/components/base/media-render'), {
  ssr: false
})
type RecordingQuizProps = {
  textColor?: string
  answers?: any[]
  name?: string
  assertType?: string
  isPratice?: boolean
  url?: string
  recordType: string
  duration: number
  isPreview?: boolean
}
export default function RecordingQuiz({
  textColor = '#181D27',
  answers = [],
  isPratice,
  assertType,
  url,
  name
}: RecordingQuizProps) {
  const [resultStatus, setResultStatus] = useState<
    'idle' | 'correct' | 'wrong'
  >('idle')
  const [tutorAccessToken] = useLocalStorage<string>('tutorAccessToken')
  const [loading, setLoading] = useState(false)
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
    if (!tutorAccessToken || !answers[0]) {
      console.error('Không tồn tại token')
      return
    }
    setLoading(true)
    setLoading(false)
  }
  return (
    <div id="writing-quiz" style={{ color: textColor }}>
      <div className="flex gap-4 flex-col mb-9">
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
      {isPratice && (
        <QuizFooterQuizResult
          loading={loading}
          disable={true}
          background={resultData.background}
          handleCheckAnswer={handleCheckAnswer}
          handleRefresh={() => {
            setResultStatus('idle')
          }}
          content={resultData.content}
          status={resultStatus}
          color={resultData.color}
        />
      )}
    </div>
  )
}
