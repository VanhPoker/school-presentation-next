import { cn } from '@/lib/utils'
import { memo } from 'react'
import dynamic from 'next/dynamic'
import { InputChildProps } from './component'
const LatexEditor = dynamic(() => import('@/components/base/latex-editor'), {
  ssr: false
})

const InputPractiseFill = ({
  isTable,
  valueInput,
  handleChangeInputValue
}: InputChildProps) => {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className={cn(isTable ? 'min-w-20 w-full pl-1' : 'min-w-40 w-auto')}>
        <LatexEditor
          content={valueInput || ''}
          onChange={handleChangeInputValue}
          editable={true}
          className={cn(
            isTable &&
              '[&_.ProseMirror]:overflow-hidden [&_.ProseMirror_p]:whitespace-nowrap'
          )}
          disableEnter={true}
        />
      </div>
    </div>
  )
}

export default memo(InputPractiseFill)
