import ExampleItemByType from '@/components/admin/admin-create-content-lesson/components/editor-content-lesson/nodes/example/ExampleItemByType'
import { cn } from '@/lib/utils'
import { AnswersLayoutType, QuestionLayoutType } from '@/types/material/type'
import { useState } from 'react'

type QuizLayoutProps = {
  data: { id: string }[]
  answersLayout?: AnswersLayoutType
  questionLayout?: QuestionLayoutType
  textColor?: string
  backgroundColor?: string
  isPratice: boolean
  isPreview: boolean
}
export default function QuizLayout({
  data,
  questionLayout = QuestionLayoutType.LIST,
  answersLayout = AnswersLayoutType.ONE_COLUMN,
  isPreview,
  isPratice,
  textColor,
  backgroundColor
}: QuizLayoutProps) {
  const [selectedQuizIndex, setSeletecQuizIndex] = useState(0)
  return (
    <div className="flex flex-col gap-12 flex-1 rounded-lg pt-3">
      {questionLayout === QuestionLayoutType.PAGINATION && (
        <div className="flex gap-1 justify-center overflow-x-auto py-1 px-4">
          {Array.from({ length: data.length }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={cn(
                'w-10 h-10 rounded-lg text-black text-sm bg-white shadow',
                i === selectedQuizIndex ? 'bg-[#20447E] text-white' : ''
              )}
              onClick={(e) => {
                e.stopPropagation()
                if (i === selectedQuizIndex) return
                setSeletecQuizIndex(i)
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
      {questionLayout === QuestionLayoutType.LIST
        ? data.map((quiz) => {
            const { id } = quiz
            return (
              <ExampleItemByType
                answersLayout={answersLayout}
                key={`${id}-${questionLayout}`}
                id={id}
                isPratice={isPratice}
                isPreview={isPreview}
                textColor={textColor}
                backgroundColor={backgroundColor}
              />
            )
          })
        : null}
      {questionLayout === QuestionLayoutType.PAGINATION &&
      data[selectedQuizIndex] ? (
        <ExampleItemByType
          textColor={textColor}
          backgroundColor={backgroundColor}
          answersLayout={answersLayout}
          isPreview={isPreview}
          isPratice={isPratice}
          id={data[selectedQuizIndex].id}
          key={`${data[selectedQuizIndex].id}-${questionLayout}`}
        />
      ) : null}
    </div>
  )
}
