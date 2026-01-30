import { QuizImageLabel, QuizImageLabelAnswer } from '@/types/quiz-create'
import { useEffect, useRef, useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core'
import DroppableAnswers from './DroppableAnswers'
import Label from './Label'
import { groupBy, isArray, uniqueId } from 'lodash-es'
import { cn } from '@/lib/utils'

type Props = {
  imageUrl: string
  questionsHotpots: QuizImageLabel[]
  originMediaWidth: number
  answerPositions: string
  onChange?: (labels: QuizImageLabelAnswer[]) => void
  containerClass?: string
  isCorrect?: boolean
  externalAnswers?: any[]
}

const Sticker = ({
  imageUrl,
  questionsHotpots,
  originMediaWidth,
  answerPositions,
  onChange,
  containerClass,
  isCorrect,
  externalAnswers
}: Props) => {
  const container = useRef(null)
  const [ratio, setRatio] = useState(1)
  const [answers, setAnswers] = useState<QuizImageLabelAnswer[]>([])
  const [labels, setLabels] = useState<QuizImageLabelAnswer[]>([])
  const [isAllCorrect, setIsAllCorrect] = useState<boolean | undefined>()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8 // Slightly larger to avoid accidental drag during scroll
      }
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150, // Reduced delay for faster activation
        tolerance: 8 // Increased tolerance for better handling
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
        handleOnChange(newLabels)
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
        handleOnChange(newLabels)
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
      handleOnChange(newLabels)
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
      handleOnChange(newLabels)
      return
    }
  }

  const handleOnChange = (labels: QuizImageLabelAnswer[]) => {
    setIsAllCorrect(undefined)
    if (onChange) {
      const payload = labels?.map((item, index) => ({
        left: item?.left,
        top: item?.top,
        alignment: item?.alignment,
        hotspotsId: item?.answerId,
        fillOrder: index + 1
      }))
      onChange?.(payload)
    }
  }

  // Track if component has been initialized to prevent re-init from externalAnswers changes
  const hasInitializedRef = useRef(false)
  const prevHotpotsRef = useRef<string>('')
  const prevPositionsRef = useRef<string>('')

  // Map labels and answers to state
  useEffect(() => {
    // Create keys to check if question data changed (not just externalAnswers)
    const hotpotsKey = JSON.stringify(questionsHotpots?.map((h) => h.id) || [])
    const positionsKey = answerPositions || ''

    // Only re-initialize if:
    // 1. First mount (hasInitializedRef.current === false)
    // 2. Question data changed (hotpots or positions)
    // This prevents reset when externalAnswers changes during gameplay (from user drops)
    const shouldInitialize =
      !hasInitializedRef.current ||
      hotpotsKey !== prevHotpotsRef.current ||
      positionsKey !== prevPositionsRef.current

    if (!shouldInitialize) {
      return // Don't reset state if only externalAnswers changed
    }

    // Update refs
    hasInitializedRef.current = true
    prevHotpotsRef.current = hotpotsKey
    prevPositionsRef.current = positionsKey

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
    let convertedAnswers = questionsHotpots?.map((item) => ({
      id: uniqueId(),
      content: item?.content,
      answerId: item?.id
    }))

    if (isArray(externalAnswers)) {
      const groupAnswersByAnswerId = groupBy(convertedAnswers, 'answerId')
      const groupExternalAnswersByFillOrder = groupBy(
        externalAnswers,
        'fill_order'
      )
      const groupExternalAnswersByHotpotId = groupBy(
        externalAnswers,
        'hotspots_id'
      )
      convertedLabels = convertedLabels?.map((item, index) => {
        const answerId =
          groupExternalAnswersByFillOrder?.[index + 1]?.[0]?.hotspots_id
        if (answerId) {
          return {
            ...item,
            answerId,
            content: groupAnswersByAnswerId?.[answerId]?.[0]?.content || ''
          }
        }
        return item
      })
      convertedAnswers = convertedAnswers?.filter(
        (item) => !groupExternalAnswersByHotpotId?.[item?.answerId]
      )
    }
    setAnswers(convertedAnswers)
    setLabels(convertedLabels)
  }, [questionsHotpots, answerPositions, externalAnswers])

  useEffect(() => setIsAllCorrect(isCorrect), [isCorrect])

  useEffect(() => {
    if (!container.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newRatio = originMediaWidth / entry.contentRect.width
        setRatio(newRatio)
      }
    })
    observer.observe(container.current)
    return () => observer.disconnect()
  }, [])

  return (
    <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
      <div
        className={cn(
          'flex flex-col gap-7 items-center md:items-stretch',
          containerClass
        )}
      >
        <div
          ref={container}
          className="md:grow w-full mx-auto max-w-full aspect-[4_/_3] relative bg-no-repeat bg-[center_center] bg-contain"
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
              isError={isAllCorrect === false}
              isCorrect={isAllCorrect === true}
            />
          ))}
        </div>
        <DroppableAnswers answers={answers} />
      </div>
    </DndContext>
  )
}

export default Sticker
