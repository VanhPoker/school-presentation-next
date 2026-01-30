import { memo } from 'react'
import { useQuizFormStudioStore } from '@/stores/use-quiz-studio-store'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { PlusIcon, TrashIcon } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { toasts } from '@/components/ui/toast-color'
import { handleRenderInputColor } from '@/components/quiz-studio/quiz-service'
import { nanoid } from 'nanoid'
import { cn } from '@/lib/utils'
const LatexEditor = dynamic(() => import('@/components/base/latex-editor'), {
  ssr: false
})

const DropAnswers = () => {
  const { arrayQuizzAnswers, setArrayQuizzAnswers } = useQuizFormStudioStore()

  const handleAddChid = (parent_id: string) => {
    const newAnswer = {
      id: nanoid(5),
      is_new: true,
      content: '',
      is_correct: false,
      is_deleted: false
    }
    const newArrayQuizzAnswers = arrayQuizzAnswers.map((x: any) => {
      if (x.id === parent_id) {
        const checkIsDeleteFalse = x.children?.data.filter((y: any) => {
          return !y.is_deleted
        }).length
        if (checkIsDeleteFalse < 5) {
          x.children?.data.push({
            ...newAnswer,
            fill_order: x.fill_order
          })
        } else {
          toasts.error('Tối đa 5 lựa chọn')
        }
      }
      return x
    })
    setArrayQuizzAnswers([...newArrayQuizzAnswers])
  }

  const handleCheckBoxChangeChid = (parent_id: string, child_id: string) => {
    const newArrayQuizzAnswers = arrayQuizzAnswers.map((x: any) => {
      if (x.id === parent_id) {
        x.children?.data.forEach((y: any) => {
          if (y.id === child_id) {
            y.is_correct = true
          } else {
            y.is_correct = false
          }
        })
      }
      return x
    })
    setArrayQuizzAnswers([...newArrayQuizzAnswers])
  }

  const handleContentChangeChid = (
    parent_id: string,
    child_id: string,
    value: string
  ) => {
    const newArrayQuizzAnswers = arrayQuizzAnswers.map((x: any) => {
      if (x.id === parent_id) {
        x.children?.data.forEach((y: any) => {
          if (y.id === child_id) {
            y.content = value
          }
        })
      }
      return x
    })
    setArrayQuizzAnswers([...newArrayQuizzAnswers])
  }

  const handleRemoveChid = (parent_id: string, child_id: string) => {
    const newArrayQuizzAnswers = arrayQuizzAnswers.map((x: any) => {
      if (x.id === parent_id) {
        const checkItem = x.children?.data.find((x: any) => {
          return x.id === child_id
        })
        const checkItemIndex = x.children?.data.findIndex((x: any) => {
          return x.id === child_id
        })
        if (checkItem) {
          if (checkItem.is_new) {
            x.children?.data.splice(checkItemIndex, 1)
          } else {
            x.children?.data.forEach((child: any) => {
              if (child.id === child_id) {
                child.is_deleted = true
              }
            })
          }
        }
      }
      return x
    })
    setArrayQuizzAnswers([...newArrayQuizzAnswers])
  }

  return (
    <div className="text-sm bg-white p-4 rounded-xl flex flex-col space-y-4">
      <span className="uppercase">câu trả lời</span>
      {arrayQuizzAnswers.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {arrayQuizzAnswers
            .filter((parent) => {
              return !parent.is_deleted
            })
            .map((parent, parent_i) => {
              const parent_id = parent.id
              const parent_children = parent.children
              const data = parent_children?.data
              return (
                <div
                  key={'parent_i_' + parent_i}
                  style={{ borderColor: handleRenderInputColor(parent_i) }}
                  className="rounded-lg transition-all p-4 space-y-4 border-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="uppercase">chỗ trống {parent_i + 1}</span>
                    <Button
                      disabled={
                        data?.filter((x) => {
                          return !x.is_deleted
                        }).length === 5
                      }
                      onClick={() => {
                        handleAddChid(parent_id)
                      }}
                    >
                      <PlusIcon />
                      <span>Thêm lựa chọn</span>
                    </Button>
                  </div>
                  <div className="flex flex-col gap-4">
                    {data &&
                      data
                        .filter((child) => {
                          return !child.is_deleted
                        })
                        .map((child, child_i) => {
                          const child_id = child.id
                          const child_content = child.content?.replaceAll(
                            '$$',
                            '$'
                          )
                          const child_is_correct = child.is_correct
                          return (
                            <div
                              key={'child_i_' + child_i}
                              className="flex items-center justify-center transition-all"
                            >
                              <Checkbox
                                disabled={child_is_correct ? true : false}
                                checked={child_is_correct ? true : false}
                                onCheckedChange={() => {
                                  handleCheckBoxChangeChid(parent_id, child_id)
                                }}
                                className="transition-all rounded  data-[state=checked]:bg-blue-600 data-[state=checked]:text-primary-foreground mr-3"
                              />
                              <div
                                className={cn(
                                  'border px-3 py-2 flex-1 overflow-hidden rounded-md shadow-sm transition-all',
                                  child_is_correct
                                    ? 'bg-gray-100 cursor-not-allowed shadow-md'
                                    : 'bg-transparent shadow-sm'
                                )}
                              >
                                <LatexEditor
                                  content={child_content || ''}
                                  editable={child_is_correct ? false : true}
                                  disableEnter={true}
                                  className={`${child_is_correct ? 'cursor-not-allowed' : 'cursor-text'}`}
                                  onChange={(value) => {
                                    handleContentChangeChid(
                                      parent_id,
                                      child_id,
                                      value
                                    )
                                  }}
                                />
                              </div>
                              <Button
                                disabled={child_is_correct ? true : false}
                                className="border-transparent hover:bg-transparent text-gray-400 hover:text-destructive"
                                onClick={() => {
                                  handleRemoveChid(parent_id, child_id)
                                }}
                              >
                                <TrashIcon size={20} />
                              </Button>
                            </div>
                          )
                        })}
                  </div>
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}

export default memo(DropAnswers)
