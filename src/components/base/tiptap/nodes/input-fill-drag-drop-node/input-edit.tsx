import { cn } from '@/lib/utils'
import { CornerDownLeftIcon, TrashIcon } from 'lucide-react'
import { memo } from 'react'
import dynamic from 'next/dynamic'
import { InputChildProps } from './component'
const LatexEditor = dynamic(() => import('@/components/base/latex-editor'), {
  ssr: false
})

const InputEdit = ({
  isTable,
  valueInput,
  latexValue,
  id,
  handleChangeInputValue,
  handleAddContentAnswer,
  handleNodeRemove
}: InputChildProps) => {
  return (
    <div className="flex items-center justify-center gap-2 h-full">
      <div className={cn(isTable ? 'min-w-20 w-full pl-1' : 'min-w-20 w-auto')}>
        <LatexEditor
          content={valueInput || ''}
          latexValue={latexValue}
          id={id}
          onChange={handleChangeInputValue}
          editable={true}
          className={cn(
            isTable
              ? '[&_.ProseMirror]:overflow-hidden [&_.ProseMirror_p]:whitespace-nowrap'
              : ''
          )}
          disableEnter={true}
        />
      </div>
      <div className="flex items-center justify-center transition-all relative translate-x-[0%] opacity-100 visible">
        <CornerDownLeftIcon
          size={20}
          className="transition-all bg-transparent cursor-pointer p-0.5 rounded-sm hover:bg-blue-900 hover:text-white"
          onClick={handleAddContentAnswer}
        />
        <TrashIcon
          size={20}
          className="transition-all bg-transparent cursor-pointer p-0.5 rounded-sm hover:bg-red-500 hover:text-white"
          onClick={handleNodeRemove}
        />
      </div>
    </div>
  )
}

export default memo(InputEdit)
