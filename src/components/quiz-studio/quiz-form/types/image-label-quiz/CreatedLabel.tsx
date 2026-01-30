import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useCreateImageLabelingQuizStore } from '@/stores/use-create-image-labeling-quiz'
import { useQuizFormStudioStore } from '@/stores/use-quiz-studio-store'
import { QuizImageLabel, QuizImageLabelAlignment } from '@/types/quiz-create'
import { omit } from 'lodash-es'
import { CornerDownLeft, Trash } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

type Position = {
  top: number
  left: number
}

type Props = {
  id: string
  position?: Position
  handleMouseDown?: any
}

const CreatedLabel = ({ id, position, handleMouseDown }: Props) => {
  const { createdLabels, wrongLabels, activeLabelId } =
    useCreateImageLabelingQuizStore()
  const [labels, setLabels] = useState<QuizImageLabel[]>([])
  const [isUpdated, setIsUpdated] = useState(false)
  const inputRef = useRef(null)
  const { objQuizFormStudio, setObjQuizFormStudio } = useQuizFormStudioStore()

  const labelAlignment = useMemo(() => {
    // If the label is active
    if (activeLabelId === id) {
      const target = createdLabels?.find((item) => item?.id === activeLabelId)
      return target?.alignment
    }
    // Get alignment value of created label
    const target = createdLabels?.find((item) => item?.id === id)
    return target?.alignment
  }, [activeLabelId, createdLabels, id])

  const labelInputValue = useMemo(
    () => labels?.find((box) => box?.id === id)?.value || '',
    [labels]
  )

  const allLabelValues = useMemo(() => {
    const createdLabelNames = createdLabels
      ?.filter((item) => !item?.is_deleted)
      ?.map((item) => item?.value)
    const wrongLabelNames = wrongLabels
      ?.filter((item) => !item?.is_deleted)
      ?.map((item) => item?.value)
    return [...createdLabelNames, ...wrongLabelNames]
  }, [createdLabels, wrongLabels])

  const handleClickCreatedLabel = (event: any) => {
    event.stopPropagation()
    useCreateImageLabelingQuizStore.setState({
      currentLabel: undefined,
      activeLabelId: id
    })
  }

  const handleUpdateLabel = () => {
    const inputRefCurrent = inputRef?.current as any
    const hasEmptyStringLabel = labels
      ?.map((item) => item?.value)
      ?.some((value) => value === '')
    if (hasEmptyStringLabel) {
      useCreateImageLabelingQuizStore.setState({
        activeLabelId: ''
      })
      inputRefCurrent?.blur()
      return
    }
    if (labels?.every((item) => allLabelValues?.includes(item?.value))) {
      toast.warning('Nhãn này đã tồn tại, vui lòng nhập nhãn khác!')
      useCreateImageLabelingQuizStore.setState({
        activeLabelId: ''
      })
      inputRefCurrent?.blur()
      return
    }
    useCreateImageLabelingQuizStore.setState({
      createdLabels: labels,
      activeLabelId: ''
    })
    setIsUpdated(true)
    handleUpdateToQuizStudio(labels)
    inputRefCurrent?.blur()
  }

  const handleChangeCreatedLabel =
    (labelId: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target
      const newLabels = labels.map((item) => ({
        ...item,
        value: item.id === labelId ? value : item?.value
      }))
      setLabels(newLabels)
    }

  const handleBlurCreatedLabel = () => {
    if (isUpdated) {
      setIsUpdated(false)
    } else {
      setLabels(createdLabels)
    }
  }

  const handleRemoveCreatedLabel =
    (labelId: string) => (event: React.MouseEvent) => {
      event.stopPropagation()
      const newLabels = createdLabels?.map((item) =>
        item?.id === labelId ? { ...item, is_deleted: true } : item
      )
      useCreateImageLabelingQuizStore.setState({
        createdLabels: newLabels
      })
      setLabels(newLabels)
      handleUpdateToQuizStudio(newLabels)
    }

  const handleUpdateToQuizStudio = (labels: QuizImageLabel[]) => {
    const convertedLabels = labels?.map((item) => {
      const obj = {
        id: item?.id,
        content: item?.value,
        left: item?.left,
        top: item?.top,
        alignment: item?.alignment,
        is_correct: true,
        is_new: item?.is_new,
        is_deleted: Boolean(item?.is_deleted)
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
        is_deleted: Boolean(item?.is_deleted)
      }
      if (item?.is_existed) return obj
      return omit(obj, 'id')
    })
    const answerPositions = labels
      ?.filter((item) => !item?.is_deleted)
      ?.map((item) => ({
        left: item?.left,
        top: item?.top,
        alignment: item?.alignment
      }))
    setObjQuizFormStudio({
      ...objQuizFormStudio,
      answer_positions: JSON.stringify(answerPositions),
      questions_hotspots: {
        data: [...convertedLabels, ...convertedWrongLabels]
      }
    })
  }

  // Sync local labels with created labels
  useEffect(() => setLabels(createdLabels), [createdLabels])

  return (
    <div
      onMouseDown={(e) => handleMouseDown(e, id)}
      style={{
        transform: `translate(${position?.left}px, ${position?.top}px)`,
        position: 'absolute'
      }}
    >
      <div
        className={cn('flex items-center min-w-[224px] group', {
          '-translate-x-full -translate-y-2/4 flex-row-reverse':
            labelAlignment === QuizImageLabelAlignment.LEFT,
          '-translate-y-2/4': labelAlignment === QuizImageLabelAlignment.RIGHT,
          'flex-col -translate-x-2/4':
            labelAlignment === QuizImageLabelAlignment.BOTTOM,
          'flex-col-reverse -translate-x-2/4 -translate-y-full':
            labelAlignment === QuizImageLabelAlignment.TOP
        })}
      >
        <span
          className="bg-white w-3 h-3 rounded-full border-2 border-solid border-[#0D67F7] cursor-move"
          onClick={handleClickCreatedLabel}
        />
        <span
          className={cn('inline-block w-[2px] h-4 bg-[#0D67F7] cursor-move', {
            'w-[2px] h-4':
              labelAlignment === QuizImageLabelAlignment.BOTTOM ||
              labelAlignment === QuizImageLabelAlignment.TOP,
            'w-4 h-[2px]':
              labelAlignment === QuizImageLabelAlignment.LEFT ||
              labelAlignment === QuizImageLabelAlignment.RIGHT
          })}
          onClick={handleClickCreatedLabel}
        />

        <span
          className="relative group-hover:after:content-[''] group-hover:after:absolute group-hover:after:w-[1px] group-hover:after:h-[19px] group-hover:after:bg-[#181D27] group-hover:after:right-[36px] group-hover:after:top-[11px]"
          onClick={handleClickCreatedLabel}
        >
          <Input
            placeholder="Thêm nhãn"
            className="relative max-w-[172px] !border-[#2D7CFB] border-[2px] rounded-lg bg-white group-hover:pr-[45px] !text-base"
            value={labelInputValue}
            onChange={handleChangeCreatedLabel(id)}
            onKeyDown={(event) => event.key === 'Enter' && handleUpdateLabel()}
            onClick={() =>
              useCreateImageLabelingQuizStore.setState({
                activeLabelId: id
              })
            }
            ref={inputRef}
            id="exclude"
            onBlur={handleBlurCreatedLabel}
          />
          <CornerDownLeft
            className="absolute right-[10px] top-[12px] cursor-pointer hidden group-hover:block"
            color="#535862"
            size={16}
            onClick={handleUpdateLabel}
          />
        </span>
        <Trash
          color="#B42318"
          size={16}
          className={cn('cursor-pointer hidden group-hover:block', {
            'mt-2': labelAlignment === QuizImageLabelAlignment.BOTTOM,
            'mb-2': labelAlignment === QuizImageLabelAlignment.TOP,
            'mr-2': labelAlignment === QuizImageLabelAlignment.LEFT,
            'ml-2': labelAlignment === QuizImageLabelAlignment.RIGHT
          })}
          onClick={handleRemoveCreatedLabel(id)}
        />
      </div>
    </div>
  )
}

export default CreatedLabel
