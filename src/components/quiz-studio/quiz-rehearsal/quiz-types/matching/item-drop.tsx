import { useDroppable } from '@dnd-kit/core'
import { Drag_Type, Drop_Type, ItemChildProps } from './type'
import { cn } from '@/lib/utils'
import ItemDrag from './item-drag'
import { isEmpty } from 'lodash-es'
import { memo, useEffect, useState } from 'react'

const ItemDrop = ({
  item,
  borderColor,
  handleCheckAfterDrop,
  dragHeight
}: ItemChildProps) => {
  const [drop_type, set_drop_type] = useState<string>(Drop_Type.empty)
  const { id, item_drop } = item
  const { setNodeRef, isOver } = useDroppable({
    id: 'drop-zone-' + id,
    data: {
      id: id,
      type: drop_type
    }
  })

  useEffect(() => {
    if (!isEmpty(item_drop)) {
      set_drop_type(Drop_Type.replace)
      if (!isEmpty(item_drop.content)) {
        if (handleCheckAfterDrop) handleCheckAfterDrop(0)
      }
    } else {
      set_drop_type(Drop_Type.empty)
      if (handleCheckAfterDrop) handleCheckAfterDrop(0)
    }
  }, [item_drop])

  return (
    <>
      {!isEmpty(item_drop) ? (
        <div
          ref={setNodeRef}
          className={cn(
            'item_drop_sticky absolute top-0 right-[-99%] w-full h-full rounded-xl border-l-0 transition-all z-[2]',
            'flex items-center',
            isOver
              ? 'border-2 border-dashed border-l-gray-300 border-gray-300 bg-gray-50'
              : 'border-0'
          )}
        >
          <div className={cn('relative w-full h-full')}>
            <ItemDrag
              item={item_drop}
              drag_type={Drag_Type.out}
              is_sticky={true}
              borderColor={borderColor}
              handleCheckAfterDrop={(value) => {
                if (handleCheckAfterDrop) handleCheckAfterDrop(value)
              }}
              style={
                dragHeight
                  ? {
                      height: `${dragHeight}px`,
                      transition: 'height 0.3s ease'
                    }
                  : {}
              }
            />
            <div
              className={cn(
                'item-drop absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-7 rounded-s-lg border-2 !border-r-transparent border-gray-300 bg-gray-50 transition-all',
                isOver ? 'opacity-100 visible' : 'opacity-0 invisible'
              )}
            ></div>
          </div>
        </div>
      ) : (
        <div
          ref={setNodeRef}
          className={cn(
            'item_drop absolute top-0 right-[-99%] w-full h-full rounded-xl border-l-0 transition-all',
            'border-2 border-dashed border-l-gray-300 border-gray-300 bg-gray-50',
            isOver ? 'opacity-100 visible' : 'opacity-0 invisible'
          )}
        >
          <div className=" relative w-full h-full">
            <div
              className={cn(
                'item-overlay absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-7 rounded-s-lg border-2 !border-r-transparent border-gray-300 bg-gray-50 transition-all'
              )}
            ></div>
          </div>
        </div>
      )}
    </>
  )
}

export default memo(ItemDrop)
