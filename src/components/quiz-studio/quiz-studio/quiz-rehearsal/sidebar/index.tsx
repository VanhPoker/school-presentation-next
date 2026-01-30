import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useDoQuizStore } from '@/stores/use-do-quiz-store'
import { ListIcon } from 'lucide-react'
import { memo, useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import useDoQuiz from '../_hooks/useDoQuiz'
import { toasts } from '@/components/ui/toast-color'

interface SidebarProps {
  onClose?: () => void
  isMobile?: boolean
}

const Sidebar = ({ onClose, isMobile = false }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const { activeQuestionIndex, checkQuestionMustBeAnswered } = useDoQuiz()
  const {
    questions,
    activeQuestionId,
    studySetting,
    results,
    isChecking,
    isQuestionsFetched
  } = useDoQuizStore(
    useShallow((state) => ({
      questions: state.questions,
      activeQuestionId: state.activeQuestionId,
      studySetting: state.studySetting,
      results: state.results,
      isChecking: state.isChecking,
      isQuestionsFetched: state.isQuestionsFetched
    }))
  )

  const getButtonDisabled = (index: number) => {
    if (
      studySetting?.limit_time_by === 0 &&
      index !== activeQuestionIndex &&
      index !== activeQuestionIndex + 1
    ) {
      return true
    }
    return false
  }

  const handleQuestionClick = (questionId: string) => {
    if (
      studySetting?.limit_time_by === 0 &&
      activeQuestionId !== questionId &&
      checkQuestionMustBeAnswered()
    ) {
      toasts.error('Vui lòng trả lời câu hỏi này trước khi tiếp tục.')
      return
    }
    useDoQuizStore.setState({
      activeQuestionId: questionId
    })
    // Close mobile sidebar after selection
    if (isMobile && onClose) {
      onClose()
    }
  }

  useEffect(() => {
    // Auto open sidebar on desktop/tablet when questions are fetched
    if (!isMobile && isQuestionsFetched) {
      setIsOpen(true)
    }
  }, [isMobile, isQuestionsFetched])

  return (
    <div
      className={cn(
        'h-full bg-white py-6 flex flex-col border-[1px] shrink-0 transition-all overflow-hidden gap-4',
        // Desktop/Tablet:
        !isMobile && !isOpen && 'w-20',
        !isMobile && isOpen && 'w-72',
        // Mobile:
        isMobile && 'w-full'
      )}
    >
      {/* Header with toggle/close button */}
      <div className="flex items-center justify-between mx-3">
        <Button
          className={cn(
            'h-11 rounded-lg border-gray-300 text-md font-semibold text-neutral-700 transition-all',
            isMobile ? 'flex-1' : 'w-full'
          )}
          onClick={() => {
            if (isMobile && onClose) {
              onClose()
            } else if (!isMobile) {
              setIsOpen(!isOpen)
            }
          }}
        >
          <ListIcon size={20} />
          <span className={cn('', (!isOpen || isMobile) && 'hidden')}>
            Ẩn mục lục
          </span>
          {isMobile && <span className="ml-2">Ẩn mục lục</span>}
        </Button>
      </div>

      <div
        className={cn(
          'grid grid-cols-5 gap-2 transition-all px-3 overflow-y-scroll',
          !isMobile && !isOpen && 'opacity-0 invisible',
          (isMobile || isOpen) && 'opacity-100 visible'
        )}
      >
        {questions?.map((question, index) => (
          <Button
            key={question?.id}
            disabled={getButtonDisabled(index) || isChecking}
            className={cn(
              'w-[46px] h-11 bg-[#FAFAFA] rounded-lg border border-solid border-[#D5D7DA] flex items-center justify-center text-[#252B37] hover:bg-[#0E2A58] hover:text-white font-semibold text-md shadow-xs hover:border-transparent',
              {
                'bg-[#0E2A58] text-white': activeQuestionId === question?.id,
                'bg-[#ECFDF3] text-[#079455] border-[#17B26A]':
                  results.has(question?.id) &&
                  results.get(question?.id)?.isCorrect,
                'bg-[#FEF3F2] text-[#D92D20] border-[#F04438]':
                  results.has(question?.id) &&
                  !results.get(question?.id)?.isCorrect
              }
            )}
            onClick={() => handleQuestionClick(question?.id)}
          >
            <span>{index + 1}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}

export default memo(Sidebar)
