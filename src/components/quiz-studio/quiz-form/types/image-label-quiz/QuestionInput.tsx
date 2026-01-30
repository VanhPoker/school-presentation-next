'use client'

import { cn } from '@/lib/utils'
import QuizContentEditor from '@/components/studio/tools/quiz-studio-editor'
import { useQuizFormStudioStore } from '@/stores/use-quiz-studio-store'
import { useEffect, useState } from 'react'

const QuestionInput = () => {
  const { objQuizFormStudio, setObjQuizFormStudio } = useQuizFormStudioStore()
  const [content, setContent] = useState('')
  const [isHasContent, setIsHasContent] = useState(false)

  // Only set content once if it has value
  useEffect(() => {
    if (isHasContent) return
    if (objQuizFormStudio?.name) {
      setContent(objQuizFormStudio?.name || '')
      setIsHasContent(true)
    }
  }, [objQuizFormStudio?.name, isHasContent])

  return (
    <div
      className={cn(
        'h-[136px] border border-gray-300 rounded-xl text-xl w-full font-semibold overflow-y-auto bg-white hover:border-blue-600 outline-0 focus:border-blue-600 hover:shadow-lg break-words resize-none'
      )}
    >
      <QuizContentEditor
        handleContentChange={(value) => {
          setObjQuizFormStudio({
            ...objQuizFormStudio,
            name: value
          })
        }}
        content={content}
        placeholder="Nhập nội dung câu hỏi vào đây"
        placeHolderClassName="text-base text-[#717680] translate-x-0 left-[0px] w-full text-center"
      />
    </div>
  )
}

export default QuestionInput
