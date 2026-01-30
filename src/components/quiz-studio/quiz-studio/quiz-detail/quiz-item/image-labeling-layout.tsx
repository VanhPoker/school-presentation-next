import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { QuizImageLabel } from '@/types/quiz-create'
import { AnyExtension, EditorContent, useEditor } from '@tiptap/react'
import { useMemo } from 'react'
import StarterKit from '@tiptap/starter-kit'
import { MathInline } from '@/components/admin/admin-create-content-lesson/components/editor-content-lesson/extensions/extension-math'
import { Heading } from '@/components/admin/admin-create-content-lesson/components/editor-content-lesson/extensions/extension-heading'

type Props = {
  imageUrl: string
  question: string
  answers: QuizImageLabel[]
  originMediaWidth: number
  showCorrectAnswers?: boolean
  imageContainerWidth?: number
}

const ImageLabelingLayout = ({
  imageUrl,
  question,
  answers,
  originMediaWidth,
  showCorrectAnswers,
  imageContainerWidth = 240
}: Props) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }) as AnyExtension,
      Heading,
      MathInline
    ],
    content: question,
    editable: false
  })

  const orderAnswers = useMemo(() => {
    const wrongAnswer = answers?.filter((item) => !item?.is_correct)
    const rightAnswer = answers?.filter((item) => item?.is_correct)
    const newAnswer = [...rightAnswer, ...wrongAnswer]?.map((item, index) => ({
      ...item,
      order: index + 1
    }))
    return newAnswer
  }, [answers])

  const rightOrderAnser = useMemo(
    () => orderAnswers?.filter((item) => item?.is_correct),
    [orderAnswers]
  )

  const ratio = useMemo(
    () => originMediaWidth / imageContainerWidth,
    [originMediaWidth, imageContainerWidth]
  )

  return (
    <div>
      <EditorContent
        editor={editor}
        className="[&>*]:!p-0 [&>*]:!min-h-0 [&>*]:!max-w-none font-semibold px-4 py-3 rounded-lg bg-[#FAFAFA] mb-4"
      />
      <div
        className="relative border border-solid border-[#D5D7DA] rounded-lg aspect-[4_/_3] bg-no-repeat bg-[center_center] bg-contain mb-4 shrink-0"
        style={{
          backgroundImage: `url('${imageUrl}')`,
          width: imageContainerWidth
        }}
      >
        {rightOrderAnser?.map((item) => (
          <span
            key={item?.id}
            className="absolute w-[35px] h-8 border border-solid border-[#D5D7DA] rounded-lg flex items-center justify-center text-[#181D27] -translate-x-2/4 -translate-y-2/4 bg-white"
            style={{
              left: Math.round(item?.left / ratio),
              top: Math.round(item?.top / ratio)
            }}
          >
            {item?.order}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-y-[20px]">
        {orderAnswers?.map((item) => (
          <div key={item?.id} className="flex items-center gap-4">
            <Checkbox
              className={cn(
                'items-center justify-center !w-4 !h-4 focus:outline-none appearance-none text-white !rounded-md border !bg-white',
                showCorrectAnswers && 'border-none',
                showCorrectAnswers && item?.is_correct && '!bg-[#0D67F7]',
                showCorrectAnswers && !item?.is_correct && '!bg-[#D92D20]'
              )}
              checked={showCorrectAnswers}
              isCorrect={showCorrectAnswers ? item?.is_correct : undefined}
            />

            <span>{`${item?.order}. ${item?.content}`}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ImageLabelingLayout
