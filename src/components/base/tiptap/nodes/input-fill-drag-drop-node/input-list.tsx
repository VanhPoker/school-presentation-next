import { cn } from '@/lib/utils'
import { memo } from 'react'
import dynamic from 'next/dynamic'
import { InputChildProps } from './component'
const LatexEditor = dynamic(() => import('@/components/base/latex-editor'), {
  ssr: false
})

const InputList = ({ isTable, valueInput }: InputChildProps) => {
  return (
    <div className="flex items-center justify-center gap-2 h-full">
      <div className={cn(isTable ? 'min-w-20 w-full pl-1' : 'min-w-20 w-auto')}>
        <LatexEditor
          content={valueInput || ''}
          editable={false}
          className={cn(
            'text-center',
            isTable &&
              '[&_.ProseMirror]:overflow-hidden [&_.ProseMirror_p]:whitespace-nowrap'
          )}
          disableEnter={true}
        />
      </div>
    </div>
  )
}

export default memo(InputList)
