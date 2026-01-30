import { cn } from '@/lib/utils'
import { useDoQuizStore } from '@/stores/use-do-quiz-store'
import { memo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import Render from './render'

type QuizByCodeProps = {
  className?: string
}

const QuizByCode = ({ className }: QuizByCodeProps) => {
  const { questions, activeQuestionId } = useDoQuizStore(
    useShallow((state) => ({
      questions: state.questions,
      activeQuestionId: state.activeQuestionId
    }))
  )

  return (
    <div className={cn(className, 'grow overflow-hidden relative')}>
      {questions?.map((item) => (
        <Render
          key={item?.id}
          questionId={item?.id}
          categoryCode={item?.categoryCode}
          isActive={item?.id === activeQuestionId}
          previewProps={item?.previewProps}
        />
      ))}
    </div>
  )
}

export default memo(QuizByCode)
