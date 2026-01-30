import { QuizImageLabel, QuizImageLabelAnswer } from '@/types/quiz-create'
import { useEffect, useRef, useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import DroppableAnswers from './DroppableAnswers'
import Label from './Label'
import { isArray, uniqueId, isNumber } from 'lodash-es'
import { cn } from '@/lib/utils'

type Props = {
  imageUrl: string
  questionsHotpots: QuizImageLabel[]
  originMediaWidth: number
  answerPositions: string
  onChange?: (labels: QuizImageLabelAnswer[]) => void
  containerClass?: string
  results?: Record<string, any>
}

const ImageLabelingPreview = ({
  imageUrl,
  questionsHotpots,
  originMediaWidth,
  answerPositions,
  onChange,
  containerClass,
  results
}: Props) => {
  const container = useRef(null)
  const [ratio, setRatio] = useState(1)
  const [answers, setAnswers] = useState<QuizImageLabelAnswer[]>([])
  const [labels, setLabels] = useState<QuizImageLabelAnswer[]>([])

  const getIsCorrectAnswer = (answerId: string) => {
    const isCorrect = results?.find(
      (item: any) => item?.hotspots_id === answerId
    )?.is_correct
    return isCorrect
  }
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5
      }
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    // Drag from answer to label
    if (
      active?.data?.current?.type === 'answer' &&
      over?.data?.current?.type === 'label'
    ) {
      if (over?.data?.current?.content) {
        const newAnswers = answers?.map((item) =>
          item?.id === active?.id
            ? {
                ...item,
                answerId: over?.data?.current?.answerId,
                content: over?.data?.current?.content
              }
            : item
        )
        const newLabels = labels?.map((item) =>
          item?.id === over?.id
            ? {
                ...item,
                answerId: active?.data?.current?.answerId,
                content: active?.data?.current?.content
              }
            : item
        )
        setAnswers(newAnswers)
        setLabels(newLabels)
        handleOnChangeProp(newLabels)
      } else {
        const newAnswers = answers?.filter((item) => item?.id !== active?.id)
        const newLabels = labels?.map((item) =>
          item?.id === over?.id
            ? {
                ...item,
                answerId: active?.data?.current?.answerId,
                content: active?.data?.current?.content
              }
            : item
        )
        setAnswers(newAnswers)
        setLabels(newLabels)
        handleOnChangeProp(newLabels)
      }
      return
    }

    // Drag from label to answer
    if (
      active?.data?.current?.type === 'label' &&
      over?.data?.current?.type === 'answer'
    ) {
      const newLabels = labels?.map((item) =>
        item?.id === active?.id ? { ...item, content: '', answerId: '' } : item
      )
      const newAnswers = [
        ...answers,
        {
          id: uniqueId(),
          content: active?.data?.current?.content,
          answerId: active?.data?.current?.answerId
        }
      ]
      setAnswers(newAnswers)
      setLabels(newLabels)
      handleOnChangeProp(newLabels)
      return
    }

    // Drag and drop between labels
    if (
      active?.data?.current?.type === 'label' &&
      over?.data?.current?.type === 'label'
    ) {
      const newLabels = labels?.map((item) => {
        if (item?.id === active?.id) {
          return {
            ...item,
            content: over?.data?.current?.content,
            answerId: over?.data?.current?.answerId
          }
        }
        if (item?.id === over?.id) {
          return {
            ...item,
            content: active?.data?.current?.content,
            answerId: active?.data?.current?.answerId
          }
        }
        return item
      })
      setLabels(newLabels)
      handleOnChangeProp(newLabels)
      return
    }
  }

  const handleOnChangeProp = (labels: QuizImageLabelAnswer[]) => {
    if (onChange) {
      const payload = labels?.map((item) => ({
        left: item?.left,
        top: item?.top,
        alignment: item?.alignment,
        hotspotsId: item?.answerId
      }))
      onChange?.(payload)
    }
  }

  useEffect(() => {
    if (!container || !isNumber(originMediaWidth)) return
    const updateRatio = () => {
      const containerEl = container?.current as any
      const newRatio = originMediaWidth / containerEl?.offsetWidth
      setRatio(newRatio)
    }
    updateRatio()
    window.addEventListener('resize', updateRatio)
    return () => window.removeEventListener('resize', updateRatio)
  })

  useEffect(() => {
    // init labels
    let convertedLabels = []
    try {
      const parsed = JSON.parse(answerPositions || '')
      convertedLabels = isArray(parsed) ? parsed : []
    } catch (error) {
      console.error(error)
    }
    convertedLabels = convertedLabels?.map((item: QuizImageLabelAnswer) => ({
      id: uniqueId(),
      left: item?.left,
      top: item?.top,
      alignment: item?.alignment,
      content: '',
      answerId: ''
    }))
    setLabels(convertedLabels)

    // Init answers
    const convertedAnswers = questionsHotpots?.map((item) => ({
      id: uniqueId(),
      content: item?.content,
      answerId: item?.id
    }))
    setAnswers(convertedAnswers)
  }, [questionsHotpots, answerPositions])

  return (
    <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
      <div className={cn('flex flex-col gap-7', containerClass)}>
        <div className="max-h-full max-w-full">
          <div
            ref={container}
            className="aspect-[4_/_3] relative bg-no-repeat bg-[center_center] bg-contain mx-auto max-w-full max-h-full"
            style={{ backgroundImage: `url(${imageUrl})` }}
          >
            {labels?.map((item) => (
              <Label
                key={item?.id}
                id={item?.id as string}
                content={item?.content as string}
                left={Number(item?.left) / ratio}
                top={Number(item?.top) / ratio}
                alignment={item?.alignment}
                answerId={item?.answerId}
                isError={getIsCorrectAnswer(item?.answerId || '') === false}
                isCorrect={getIsCorrectAnswer(item?.answerId || '') === true}
              />
            ))}
          </div>
        </div>
        <DroppableAnswers answers={answers} />
      </div>
    </DndContext>
  )
}

export default ImageLabelingPreview
