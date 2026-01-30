import { Button } from '@/components/ui/button'
import { generateRandomNumber } from '@/helper/generateRandomNumber'
import {
  LIST_ENCOURAGE_TEXT,
  LIST_WARNING_TEXT
} from '@/mock-data/quiz-study/config'
import { useReadOriginalBookStore } from '@/stores/use-read-original-book-store'
import { BotMessageSquare, HelpCircle, RefreshCcw, Trophy } from 'lucide-react'
import { motion } from 'motion/react'
import { useMemo } from 'react'
import useQuizInBook from '../_hooks/useQuizInBook'
import { useWindowSize } from 'react-use'
type Props = {
  disable?: boolean
  loading?: boolean
}
export default function QuizInBookCheckResult({
  disable = false,
  loading = false
}: Props) {
  const { activeQuizResultStatus } = useQuizInBook()
  const { width: windowWidth } = useWindowSize()

  const resultData = useMemo(() => {
    if (activeQuizResultStatus === 'idle') {
      return {
        background: 'unset',
        color: undefined,
        content: ''
      }
    }
    if (activeQuizResultStatus === 'correct') {
      return {
        background: '#ECFDF3',
        color: '#079455',
        content:
          windowWidth >= 1024
            ? LIST_ENCOURAGE_TEXT[
                generateRandomNumber(0, LIST_ENCOURAGE_TEXT.length)
              ]
            : LIST_ENCOURAGE_TEXT[10]
      }
    }
    if (activeQuizResultStatus === 'wrong') {
      return {
        background: '#FEF3F2',
        color: '#D92D20',
        content:
          windowWidth >= 1024
            ? LIST_WARNING_TEXT[
                generateRandomNumber(0, LIST_WARNING_TEXT.length)
              ]
            : LIST_WARNING_TEXT[15]
      }
    }
    return { background: 'unset', content: '', color: undefined }
  }, [activeQuizResultStatus])

  return (
    <div
      className="px-4 lg:px-6 py-[18px] lg:py-5 rounded-b-lg border-t flex justify-between gap-2"
      style={{
        background: resultData.background
      }}
    >
      {resultData.content && activeQuizResultStatus !== 'idle' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl flex items-center font-semibold flex-1"
          style={{
            color: resultData.color
          }}
        >
          {resultData.content}
          <Trophy
            color={resultData.color}
            className="ml-2 max-lg:hidden"
            size={18}
          />
        </motion.div>
      )}
      {activeQuizResultStatus === 'idle' && (
        <Button
          disabled={loading || disable}
          loading={loading}
          className="bg-white px-4 py-2 group rounder-xl border-2 border-blue-500 transition ml-auto"
          onClick={() =>
            useReadOriginalBookStore.setState({ quizAction: 'check' })
          }
        >
          <HelpCircle
            size={20}
            className="text-blue-900 group-hover:text-white"
          />
          <span className="text-blue-900 font-semibold group-hover:text-white">
            Kiểm tra kết quả
          </span>
        </Button>
      )}
      {activeQuizResultStatus === 'correct' && (
        <div className="flex ml-auto">
          <Button
            disabled={loading}
            loading={loading}
            onClick={() =>
              useReadOriginalBookStore.setState({ quizAction: 'explain' })
            }
          >
            <BotMessageSquare />
            Giải thích
          </Button>
        </div>
      )}
      {activeQuizResultStatus === 'wrong' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-3 lg:ml-auto"
        >
          <Button
            disabled={loading}
            loading={loading}
            variant={'warning'}
            onClick={() => {
              useReadOriginalBookStore.setState({ quizAction: 'refresh' })
            }}
          >
            <RefreshCcw />
            Làm lại
          </Button>
        </motion.div>
      )}
    </div>
  )
}
