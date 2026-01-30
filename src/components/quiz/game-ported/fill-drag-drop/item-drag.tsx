import { cn } from '@/lib/utils'
import { GripVerticalIcon } from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'
import { ItemChildProps } from '../matching/type'
import { memo } from 'react'
import dynamic from 'next/dynamic'
const LatexEditor = dynamic(() => import('@/components/base/latex-editor'), {
  ssr: false
})

const ItemDrag = ({ item, drag_type, editClass }: ItemChildProps) => {
  const { id, content, is_disabled, dropId } = item
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'input-drag-' + id,
    data: {
      id: dropId ? dropId : id,
      type: drag_type
    }
  })

  const style = {
    zIndex: transform ? 4 : 1,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined
  }

  return (
    <div
      className={cn(
        `flex items-center justify-center gap-2 border px-3 py-1 shadow-sm rounded-lg cursor-move bg-white overflow-hidden opacity-100 visible ${editClass}`,
        is_disabled && 'transition-all opacity-0 invisible'
      )}
      style={style}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
    >
      <GripVerticalIcon size={20} />
      {content && <LatexEditor content={content} className={'cursor-move'} />}
      {/* <span className="whitespace-nowrap">{content}</span> */}
    </div>
  )
}

export default memo(ItemDrag)
