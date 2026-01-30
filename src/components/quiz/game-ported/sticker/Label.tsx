import { cn } from '@/lib/utils'
import {
  QuizImageLabelAlignment,
  QuizImageLabelAnswer
} from '@/types/quiz-create'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { GripVertical } from 'lucide-react'

const Label = ({
  id,
  content,
  left,
  top,
  alignment,
  answerId,
  isCorrect,
  isError
}: QuizImageLabelAnswer) => {
  const { setNodeRef: setNodeDroppableRef, isOver } = useDroppable({
    id: id as string,
    data: {
      type: 'label',
      content,
      answerId
    }
  })
  const {
    setNodeRef: setNodeDraggableRef,
    attributes,
    listeners,
    transform,
    isDragging,
    active
  } = useDraggable({
    id: id as string,
    data: {
      type: 'label',
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

  const renderContent = () => {
    if (content) {
      return (
        <div
          className={cn(
            'flex items-center justify-center gap-1 rounded-lg border border-solid border-[#D5D7DA] bg-white py-[10px] px-[14px] h-10 cursor-move',
            {
              'border-[#F04438]': isError,
              'border-[#17B26A]': isCorrect
            }
          )}
          ref={setNodeDraggableRef}
          {...listeners}
          {...attributes}
          style={style}
        >
          <GripVertical size={20} color="#414651" />
          <span className="font-semibold text-sm text-[#414651]">
            {content}
          </span>
        </div>
      )
    }
    return (
      <div
        className={cn(
          'min-w-[90px] md:min-w-[180px] h-10 border-2 border-dotted border-[#D5D7DA] rounded-lg bg-white'
        )}
      />
    )
  }

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        zIndex: active?.id === id ? 1 : 'unset'
      }}
    >
      <div
        className={cn('flex items-center', {
          '-translate-x-full -translate-y-2/4 flex-row-reverse':
            alignment === QuizImageLabelAlignment.LEFT,
          '-translate-y-2/4': alignment === QuizImageLabelAlignment.RIGHT,
          'flex-col -translate-x-2/4':
            alignment === QuizImageLabelAlignment.BOTTOM,
          'flex-col-reverse -translate-x-2/4 -translate-y-full':
            alignment === QuizImageLabelAlignment.TOP
        })}
      >
        <span className="bg-white w-3 h-3 rounded-full border-2 border-solid border-[#0D67F7]" />
        <span
          className={cn('inline-block w-[2px] h-4 bg-[#0D67F7]', {
            'w-[2px] h-4':
              alignment === QuizImageLabelAlignment.BOTTOM ||
              alignment === QuizImageLabelAlignment.TOP,
            'w-4 h-[2px]':
              alignment === QuizImageLabelAlignment.LEFT ||
              alignment === QuizImageLabelAlignment.RIGHT
          })}
        />

        <div
          ref={setNodeDroppableRef}
          className={cn('relative', {
            'opacity-70': isOver
          })}
        >
          {renderContent()}
          {isDragging && (
            <div
              className={cn(
                'rounded-lg border-2 border-dotted border-[#D5D7DA] bg-white py-[10px] px-[14px] h-10 absolute left-0 top-0 w-full z-[-1]',
                {
                  'opacity-70': isDragging
                }
              )}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Label
