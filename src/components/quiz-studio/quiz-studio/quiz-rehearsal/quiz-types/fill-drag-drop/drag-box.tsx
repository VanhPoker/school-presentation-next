import { memo, useEffect, useState } from 'react'
import { RenderQuestionAnswersProps } from '@/types/quiz-studio'
import dynamic from 'next/dynamic'
import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import ItemDrag from './item-drag'
import { Drag_Type, Drop_Type } from '../matching/type'
import { cn } from '@/lib/utils'
import useQuizStudioEditor from '@/hooks/use-quiz-studio-editor'
import './style.scss'
const MediaRender = dynamic(() => import('@/components/base/media-render'), {
  ssr: false
})
const QuizStudioEditor = dynamic(
  () => import('@/components/studio/tools/quiz-studio-editor'),
  { ssr: false }
)

const DragBox = ({
  item,
  results,
  config,
  handleJSONChange,
  isCorrect,
  externalAnswers
}: RenderQuestionAnswersProps) => {
  const {
    question_category,
    questions_hotspots,
    file_urls,
    asset_type,
    embedded_url,
    content_preview
  } = item
  const url = file_urls?.url
  const code = question_category?.code
  const { collectFillDragDrop } = useQuizStudioEditor()
  const [questionsHotspots, setQuestionsHotspots] = useState<any[]>([])
  const [parseContentPreview, setParseContentPreview] = useState<any[]>([])
  const [stringContentPreview, setStringContentPreview] = useState<string>('')
  const [isInitialized, setIsInitialized] = useState(false)
  // Logic for Drag_In + Drop_Empty and Drag_In + Drop_Replace
  const handleFindItemDrag = (drag_id: string, drop_id: string) => {
    const getAllNodeFillDragDrop = collectFillDragDrop(parseContentPreview)
    const drag_item = questionsHotspots.find((x: any) => {
      return x.id === drag_id
    })
    const drop_item = getAllNodeFillDragDrop.find((x: any) => {
      return x.attrs.id === drop_id
    })
    return {
      drag_item: drag_item,
      drop_item: drop_item
    }
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

  const handleActiveAnswer = (drag_item: any, drop_item?: any) => {
    const fomatQuestionsHotspots = questionsHotspots.map((x) => {
      if (x.id === drag_item.id) {
        x.is_disabled = true
      }
      if (drop_item && x.id === drop_item.attrs.item_drop.realId) {
        x.is_disabled = false
      }
      return { ...x }
    })
    setQuestionsHotspots([...fomatQuestionsHotspots])
  }

  const handleAddDropContentChange = (
    items: any,
    drag_item: any,
    drop_item: any
  ) => {
    return items.map((node: any) => {
      if (node.attrs && node.attrs.id === drop_item.attrs.id) {
        node.attrs.item_drop = {
          id: drag_item.id + '-' + drag_item.content, // for dnd-kit render
          realId: drag_item.id, // for looking in array answer
          dropId: drop_item.attrs.id, // for next drag in quiz name
          content: drag_item.content,
          fill_order: drag_item.fill_order,
          is_disabled: false
        }
      }
      if (node.content) {
        return {
          ...node,
          content: handleAddDropContentChange(
            node.content,
            drag_item,
            drop_item
          )
        }
      }
      return node
    })
  }

  const handleAddDropContent = (drag_item: any, drop_item: any) => {
    const fomatParseContent = handleAddDropContentChange(
      parseContentPreview,
      drag_item,
      drop_item
    )
    setParseContentPreview([...fomatParseContent])
    setStringContentPreview(JSON.stringify([...fomatParseContent]))
    if (handleJSONChange) {
      handleJSONChange([...fomatParseContent])
    }
  }

  // Logic for Drag_Out + Drop_Empty and Drag_Out + Drop_Replace
  const handleFindItemDrop = (drag_id: string, drop_id: string) => {
    const getAllNodeFillDragDrop = collectFillDragDrop(parseContentPreview)
    const drag_item = getAllNodeFillDragDrop.find((x: any) => {
      return x.attrs.id === drag_id
    })
    const drop_item = getAllNodeFillDragDrop.find((x: any) => {
      return x.attrs.id === drop_id
    })
    return {
      drag_item: drag_item,
      drop_item: drop_item
    }
  }
  const handleAddDragContentChange = (
    items: any,
    drag_item: any,
    drop_item: any
  ) => {
    return items.map((node: any) => {
      if (node.attrs && node.attrs.id === drag_item.attrs.id) {
        node.attrs.item_drop = drag_item.attrs.item_drop
      }
      if (node.attrs && node.attrs.id === drop_item.attrs.id) {
        node.attrs.item_drop = drop_item.attrs.item_drop
      }
      if (node.content) {
        return {
          ...node,
          content: handleAddDragContentChange(
            node.content,
            drag_item,
            drop_item
          )
        }
      }
      return node
    })
  }

  const handleAddDragContent = (drag_item: any, drop_item: any) => {
    const fomatParseContent = handleAddDragContentChange(
      parseContentPreview,
      drag_item,
      drop_item
    )
    setParseContentPreview([...fomatParseContent])
    setStringContentPreview(JSON.stringify([...fomatParseContent]))

    if (handleJSONChange) {
      handleJSONChange([...fomatParseContent])
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    const drag_id = active.data.current?.id
    const drag_type = active.data.current?.type

    const drop_id = over?.data.current?.id
    const drop_type = over?.data.current?.type

    if (drag_type === Drag_Type.in && drop_type === Drop_Type.empty) {
      const { drag_item, drop_item } = handleFindItemDrag(drag_id, drop_id)
      handleActiveAnswer(drag_item)
      handleAddDropContent(drag_item, drop_item)
    }

    if (drag_type === Drag_Type.in && drop_type === Drop_Type.replace) {
      const { drag_item, drop_item } = handleFindItemDrag(drag_id, drop_id)
      handleActiveAnswer(drag_item, drop_item)
      handleAddDropContent(drag_item, drop_item)
    }

    if (drag_type === Drag_Type.out && drop_type === Drop_Type.empty) {
      const { drag_item, drop_item } = handleFindItemDrop(drag_id, drop_id)

      const updated_drag_item = {
        ...drag_item,
        attrs: {
          ...drag_item.attrs,
          item_drop: null
        }
      }
      const updated_drop_item = {
        ...drop_item,
        attrs: {
          ...drop_item.attrs,
          item_drop: {
            ...drag_item.attrs.item_drop,
            dropId: drop_item.attrs.id
          }
        }
      }
      handleAddDragContent(updated_drag_item, updated_drop_item)
    }

    if (drag_type === Drag_Type.out && drop_type === Drop_Type.replace) {
      const { drag_item, drop_item } = handleFindItemDrop(drag_id, drop_id)
      const updated_drag_item = {
        ...drag_item,
        attrs: {
          ...drag_item.attrs,
          item_drop: {
            ...drop_item.attrs.item_drop,
            dropId: drag_item.attrs.id
          }
        }
      }
      const updated_drop_item = {
        ...drop_item,
        attrs: {
          ...drop_item.attrs,
          item_drop: {
            ...drag_item.attrs.item_drop,
            dropId: drop_item.attrs.id
          }
        }
      }
      handleAddDragContent(updated_drag_item, updated_drop_item)
    }
  }

  const handleFomatContent = (items: any, newItems: any) => {
    return items.map((node: any) => {
      if (node.attrs && node.attrs.fill_order) {
        node.attrs.is_correct = null
        const checkItem = newItems.find((x: any) => {
          return x.fill_order === node.attrs.fill_order
        })
        if (checkItem) {
          node.attrs.id = checkItem.id
          if (checkItem.item_drop) {
            node.attrs.item_drop = checkItem.item_drop
          }
          if (checkItem.content) {
            node.attrs.content = checkItem.content
          } else {
            node.attrs.item_drop = null
          }
        }
      }
      if (node.content) {
        return {
          ...node,
          content: handleFomatContent(node.content, newItems)
        }
      }
      return node
    })
  }

  const handleFomatResult = (
    items: any,
    result: boolean | undefined,
    newItems: any
  ) => {
    return items.map((node: any) => {
      if (node.attrs && node.attrs.fill_order) {
        node.attrs.is_correct = result
      }
      if (node.content) {
        return {
          ...node,
          content: handleFomatResult(node.content, result, newItems)
        }
      }
      return node
    })
  }

  // Reset initialization state when question changes
  useEffect(() => {
    setIsInitialized(false)
  }, [item.id])

  useEffect(() => {
    if (!isInitialized && content_preview && questions_hotspots) {
      const fomatQuestionsHotspots = questions_hotspots.map((x: any) => {
        return { ...x, is_disabled: false }
      })
      setQuestionsHotspots(fomatQuestionsHotspots)
      const parseContentPreview = JSON.parse(content_preview)
      let fomatContentPreview
      if (externalAnswers && externalAnswers.length > 0) {
        fomatContentPreview = handleFomatContent(
          parseContentPreview,
          externalAnswers
        )
      } else {
        fomatContentPreview = handleFomatContent(
          parseContentPreview,
          questions_hotspots
        )
      }
      setTimeout(() => {
        setParseContentPreview(fomatContentPreview)
        setStringContentPreview(JSON.stringify(fomatContentPreview))
        setIsInitialized(true)
      }, 10)
    }
  }, [content_preview, questions_hotspots, isInitialized, externalAnswers])

  useEffect(() => {
    if (results && results.length > 0) {
      const fomatContentPreview = handleFomatResult(
        parseContentPreview,
        isCorrect,
        results
      )
      setTimeout(() => {
        setParseContentPreview(fomatContentPreview)
        setStringContentPreview(JSON.stringify(fomatContentPreview))
      }, 10)
    }
  }, [results])

  return (
    <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
      <div className="w-full h-full relative">
        <div className="question-name grow flex pb-5 overflow-x-auto">
          <div
            className={cn(
              'w-full mx-auto',
              config && config.isInBook ? 'max-w-full' : 'max-w-[1024px]'
            )}
          >
            <div className="flex flex-col lg:flex-row gap-2 px-4 lg:px-0">
              {url && (
                <MediaRender
                  type={asset_type}
                  url={url || embedded_url}
                  containerClass="aspect-[4/3] !rounded-md overflow-hidden bg-gray-200 w-full max-w-md lg:max-w-none lg:w-1/3 mx-auto lg:mx-0"
                />
              )}
              <div className="flex-1 space-y-3 flex items-start justify-start flex-col text-slate-900 text-base fill-drag-drop-editor">
                <QuizStudioEditor
                  allowEdit={false}
                  is_practise={true}
                  content={stringContentPreview}
                  placeholder="Nhập câu hỏi vào đây"
                  fill={false}
                  codeQuiz={code || ''}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="question-answer h-auto border-t border-t-gray-200">
          <div
            className={cn(
              'w-full mx-auto py-8',
              config && config.isInBook ? 'max-w-full' : 'max-w-[1024px]'
            )}
          >
            <div className="flex flex-wrap gap-2 items-center justify-center max-h-[50%] h-full">
              {questionsHotspots?.map((x: any) => {
                return <ItemDrag key={x.id} item={x} drag_type={Drag_Type.in} />
              })}
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  )
}

export default memo(DragBox)
