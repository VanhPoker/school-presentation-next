import { useQuizFormStudioStore } from '@/stores/use-quiz-studio-store'
import { memo } from 'react'
import { handleRenderInputColor } from '@/components/quiz-studio/quiz-service'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'
const LatexEditor = dynamic(() => import('@/components/base/latex-editor'), {
  ssr: false
})

const FillAragAnswers = () => {
  const { arrayQuizzAnswers } = useQuizFormStudioStore()

  return (
    <div className="text-sm bg-white p-4 rounded-xl flex flex-col mb-6">
      <span className="uppercase">câu trả lời</span>
      {arrayQuizzAnswers.length > 0 && (
        <div className="mt-4 flex flex-wrap items-start justify-center">
          {arrayQuizzAnswers
            .filter((x) => {
              return !x.is_deleted
            })
            .map((x, i) => {
              const { content } = x
              return (
                <div
                  key={i + 1}
                  className={cn(
                    `flex items-center justify-start rounded-lg transition-all duration-150 border-2`,
                    `h-9 px-2 py-1 mx-1 my-1 text-sm min-w-40`
                  )}
                  style={{ borderColor: handleRenderInputColor(i) }}
                >
                  <LatexEditor content={content || ''} />
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}

export default memo(FillAragAnswers)
