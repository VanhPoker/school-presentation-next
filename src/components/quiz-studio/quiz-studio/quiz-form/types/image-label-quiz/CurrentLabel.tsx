import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useCreateImageLabelingQuizStore } from '@/stores/use-create-image-labeling-quiz'
import { useQuizFormStudioStore } from '@/stores/use-quiz-studio-store'
import { QuizImageLabel, QuizImageLabelAlignment } from '@/types/quiz-create'
import { CornerDownLeft, Trash } from 'lucide-react'
import { useMemo } from 'react'
import { toast } from 'sonner'

type Props = {
  handleMouseDown?: any
}

const CurrentLabel = ({ handleMouseDown }: Props) => {
  const { currentLabel, createdLabels, wrongLabels, activeLabelId } =
    useCreateImageLabelingQuizStore()
  const { objQuizFormStudio, setObjQuizFormStudio } = useQuizFormStudioStore()

  const allLabelValues = useMemo(() => {
    const createdLabelNames = createdLabels
      ?.filter((item) => !item?.is_deleted)
      ?.map((item) => item?.value)
    const wrongLabelNames = wrongLabels
      ?.filter((item) => !item?.is_deleted)
      ?.map((item) => item?.value)
    return [...createdLabelNames, ...wrongLabelNames]
  }, [createdLabels, wrongLabels])

  const handleCreateLabel = () => {
    if (allLabelValues?.includes(currentLabel?.value as string)) {
      toast.warning('Nhãn này đã tồn tại, vui lòng nhập nhãn khác!')
      useCreateImageLabelingQuizStore.setState({
        currentLabel: undefined,
        activeLabelId: ''
      })
      return
    }
    const newLabels =
      currentLabel?.value === ''
        ? createdLabels
        : ([...createdLabels, currentLabel] as QuizImageLabel[])
    useCreateImageLabelingQuizStore.setState({
      currentLabel: undefined,
      createdLabels: newLabels,
      activeLabelId: ''
    })
    // Update to quiz form studio
    const convertedLabels = newLabels?.map((item) => ({
      content: item?.value,
      left: item?.left,
      top: item?.top,
      alignment: item?.alignment,
      is_correct: true,
      is_new: item?.is_new,
      is_deleted: item?.is_deleted
    }))
    const convertedWrongLabels = wrongLabels?.map((item) => ({
      content: item?.value,
      is_correct: false,
      is_new: item?.is_new,
      is_deleted: item?.is_deleted
    }))
    const answerPositions = newLabels
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

  if (!currentLabel) return null
  return (
    <div
      style={{
        top: currentLabel?.top,
        left: currentLabel?.left,
        position: 'absolute'
      }}
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(e) => handleMouseDown(e, 'current')}
    >
      <div
        className={cn('flex items-center min-w-[224px]', {
          '-translate-x-full -translate-y-2/4 flex-row-reverse':
            currentLabel?.alignment === QuizImageLabelAlignment.LEFT,
          '-translate-y-2/4':
            currentLabel?.alignment === QuizImageLabelAlignment.RIGHT,
          'flex-col -translate-x-2/4':
            currentLabel?.alignment === QuizImageLabelAlignment.BOTTOM,
          'flex-col-reverse -translate-x-2/4 -translate-y-full':
            currentLabel?.alignment === QuizImageLabelAlignment.TOP
        })}
      >
        <span className="bg-white w-3 h-3 rounded-full border-2 border-solid border-[#0D67F7] cursor-move" />
        <span
          className={cn('inline-block w-[2px] h-4 bg-[#0D67F7] cursor-move', {
            'w-[2px] h-4':
              currentLabel?.alignment === QuizImageLabelAlignment.BOTTOM ||
              currentLabel?.alignment === QuizImageLabelAlignment.TOP,
            'w-4 h-[2px]':
              currentLabel?.alignment === QuizImageLabelAlignment.LEFT ||
              currentLabel?.alignment === QuizImageLabelAlignment.RIGHT
          })}
        />
        <span
          className={cn({
            "relative after:content-[''] after:absolute after:w-[1px] after:h-[19px] after:bg-[#181D27] after:right-[36px] after:top-[11px]":
              activeLabelId === 'current'
          })}
        >
          <Input
            placeholder="Thêm nhãn"
            className={cn(
              'relative max-w-[172px] !border-[#2D7CFB] border-[2px] rounded-lg bg-white !text-base',
              {
                'pr-[45px]': activeLabelId === 'current'
              }
            )}
            value={currentLabel?.value || ''}
            onChange={(event) =>
              useCreateImageLabelingQuizStore.setState({
                currentLabel: {
                  ...currentLabel,
                  value: event?.target?.value
                }
              })
            }
            onKeyDown={(event) => event.key === 'Enter' && handleCreateLabel()}
          />
          {activeLabelId === 'current' && (
            <CornerDownLeft
              className="absolute right-[10px] top-[12px] cursor-pointer"
              color="#535862"
              size={16}
              onClick={handleCreateLabel}
            />
          )}
        </span>

        {activeLabelId === 'current' && (
          <Trash
            color="#B42318"
            size={16}
            className={cn('cursor-pointer', {
              'mt-2':
                currentLabel?.alignment === QuizImageLabelAlignment.BOTTOM,
              'mb-2': currentLabel?.alignment === QuizImageLabelAlignment.TOP,
              'mr-2': currentLabel?.alignment === QuizImageLabelAlignment.LEFT,
              'ml-2': currentLabel?.alignment === QuizImageLabelAlignment.RIGHT
            })}
            onClick={() =>
              useCreateImageLabelingQuizStore.setState({
                currentLabel: undefined,
                activeLabelId: ''
              })
            }
          />
        )}
      </div>
    </div>
  )
}

export default CurrentLabel
