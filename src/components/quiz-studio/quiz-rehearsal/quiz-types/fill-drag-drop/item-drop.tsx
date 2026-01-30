import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { Drag_Type, Drop_Type, ItemChildProps } from '../matching/type'
import { QUIZ_CATEGORY_CODE } from '@/types/quiz-studio'
import { useEffect, useState } from 'react'
import { isEmpty } from 'lodash-es'
import ItemDrag from './item-drag'
import useDoQuiz from '../../_hooks/useDoQuiz'

const ItemDrop = ({
  item,
  code,
  borderStyle,
  handleEmitInputValue
}: ItemChildProps) => {
  const { attrs } = item
  const { id, item_drop, is_correct } = attrs
  const { isQuizPreview } = useDoQuiz()
  const [dropType, setDropType] = useState<string>(Drop_Type.empty)
  const { setNodeRef, isOver } = useDroppable({
    id: 'input-drop-zone-' + id,
    data: {
      id: id,
      type: dropType
    }
  })

  const handleChangeInputValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (handleEmitInputValue) {
      handleEmitInputValue(id, value)
    }
  }

  useEffect(() => {
    if (!isEmpty(item_drop)) {
      setDropType(Drop_Type.replace)
    } else {
      setDropType(Drop_Type.empty)
    }
  }, [item_drop])

  if (code === QUIZ_CATEGORY_CODE.FILL_IN_THE_BLANK) {
    return (
      <input
        id={id}
        className={cn(
          'px-2 py-0 rounded-lg text-md text-center bg-white border border-gray-300  mx-1 min-w-40 w-40 h-9 flex items-center justify-center focus-visible:outline-none transition-all',
          !isQuizPreview && is_correct === false && '!border-red-500 bg-red-50',
          !isQuizPreview &&
            is_correct === true &&
            '!border-green-500 bg-green-50'
        )}
        onChange={handleChangeInputValue}
      />
    )
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        `px-2 py-0 rounded-lg text-md text-center bg-white border border-gray-300 mx-1 min-w-40 h-9 flex items-center justify-center ${borderStyle} focus-visible:outline-none transition-all`,
        isOver && 'border-blue-500',
        !isQuizPreview && is_correct === false && '!border-red-500 bg-red-50',
        !isQuizPreview && is_correct === true && '!border-green-500 bg-green-50'
      )}
    >
      {!isEmpty(item_drop) && (
        <ItemDrag
          item={item_drop}
          drag_type={Drag_Type.out}
          editClass={'py-0 border-0 shadow-none w-full'}
        />
      )}
    </div>
  )
}

export default ItemDrop
