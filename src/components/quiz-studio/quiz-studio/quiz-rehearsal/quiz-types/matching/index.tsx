import { useEffect, useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import ItemDrag from './item-drag'
import ItemNomal from './item-nomal'
import {
  Extended_Hotspots_Insert_Input,
  RenderQuestionAnswersProps
} from '@/types/quiz-studio'
import { cn } from '@/lib/utils'
import { Drag_Type, Drop_Type, MatchingQuizPreview } from './type'
import { handleRenderInputColor } from '../../../quiz-service'
import dynamic from 'next/dynamic'
import { restrictToFirstScrollableAncestor } from '@dnd-kit/modifiers'
const LatexEditor = dynamic(() => import('@/components/base/latex-editor'), {
  ssr: false
})
const MediaRender = dynamic(() => import('@/components/base/media-render'), {
  ssr: false
})

export default function Matching({
  item,
  results,
  config,
  handleJSONChange,
  externalAnswers
}: RenderQuestionAnswersProps) {
  const { file_urls, asset_type, embedded_url, name, questions_hotspots } = item
  const url = file_urls?.url
  const [activeDragItem, setActiveDragItem] =
    useState<Extended_Hotspots_Insert_Input | null>(null)
  const [arrayAnswersFinal, setArrayAnswersFinal] = useState<
    MatchingQuizPreview[]
  >([])
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const drag_id = active.data.current?.id
    const drag_type = active.data.current?.type

    let foundItem = null

    // Tìm item đang được kéo trong state arrayAnswersFinal
    for (const item of arrayAnswersFinal) {
      if (drag_type === Drag_Type.in) {
        // Kéo từ danh sách bên phải
        foundItem = item.child.find((x) => x.id === drag_id)
      } else if (drag_type === Drag_Type.out) {
        // Kéo từ một ô đã thả
        if (item.child[0]?.item_drop?.id === drag_id) {
          foundItem = item.child[0]?.item_drop
        }
      }
      if (foundItem) break
    }

    setActiveDragItem(foundItem)
  }
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    const drag_id = active.data.current?.id
    const drag_type = active.data.current?.type

    const drop_id = over?.data.current?.id
    const drop_type = over?.data.current?.type

    let drag_item = {} as Extended_Hotspots_Insert_Input
    let drag_item_father = {} as MatchingQuizPreview
    let drop_item_father = {} as MatchingQuizPreview

    if (drag_type === Drag_Type.in && drop_type === Drop_Type.empty) {
      arrayAnswersFinal.forEach((item: MatchingQuizPreview) => {
        const find_drag_item = item.child.find((x) => {
          return x.id === drag_id
        })
        if (find_drag_item) {
          drag_item = find_drag_item
          drag_item_father = item
        }
        const find_drop_item = item.child.find((x) => {
          return x.id === drop_id
        })
        if (find_drop_item) {
          drop_item_father = item
        }
      })

      drag_item_father.child = drag_item_father.child.map(
        (item: Extended_Hotspots_Insert_Input, i: number) => {
          if (i === 1) {
            item = drop_item_father.child[i]!
          }
          return item
        }
      )

      drop_item_father.child = drop_item_father.child
        .map((item: Extended_Hotspots_Insert_Input, i: number) => {
          if (i === 0) {
            item = { ...item, item_drop: { ...drag_item } }
          }
          return item
        })
        .filter((_, i) => {
          return i === 0
        })
    }

    if (drag_type === Drag_Type.in && drop_type === Drop_Type.replace) {
      arrayAnswersFinal.forEach((item: MatchingQuizPreview) => {
        const find_drag_item = item.child.find((x) => {
          return x.id === drag_id
        })
        if (find_drag_item) {
          drag_item = find_drag_item
          drag_item_father = item
        }
        const find_drop_item = item.child.find((x) => {
          return x.id === drop_id
        })
        if (find_drop_item) {
          drop_item_father = item
        }
      })

      drag_item_father.child = [
        { ...drag_item_father.child[0] },
        { ...drop_item_father.child[0]?.item_drop }
      ]

      drop_item_father.child = drop_item_father.child
        .map((item: Extended_Hotspots_Insert_Input, i: number) => {
          if (i === 0) {
            item = { ...item, item_drop: { ...drag_item } }
          }
          return item
        })
        .filter((_, i) => {
          return i === 0
        })
    }

    if (drag_type === Drag_Type.out && drop_type === Drop_Type.empty) {
      arrayAnswersFinal.forEach((item: MatchingQuizPreview) => {
        const { child } = item
        const first_child = child[0]
        const item_drop = first_child?.item_drop
        if (item_drop && drag_id === item_drop.id) {
          drag_item = item_drop
          drag_item_father = item
        }

        const find_drop_item = item.child.find((x) => {
          return x.id === drop_id
        })
        if (find_drop_item) {
          drop_item_father = item
        }
      })

      drag_item_father.child = [
        { ...drag_item_father.child[0], item_drop: {} },
        { ...drop_item_father.child[1] }
      ]

      drop_item_father.child = drop_item_father.child
        .map((item: Extended_Hotspots_Insert_Input, i: number) => {
          if (i === 0) {
            item = { ...item, item_drop: { ...drag_item } }
          }
          return item
        })
        .filter((_, i) => {
          return i === 0
        })
    }

    if (drag_type === Drag_Type.out && drop_type === Drop_Type.replace) {
      arrayAnswersFinal.forEach((item: MatchingQuizPreview) => {
        const { child } = item
        const first_child = child[0]
        const item_drop = first_child?.item_drop
        if (item_drop && drag_id === item_drop.id) {
          drag_item = item_drop
          drag_item_father = item
        }

        const find_drop_item = item.child.find((x) => {
          return x.id === drop_id
        })
        if (find_drop_item) {
          drop_item_father = item
        }
      })

      drag_item_father.child = [
        {
          ...drag_item_father.child[0],
          item_drop: { ...drop_item_father.child[0]?.item_drop }
        }
      ]

      drop_item_father.child = [
        { ...drop_item_father.child[0], item_drop: { ...drag_item } }
      ]
    }

    const newArrayAnswersFinal = arrayAnswersFinal.map(
      (item: MatchingQuizPreview) => {
        if (item.id === drag_item_father.id) {
          // item = drag_item_father
          return { ...drag_item_father, child: [...drag_item_father.child] }
        }
        if (item.id === drop_item_father.id) {
          // item = drop_item_father
          return { ...drop_item_father, child: [...drop_item_father.child] }
        }
        return item
      }
    )
    setArrayAnswersFinal(newArrayAnswersFinal)
    setActiveDragItem(null)
    if (handleJSONChange) handleJSONChange(newArrayAnswersFinal)
  }

  const mapAnswersFromExternal = (
    origin: MatchingQuizPreview[],
    external: any[]
  ): MatchingQuizPreview[] => {
    const leftDrop = new Map<string, Extended_Hotspots_Insert_Input>()
    external?.forEach((a) => {
      if (a?.hotspots_id && a?.item_drop?.id)
        leftDrop.set(a.hotspots_id, a.item_drop)
    })

    const used = new Set<string>(Array.from(leftDrop.values()).map((r) => r.id))

    const pool: Extended_Hotspots_Insert_Input[] = origin
      .map((r) => r.child[1])
      .filter(
        (r): r is Extended_Hotspots_Insert_Input =>
          Boolean(r) && !used.has(r?.id)
      )
      .map((r) => ({ ...r }))

    const takeFree = () => {
      const i = pool.findIndex((r) => !used.has(r.id))
      if (i === -1) return undefined
      const [picked] = pool.splice(i, 1)
      used.add(picked?.id)
      return picked
    }

    return origin.map((row) => {
      const left = { ...row.child[0] }
      const drop = leftDrop.get(left.id)

      if (drop) {
        return { ...row, child: [{ ...left, item_drop: { ...drop } }] }
      }

      let right =
        row.child[1] && !used.has(row.child[1]?.id)
          ? { ...row.child[1] }
          : undefined
      if (right) {
        const idxInPool = pool.findIndex((r) => r?.id === right?.id)
        if (idxInPool !== -1) pool.splice(idxInPool, 1)
        used.add(right.id)
      } else {
        right = takeFree()
      }

      return right
        ? { ...row, child: [{ ...left, item_drop: {} }, { ...right }] }
        : { ...row, child: [{ ...left, item_drop: {} }] }
    })
  }

  const renderListDrag = (stable = false) => {
    const array_answers = [...questions_hotspots]
    let arry_left = []
    let arry_right = []
    let rightRaw = []
    const arry_final: MatchingQuizPreview[] = []

    arry_left = array_answers
      .filter((x: any) => {
        return x.left === 0
      })
      .map((x: any) => {
        return { ...x, is_correct: null }
      })
    rightRaw = array_answers.filter((x: any) => {
      return x.left === 1
    })

    arry_right = (stable ? rightRaw : shuffleArray(rightRaw)).map((x: any) => {
      return { ...x, is_correct: null }
    })

    for (let i = 0; i < arry_left.length; i++) {
      arry_final.push({
        id: i + 1,
        is_correct: null,
        child: [{ ...arry_left[i], item_drop: {} }, { ...arry_right[i] }]
      })
    }
    setArrayAnswersFinal(arry_final)
  }

  useEffect(() => {
    if (results && results.length > 0) {
      const newArrayAnswersFinal = arrayAnswersFinal.map(
        (item: MatchingQuizPreview) => {
          if (item.child.length === 1) {
            item.child = item.child.map((x: any) => {
              const checkItem = results.find((y: any) => {
                return y.hotspots_id === x.id
              })
              if (checkItem) {
                return {
                  ...x,
                  is_correct: checkItem.is_correct,
                  item_drop: {
                    ...x.item_drop,
                    is_correct: checkItem.is_correct
                  }
                }
              }
              return { ...x }
            })
          }
          return { ...item }
        }
      )
      setArrayAnswersFinal(newArrayAnswersFinal)
    } else if (externalAnswers && externalAnswers.length > 0) {
      renderListDrag(true)
      setArrayAnswersFinal((prev) =>
        mapAnswersFromExternal(prev, externalAnswers)
      )
    } else {
      renderListDrag(false)
    }
  }, [results, item.id])

  const usedRightIds = new Set(
    arrayAnswersFinal
      .map((r) => r.child[0]?.item_drop?.id)
      .filter(Boolean) as string[]
  )

  return (
    <div className="h-full overflow-x-hidden overflow-y-auto space-y-6">
      <div
        className={cn(
          'w-full mx-auto',
          config && config.isInBook ? 'max-w-full' : 'max-w-[1024px]'
        )}
      >
        <div className="flex flex-col md:flex-row gap-4 px-4">
          {(url || embedded_url) && (
            <MediaRender
              type={asset_type}
              url={url || embedded_url}
              containerClass="aspect-[320/240] !rounded-md overflow-hidden bg-gray-200 w-full max-w-[245px] h-[180px] md:max-w-[280px] md:h-[210px] lg:min-w-[320px] lg:max-w-[320px] lg:h-[240px] mx-auto lg:mx-0"
            />
          )}
          <div
            className={cn(
              'flex-1 space-y-3 flex items-start justify-start flex-col text-slate-900 text-base'
              // config && config.isInBook
              //   ? 'font-normal text-base'
              //   : 'font-semibold text-xl'
            )}
          >
            <LatexEditor content={name} />
          </div>
        </div>
      </div>
      <div
        className={cn(
          'w-full mx-auto pb-6 space-y-6 px-4 lg:px-0',
          config && config.isInBook ? 'max-w-full' : 'max-w-[750px]'
        )}
      >
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveDragItem(null)}
          modifiers={[restrictToFirstScrollableAncestor]}
        >
          {arrayAnswersFinal.map((x, indexP) => {
            const { id, child } = x
            return (
              <div key={id} className="grid grid-cols-2 gap-1 xl:gap-7">
                {child.map((y: any, indexC: number) => {
                  if (indexC === 1 && usedRightIds.has(y.id)) return null
                  return (
                    <div
                      key={y.id}
                      className={cn(
                        'flex items-center w-full',
                        indexC === 0 && 'pr-3',
                        indexC === 1 && 'pl-3'
                      )}
                    >
                      {indexC === 0 && (
                        <ItemNomal
                          item={y}
                          borderColor={handleRenderInputColor(indexP)}
                          config={config}
                        />
                      )}
                      {indexC === 1 && (
                        <ItemDrag
                          item={y}
                          drag_type={Drag_Type.in}
                          is_sticky={false}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
          <DragOverlay>
            {activeDragItem ? (
              <ItemDrag
                item={activeDragItem}
                drag_type={Drag_Type.in}
                is_sticky={true}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
