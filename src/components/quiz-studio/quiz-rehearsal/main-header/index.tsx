import { memo } from 'react'
import CountDown from '../count-down'
import { ZapIcon } from 'lucide-react'
import useDoQuiz from '../_hooks/useDoQuiz'
import QuizName from '../quiz-name'
import { useDoQuizStore } from '@/stores/use-do-quiz-store'
import { useShallow } from 'zustand/react/shallow'

const MainHeader = () => {
  const { activeQuestionCategoryName, activeQuestionPoint } = useDoQuiz()
  const { studySetting } = useDoQuizStore(
    useShallow((state) => ({
      studySetting: state.studySetting
    }))
  )

  return (
    <div className="flex flex-col gap-2 md:gap-3 max-h-[40%] md:items-start md:pl-6 lg:items-center lg:pl-0">
      <div className="flex flex-wrap items-center justify-center md:justify-start lg:justify-center gap-1 md:gap-2 w-full">
        <span className="text-xs whitespace-nowrap">
          {activeQuestionCategoryName}
        </span>
        <span className="border-[1px] border-[#D5D7DA] rounded-md px-[6px] py-[2px] whitespace-nowrap font-medium text-xs text-[#414651]">
          {activeQuestionPoint} điểm
        </span>
        {/* CountDown tablet/desktop */}
        {studySetting?.limit_time_by === 0 && (
          <span className="hidden md:block">
            <CountDown />
          </span>
        )}
        <div className="flex items-center gap-1 text-zinc-600 mx-2 md:mx-0">
          <ZapIcon size={20} color="#535862" />
          <span className="font-semibold text-sm text-[#535862]">Dễ</span>
        </div>
        {/* CountDown mobile */}
        {studySetting?.limit_time_by === 0 && (
          <span className="block md:hidden">
            <CountDown />
          </span>
        )}
      </div>
      <QuizName />
    </div>
  )
}

export default memo(MainHeader)
