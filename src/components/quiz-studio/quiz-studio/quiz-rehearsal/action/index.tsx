import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useDoQuizStore } from '@/stores/use-do-quiz-store'
import { ArrowRightIcon, HelpCircleIcon, RefreshCwIcon } from 'lucide-react'
import { memo, useEffect, useRef } from 'react'
import useDoQuiz from '../_hooks/useDoQuiz'
import { useShallow } from 'zustand/react/shallow'
import Image from 'next/image'
import { isNumber } from 'lodash-es'
import {
  LIST_ENCOURAGE_TEXT,
  LIST_WARNING_TEXT
} from '@/mock-data/quiz-study/config'
import useQuizChatbot from '@/components/quiz-studio/quiz-rehearsal/_hooks/useQuizChatbot'
import { toasts } from '@/components/ui/toast-color'

const Action = () => {
  const { questions, studySetting, isChecking } = useDoQuizStore(
    useShallow((state) => ({
      questions: state.questions,
      studySetting: state.studySetting,
      isChecking: state.isChecking
    }))
  )
  const {
    activeQuestionResult,
    activeQuestionIndex,
    activeQuestionRetryCount,
    canCheckAnswer,
    handleCheckAnswer,
    clearQuestionResult,
    checkQuestionMustBeAnswered
  } = useDoQuiz()
  const { handleSendAnswerChatBot } = useQuizChatbot()

  const hasCalledChatBot = useRef(false)

  const getRandomIndex = (max: number) => {
    return Math.floor(Math.random() * max)
  }

  const getEncourageText = () => {
    const index = getRandomIndex(LIST_ENCOURAGE_TEXT.length)
    return LIST_ENCOURAGE_TEXT[index]
  }

  const getWarningText = () => {
    const index = getRandomIndex(LIST_WARNING_TEXT.length)
    return LIST_WARNING_TEXT[index]
  }

  const renderWrongResult = () => {
    if (!isNumber(activeQuestionRetryCount)) return null
    if (studySetting?.answer_again_if_false && activeQuestionRetryCount > 0) {
      return (
        <div className="flex items-center gap-3">
          <Button
            className="flex items-center rounded-lg"
            variant="warning"
            onClick={() => {
              hasCalledChatBot.current = false
              clearQuestionResult()
            }}
          >
            <RefreshCwIcon size={20} color="#fff" />
            <span className="text-sm text-white font-semibold">Làm lại</span>
          </Button>
          <span className="relative text-xs text-black font-medium border border-solid rounded-md pl-[18px] pr-[6px] py-[2px] bg-white after:content-[''] after:absolute after:w-[6px] after:h-[6px] after:bg-red-500 after:left-[7px] after:top-[7px] after:rounded-full">
            Còn {activeQuestionRetryCount} lần làm lại
          </span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-3">
        <span>😞</span>
        <span className="text-red-500 font-semibold text-xl">
          {getWarningText()}
        </span>
      </div>
    )
  }

  const renderResult = () => {
    if (!studySetting?.view_result_in_doing) return null
    if (activeQuestionResult?.isCorrect === true) {
      return (
        <div className="flex items-center gap-3">
          <span>
            <Image
              height={30}
              width={20}
              src={'/firework.png'}
              alt="firework"
            />
          </span>
          <span className="text-green-500 font-semibold text-xl">
            {getEncourageText()}
          </span>
        </div>
      )
    }
    if (activeQuestionResult?.isCorrect === false) {
      return renderWrongResult()
    }

    return (
      <Button
        className="px-4 py-2 rounder-xl border-2"
        onClick={handleCheckAnswer}
        disabled={isChecking || !canCheckAnswer}
        loading={isChecking}
      >
        <HelpCircleIcon size={20} />
        <span className=" font-semibold">Kiểm tra kết quả</span>
      </Button>
    )
  }

  const renderNextButton = () => {
    if (questions?.length - 1 === activeQuestionIndex) return null
    return (
      <Button
        className="p-2 rounded-lg  hover:bg-gray-300 ml-auto"
        onClick={() => {
          if (
            studySetting?.limit_time_by === 0 &&
            checkQuestionMustBeAnswered()
          ) {
            toasts.error('Vui lòng trả lời câu hỏi này trước khi tiếp tục.')
            return
          }
          useDoQuizStore.setState({
            activeQuestionId: questions[activeQuestionIndex + 1]?.id
          })
        }}
      >
        <ArrowRightIcon size={20} />
      </Button>
    )
  }

  useEffect(() => {
    if (
      activeQuestionResult?.isCorrect === false &&
      !hasCalledChatBot.current &&
      studySetting?.ai_support !== false
    ) {
      handleSendAnswerChatBot()
      hasCalledChatBot.current = true
    }

    if (activeQuestionResult?.isCorrect) {
      hasCalledChatBot.current = false
    }
  }, [activeQuestionResult?.isCorrect, handleSendAnswerChatBot])

  useEffect(() => {
    hasCalledChatBot.current = false
  }, [activeQuestionIndex])

  return (
    <div
      className={cn(
        'flex items-center py-3 px-4 md:py-[18px] md:px-6 border-t border-solid border-gray-200 justify-between md:min-h-[73px]',
        {
          'bg-green-100': activeQuestionResult?.isCorrect === true,
          'bg-red-100': activeQuestionResult?.isCorrect === false
        }
      )}
    >
      {renderResult()}
      {renderNextButton()}
    </div>
  )
}

export default memo(Action)
