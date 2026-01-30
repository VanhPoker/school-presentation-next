import { cn } from '@/lib/utils'
import { GripVerticalIcon } from 'lucide-react'
import { memo } from 'react'
import dynamic from 'next/dynamic'
import { useDraggable } from '@dnd-kit/core'
const LatexEditor = dynamic(() => import('@/components/base/latex-editor'), {
  ssr: false
})

interface IProps {
  isTable?: boolean
  item: any
  dragType: string
}

const InputPractiseDragChild = ({ isTable, item, dragType }: IProps) => {
  const { id, content, dropId } = item
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'input-drag-' + id,
    data: {
      id: dropId ? dropId : id,
      type: dragType
    }
  })
  const style = {
    zIndex: transform ? 999 : 1,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined
  }
  return (
    <div
      className="flex items-center justify-center gap-2 relative group"
      style={style}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
    >
      <GripVerticalIcon
        className="absolute left-0 transition-all opacity-0 invisible group-hover:opacity-100 group-hover:visible cursor-move"
        size={20}
      />
      <div
        className={cn(
          'px-3',
          isTable ? 'min-w-20 w-full pl-1' : 'min-w-20 w-auto cursor-move'
        )}
      >
        <LatexEditor
          content={content || ''}
          editable={false}
          className={cn(
            'cursor-move',
            isTable &&
              '[&_.ProseMirror]:overflow-hidden [&_.ProseMirror_p]:whitespace-nowrap'
          )}
          disableEnter={true}
        />
      </div>
    </div>
  )
}

export default memo(InputPractiseDragChild)
