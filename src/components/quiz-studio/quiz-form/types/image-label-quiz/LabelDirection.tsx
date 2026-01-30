import { cn } from '@/lib/utils'
import { useCreateImageLabelingQuizStore } from '@/stores/use-create-image-labeling-quiz'
import { useQuizFormStudioStore } from '@/stores/use-quiz-studio-store'
import { QuizImageLabel, QuizImageLabelAlignment } from '@/types/quiz-create'
import { omit } from 'lodash-es'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react'
import { useMemo } from 'react'

const LabelDirection = () => {
  const { activeLabelId, currentLabel, createdLabels, wrongLabels } =
    useCreateImageLabelingQuizStore()
  const { objQuizFormStudio, setObjQuizFormStudio } = useQuizFormStudioStore()

  const alignmentValue = useMemo(() => {
    if (!activeLabelId) return QuizImageLabelAlignment.RIGHT
    if (activeLabelId === 'current') return currentLabel?.alignment
    const target = createdLabels?.find((item) => item?.id === activeLabelId)
    return target?.alignment
  }, [activeLabelId, currentLabel, createdLabels])

  const handleUpdateLabelAlignment = (value: QuizImageLabelAlignment) => () => {
    if (!activeLabelId) return
    // For current label
    if (activeLabelId === 'current') {
      const newCurrentLabel = {
        ...currentLabel,
        alignment: value
      } as QuizImageLabel
      useCreateImageLabelingQuizStore.setState({
        currentLabel: newCurrentLabel
      })
      return
    }
    // For created label
    const newCreatedLabels = createdLabels.map((item) => ({
      ...item,
      alignment: item.id === activeLabelId ? value : item?.alignment
    })) as QuizImageLabel[]
    useCreateImageLabelingQuizStore.setState({
      createdLabels: newCreatedLabels
    })

    // Update to quiz form studio
    const convertedLabels = newCreatedLabels?.map((item) => {
      const obj = {
        id: item?.id,
        content: item?.value,
        left: item?.left,
        top: item?.top,
        alignment: item?.alignment,
        is_correct: true,
        is_new: item?.is_new,
        is_deleted: item?.is_deleted
      }
      if (item?.is_existed) return obj
      return omit(obj, 'id')
    })
    const convertedWrongLabels = wrongLabels?.map((item) => {
      const obj = {
        id: item?.id,
        content: item?.value,
        is_correct: false,
        is_new: item?.is_new,
        is_deleted: item?.is_deleted
      }
      if (item?.is_existed) return obj
      return omit(obj, 'id')
    })
    setObjQuizFormStudio({
      ...objQuizFormStudio,
      questions_hotspots: {
        data: [...convertedLabels, ...convertedWrongLabels]
      }
    })
  }

  return (
    <div className="flex items-center gap-4">
      <h4 className="mr-auto text-[#181D27] font-semibold text-lg">
        Hướng nhãn dán:
      </h4>
      <div className="flex bg-white border-r-[#D5D7DA] border border-solid rounded-lg">
        <span
          className={cn(
            'py-2 px-3 border-r-[#D5D7DA] border-r border-solid cursor-pointer label-direction',
            {
              'bg-[#F0F6FE]': alignmentValue === QuizImageLabelAlignment.LEFT
            }
          )}
          onClick={handleUpdateLabelAlignment(QuizImageLabelAlignment.LEFT)}
        >
          <ArrowLeft
            size={20}
            color={
              alignmentValue === QuizImageLabelAlignment.LEFT
                ? '#0D67F7'
                : '#414651'
            }
          />
        </span>
        <span
          className={cn(
            'py-2 px-3 border-r-[#D5D7DA] border-r border-solid cursor-pointer label-direction',
            {
              'bg-[#F0F6FE]': alignmentValue === QuizImageLabelAlignment.RIGHT
            }
          )}
          onClick={handleUpdateLabelAlignment(QuizImageLabelAlignment.RIGHT)}
        >
          <ArrowRight
            size={20}
            color={
              alignmentValue === QuizImageLabelAlignment.RIGHT
                ? '#0D67F7'
                : '#414651'
            }
          />
        </span>
        <span
          className={cn(
            'py-2 px-3 border-r-[#D5D7DA] border-r border-solid cursor-pointer label-direction',
            {
              'bg-[#F0F6FE]': alignmentValue === QuizImageLabelAlignment.BOTTOM
            }
          )}
          onClick={handleUpdateLabelAlignment(QuizImageLabelAlignment.BOTTOM)}
        >
          <ArrowDown
            size={20}
            color={
              alignmentValue === QuizImageLabelAlignment.BOTTOM
                ? '#0D67F7'
                : '#414651'
            }
          />
        </span>
        <span
          className={cn('py-2 px-3 cursor-pointer label-direction', {
            'bg-[#F0F6FE]': alignmentValue === QuizImageLabelAlignment.TOP
          })}
          onClick={handleUpdateLabelAlignment(QuizImageLabelAlignment.TOP)}
        >
          <ArrowUp
            size={20}
            color={
              alignmentValue === QuizImageLabelAlignment.TOP
                ? '#0D67F7'
                : '#414651'
            }
          />
        </span>
      </div>
    </div>
  )
}

export default LabelDirection
