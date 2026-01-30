import { QuizImageLabelAnswer } from '@/types/quiz-create'
import { useDraggable } from '@dnd-kit/core'
import { GripVertical } from 'lucide-react'

const Answer = ({ content, id, answerId }: Partial<QuizImageLabelAnswer>) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id as string,
    data: {
      type: 'answer',
      content,
      answerId
    }
  })

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    touchAction: 'none' as const // Prevent scroll while dragging
  }

  return (
    <div
      className="flex items-center gap-1 rounded-lg border border-solid border-[#D5D7DA] bg-white py-[10px] px-[14px] h-10 cursor-move"
      style={style}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
    >
      <GripVertical size={20} color="#414651" />
      <span className="font-semibold text-sm text-[#414651]">{content}</span>
    </div>
  )
}

export default Answer
