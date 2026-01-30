import { Button } from '@/components/ui/button'
import { BotMessageSquare, HelpCircle, RefreshCcw, Trophy } from 'lucide-react'
import { motion } from 'motion/react'
type QuizFooterQuizResultProps = {
  background: string
  status: 'idle' | 'wrong' | 'correct'
  content?: string
  disable?: boolean
  loading?: boolean
  color?: string
  handleExplain?: () => void
  handleCheckAnswer: () => void
  handleRefresh: () => void
}
export default function QuizFooterQuizResult({
  background,
  status,
  disable = false,
  content,
  color,
  loading = false,
  handleCheckAnswer,
  handleExplain,
  handleRefresh
}: QuizFooterQuizResultProps) {
  return (
    <div
      className="px-6 py-5 rounded-b-lg border-t"
      style={{
        background: background
      }}
    >
      <div className="flex justify-between gap-2">
        {content && status !== 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl flex items-center font-semibold"
            style={{
              color: color
            }}
          >
            {content}
            <Trophy color={color} className="ml-2" size={18} />
          </motion.div>
        )}
        {status === 'idle' && (
          <Button
            disabled={loading || disable}
            loading={loading}
            //   disabled={selectedAnswers.length === 0}
            className="bg-white px-4 py-2 group rounder-xl border-2 border-blue-500 transition"
            onClick={handleCheckAnswer}
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
        {status === 'correct' && (
          <div className="flex ml-auto">
            <Button
              disabled={loading}
              loading={loading}
              onClick={handleExplain}
              // variant={''}
            >
              <BotMessageSquare />
              Giải thích
            </Button>
          </div>
        )}
        {status === 'wrong' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 ml-auto"
          >
            {/* <Button disabled>
              <BotMessageSquare />
              Gợi ý
            </Button> */}
            <Button
              disabled={loading}
              loading={loading}
              variant={'warning'}
              onClick={handleRefresh}
            >
              <RefreshCcw />
              Làm lại
            </Button>
          </motion.div>
        )}
      </div>
      {/* <div className="flex gap-2 pointer-events-none items-center mt-4">
        <div className="text-sm">Bạn đánh giá sao về Quiz này?</div>
        <ThumbsUp size={16} color="#414651" />
        <ThumbsDown size={16} color="#414651" />
      </div> */}
    </div>
  )
}
