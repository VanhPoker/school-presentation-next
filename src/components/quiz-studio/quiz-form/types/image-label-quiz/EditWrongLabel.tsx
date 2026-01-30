import { Input } from '@/components/ui/input'
import { useCreateImageLabelingQuizStore } from '@/stores/use-create-image-labeling-quiz'
import { useQuizFormStudioStore } from '@/stores/use-quiz-studio-store'
import { QuizImageLabel } from '@/types/quiz-create'
import { omit } from 'lodash-es'
import { CornerDownLeft, Trash } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

type Props = { value: string }

const EditWrongLabel = ({ value }: Props) => {
  const [inputValue, setInputValue] = useState(value)
  const { createdLabels, wrongLabels, activeWrongLabelId } =
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

  const handleUpdateWrongLabels = () => {
    if (!inputValue) {
      useCreateImageLabelingQuizStore.setState({
        activeWrongLabelId: ''
      })
      return
    }
    if (allLabelValues?.includes(inputValue)) {
      toast.warning('Nhãn sai này đã tồn tại, vui lòng nhập nhãn khác!')
      useCreateImageLabelingQuizStore.setState({
        activeWrongLabelId: ''
      })
      return
    }
    const newWrongLabels = wrongLabels?.map((item) => ({
      ...item,
      value: item?.id === activeWrongLabelId ? inputValue : item?.value
    }))
    useCreateImageLabelingQuizStore.setState({
      wrongLabels: newWrongLabels,
      activeWrongLabelId: ''
    })
    handleUpdateToQuizStudio(newWrongLabels)
  }

  const handleRemoveWrongLabel = () => {
    const newWrongLabels = wrongLabels?.map((item) =>
      item?.id === activeWrongLabelId ? { ...item, is_deleted: true } : item
    )
    useCreateImageLabelingQuizStore.setState({
      wrongLabels: newWrongLabels,
      activeWrongLabelId: ''
    })
    handleUpdateToQuizStudio(newWrongLabels)
  }

  const handleUpdateToQuizStudio = (
    newWrongLabels: Pick<
      QuizImageLabel,
      'id' | 'value' | 'is_existed' | 'is_deleted' | 'is_new'
    >[]
  ) => {
    const convertedLabels = createdLabels?.map((item) => {
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
    const convertedWrongLabels = newWrongLabels?.map((item) => {
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
    setObjQuizFormStudio({
      ...objQuizFormStudio,
      questions_hotspots: {
        data: [...convertedLabels, ...convertedWrongLabels]
      }
    })
  }

  return (
    <div className="flex items-center gap-3">
      <span className="inline-block relative after:content-[''] after:absolute after:w-[1px] after:h-[19px] after:bg-[#181D27] after:right-[36px] after:top-[11px]">
        <Input
          placeholder="Thêm nhãn"
          className="max-w-[172px] !border-[#2D7CFB] border-[2px] relative pr-[44px] rounded-lg"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={(event) =>
            event.key === 'Enter' && handleUpdateWrongLabels()
          }
        />
        <CornerDownLeft
          className="absolute right-[10px] top-[12px] cursor-pointer"
          color="#535862"
          size={16}
          onClick={handleUpdateWrongLabels}
        />
      </span>
      <Trash
        color="#B42318"
        size={16}
        className="cursor-pointer"
        onClick={handleRemoveWrongLabel}
      />
    </div>
  )
}

export default EditWrongLabel
