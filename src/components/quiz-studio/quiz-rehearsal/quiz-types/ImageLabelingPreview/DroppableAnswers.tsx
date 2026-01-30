import { QuizImageLabelAnswer } from '@/types/quiz-create'
import Answer from './Answer'
import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'

type Props = {
  answers: QuizImageLabelAnswer[]
}

const DroppableAnswers = ({ answers }: Props) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'droppable-answers',
    data: {
      type: 'answer',
      content: 'droppable-answers'
    }
  })
  return (
    <div
      className={cn(
        'flex justify-center gap-4 pt-7 pb-6 border-t-[#E9EAEB] border-t border-solid flex-wrap',
        {
          'opacity-50': isOver
        }
      )}
      ref={setNodeRef}
    >
      {answers?.map((item) => (
        <Answer
          key={item?.id}
          content={item?.content}
          id={item?.id}
          answerId={item?.answerId}
        />
      ))}
    </div>
  )
}

export default DroppableAnswers
