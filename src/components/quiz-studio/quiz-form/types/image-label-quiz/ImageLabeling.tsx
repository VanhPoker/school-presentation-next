import { omit, uniqueId } from 'lodash-es'
import { useMemo, useRef } from 'react'
import { useCreateImageLabelingQuizStore } from '@/stores/use-create-image-labeling-quiz'
import CreatedLabel from './CreatedLabel'
import CurrentLabel from './CurrentLabel'
import { QuizImageLabel, QuizImageLabelAlignment } from '@/types/quiz-create'
import { useQuizFormStudioStore } from '@/stores/use-quiz-studio-store'
import { toast } from 'sonner'

type Props = {
  imageUrl: string
}

const ImageLabeling = ({ imageUrl }: Props) => {
  const container = useRef(null)
  const { createdLabels, currentLabel, wrongLabels } =
    useCreateImageLabelingQuizStore()
  const { objQuizFormStudio, setObjQuizFormStudio } = useQuizFormStudioStore()
  const notDeletedCreatedLabels = useMemo(
    () => createdLabels?.filter((item) => !item?.is_deleted),
    [createdLabels]
  )

  const handleClickContainer = (event: any) => {
    if (!container) return
    if (notDeletedCreatedLabels?.length >= 10) {
      toast.warning('Chỉ được tạo tối đa 10 nhãn dán đúng!')
      return
    }
    const containerEl = container.current as any
    const rect = containerEl.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    useCreateImageLabelingQuizStore.setState({
      currentLabel: {
        left: Math.round(x),
        top: Math.round(y),
        id: uniqueId(),
        value: '',
        alignment: QuizImageLabelAlignment.RIGHT,
        is_new: true
      },
      activeLabelId: 'current'
    })
  }

  const draggingItem = useRef<null | string>(null)
  const offset = useRef({ x: 0, y: 0 })

  const handleMouseDownLabel = (e: React.MouseEvent, id: string) => {
    // For current label
    if (id === 'current') {
      draggingItem.current = 'current'
      offset.current = {
        x: e.clientX - Number(currentLabel?.left),
        y: e.clientY - Number(currentLabel?.top)
      }
      return
    }

    // For created label
    const item = createdLabels.find((item) => item.id === id)
    if (!item) return
    draggingItem.current = id
    offset.current = {
      x: e.clientX - item.left,
      y: e.clientY - item.top
    }
  }

  const onMouseMove = (e: React.MouseEvent) => {
    // For current label
    if (draggingItem.current == 'current') {
      const newCurrentLabel = {
        ...currentLabel,
        left: Math.round(e.clientX - offset.current.x),
        top: Math.round(e.clientY - offset.current.y)
      } as QuizImageLabel
      useCreateImageLabelingQuizStore.setState({
        currentLabel: newCurrentLabel
      })
      return
    }

    // For created label
    if (draggingItem.current == null) return
    const newLabels = createdLabels?.map((item) => ({
      ...item,
      left:
        item.id === draggingItem.current
          ? Math.round(e.clientX - offset.current.x)
          : item?.left,
      top:
        item.id === draggingItem.current
          ? Math.round(e.clientY - offset.current.y)
          : item?.top
    }))

    useCreateImageLabelingQuizStore.setState({
      createdLabels: newLabels
    })
  }

  const onMouseUp = () => {
    draggingItem.current = null
    // Update to quiz form studio store
    const convertedLabels = createdLabels?.map((item) => {
      const obj = {
        id: item?.id,
        content: item?.value,
        left: item?.left,
        top: item?.top,
        alignment: item?.alignment,
        is_correct: true,
        is_deleted: item?.is_deleted,
        is_new: item?.is_new
      }
      if (item?.is_existed) return obj
      return omit(obj, 'id')
    })
    const convertedWrongLabels = wrongLabels?.map((item) => {
      const obj = {
        id: item?.id,
        content: item?.value,
        is_correct: false,
        is_deleted: item?.is_deleted,
        is_new: item?.is_new
      }
      if (item?.is_existed) return obj
      return omit(obj, 'id')
    })

    const answerPositions = convertedLabels
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

  return (
    <div
      ref={container}
      className="h-full relative bg-no-repeat bg-[center_center] bg-contain overflow-hidden"
      style={{ backgroundImage: `url(${imageUrl})` }}
      onClick={handleClickContainer}
      id="image-labeling"
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {currentLabel && <CurrentLabel handleMouseDown={handleMouseDownLabel} />}
      {notDeletedCreatedLabels?.map((item) => (
        <CreatedLabel
          key={item?.id}
          id={item?.id}
          position={{ left: item?.left, top: item?.top }}
          handleMouseDown={handleMouseDownLabel}
        />
      ))}
    </div>
  )
}

export default ImageLabeling
