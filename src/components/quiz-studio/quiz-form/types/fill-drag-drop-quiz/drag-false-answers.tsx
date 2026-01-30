import NodeInputAutoSpan from '@/components/studio/tools/node-input-auto-span'
import { Button } from '@/components/ui/button'
import { useQuizFormStudioStore } from '@/stores/use-quiz-studio-store'
import { PlusIcon } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { memo } from 'react'
import { nanoid } from 'nanoid'
import { toasts } from '@/components/ui/toast-color'

const DragFalseAnswers = () => {
  const searchParams = useSearchParams()
  const codeUrl = searchParams.get('code')
  const quizIdFromUrl = searchParams.get('quizId')
  const { arrayQuizzFalseAnswers, setArrayQuizzFalseAnswers } =
    useQuizFormStudioStore()

  const handleAddAnswerFalse = () => {
    const totalAnswersInCorrect = arrayQuizzFalseAnswers.filter((x) => {
      return !x.is_correct && !x.is_deleted
    }).length
    if (totalAnswersInCorrect < 10) {
      const newAnswer = {
        id: nanoid(5),
        is_correct: false,
        fill_order: arrayQuizzFalseAnswers.length + 1 + 10,
        description: codeUrl,
        content: '',
        is_new: true,
        is_deleted: false
      }
      setArrayQuizzFalseAnswers([...arrayQuizzFalseAnswers, ...[newAnswer]])
    } else {
      toasts.error('Tối đa 10 câu sai')
    }
  }

  const handleAddContentAnswerFalse = (id: string, value: string) => {
    const newArrayQuizzFalseAnswers = arrayQuizzFalseAnswers.map((x) => {
      if (x.id === id) {
        x.content = value
      }
      return x
    })
    setArrayQuizzFalseAnswers(newArrayQuizzFalseAnswers)
  }

  const handleRemoveAnswerFalse = (id: string) => {
    if (quizIdFromUrl) {
      const newArrayQuizzFalseAnswers = arrayQuizzFalseAnswers.map((x) => {
        if (x.id === id) {
          x.is_deleted = true
        }
        return x
      })
      setArrayQuizzFalseAnswers(newArrayQuizzFalseAnswers)
    } else {
      const newArrayQuizzFalseAnswers = arrayQuizzFalseAnswers.filter((x) => {
        return x.id !== id
      })
      setArrayQuizzFalseAnswers(newArrayQuizzFalseAnswers)
    }
  }

  return (
    <div className="text-sm bg-white p-4 rounded-xl flex flex-col">
      <div className="uppercase flex items-center justify-between">
        <span>câu trả lời sai</span>
        <Button
          variant={'default'}
          onClick={handleAddAnswerFalse}
          disabled={arrayQuizzFalseAnswers.length === 10}
        >
          <PlusIcon />
          <span>Thêm</span>
        </Button>
      </div>
      {arrayQuizzFalseAnswers.length > 0 && (
        <div className="mt-4 flex flex-wrap items-start justify-center">
          {arrayQuizzFalseAnswers
            .filter((x) => {
              return !x.is_deleted
            })
            .map((x, i) => {
              const { id, content } = x
              return (
                <NodeInputAutoSpan
                  key={i + 1}
                  id={id}
                  content={content || ''}
                  handleAddContentAnswerFalse={(id, value) => {
                    if (handleAddContentAnswerFalse) {
                      handleAddContentAnswerFalse(id, value)
                    }
                  }}
                  handleRemoveAnswerFalse={(id) => {
                    if (handleRemoveAnswerFalse) {
                      handleRemoveAnswerFalse(id)
                    }
                  }}
                />
              )
            })}
        </div>
      )}
    </div>
  )
}

export default memo(DragFalseAnswers)
