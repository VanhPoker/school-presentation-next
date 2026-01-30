import MainHeader from '../main-header'
import QuizByCode from '../quiz-by-code'
import { memo, useState } from 'react'
import Action from '../action'
import { cn } from '@/lib/utils'
import Sidebar from '../sidebar'
import { ListIcon, Loader2Icon, Timer } from 'lucide-react'
import TotalTimeCountDown from '../total-time-count-down'
import { useDoQuizStore } from '@/stores/use-do-quiz-store'
import { useShallow } from 'zustand/react/shallow'
import { useGlobalStore } from '@/stores/use-global-store'

interface MainProps {
  className?: string
}

function Main({ className }: MainProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { studySetting, isQuestionsFetched } = useDoQuizStore(
    useShallow((state) => ({
      studySetting: state.studySetting,
      isQuestionsFetched: state.isQuestionsFetched
    }))
  )
  const { showExitModal } = useGlobalStore(
    useShallow((state) => ({ showExitModal: state.showExitModal }))
  )

  const isOpen = isSidebarOpen && !showExitModal

  if (!isQuestionsFetched && isSidebarOpen) {
    setIsSidebarOpen(false)
  }

  if (!isQuestionsFetched) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-white rounded-xl m-2 md:m-6 pt-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2Icon className="h-12 w-12 animate-spin text-blue-600" />
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 mb-2">
              Đang tải dữ liệu bài kiểm tra...
            </p>
            <p className="text-sm text-gray-500">Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div
      className={cn(
        'm-2 md:m-6 grow bg-white rounded-xl pt-4 md:pt-6 gap-2 md:gap-3 flex flex-col relative',
        className
      )}
    >
      {/* Tablet & Mobile Sidebar Toggle Button - above MainHeader */}
      <div className="lg:hidden mb-4 px-4 flex items-center justify-between">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-lg bg-white border border-gray-300 shadow-sm"
        >
          <ListIcon size={20} />
        </button>
        {/* Mobile Timer */}
        {studySetting?.limit_time_by === 1 && (
          <div className="flex items-center gap-2 sm:hidden">
            <Timer size={20} color="#055BE6" />
            <TotalTimeCountDown />
          </div>
        )}
      </div>

      {/* Tablet & Mobile Sidebar Overlay - just hide Main component */}
      <div
        className={cn(
          'lg:hidden absolute inset-0 bg-black bg-opacity-50 z-[51] transition-opacity',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setIsSidebarOpen(false)}
      >
        <div
          className={cn(
            'absolute left-0 top-0 h-full w-72 bg-white transform transition-transform',
            isOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Sidebar onClose={() => setIsSidebarOpen(false)} isMobile={true} />
        </div>
      </div>

      <MainHeader />
      <QuizByCode />
      <Action />
    </div>
  )
}

export default memo(Main)
