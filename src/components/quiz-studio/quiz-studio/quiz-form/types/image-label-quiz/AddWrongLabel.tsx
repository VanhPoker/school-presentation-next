import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCreateImageLabelingQuizStore } from '@/stores/use-create-image-labeling-quiz'
import { useQuizFormStudioStore } from '@/stores/use-quiz-studio-store'
import { uniqueId } from 'lodash-es'
import { CornerDownLeft, Plus, Trash } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

const AddWrongLabel = () => {
  const [isInput, setIsInput] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const { wrongLabels, createdLabels } = useCreateImageLabelingQuizStore()
  const container = useRef<HTMLDivElement>(null)
  const { objQuizFormStudio, setObjQuizFormStudio } = useQuizFormStudioStore()

  const notDeletedWrongLabels = useMemo(
    () => wrongLabels?.filter((item) => !item?.is_deleted),
    [wrongLabels]
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

  const handleCreateWrongLabel = () => {
    if (allLabelValues?.includes(inputValue)) {
      toast.warning('Nhãn sai này đã tồn tại, vui lòng nhập nhãn khác!')
      setIsInput(false)
      setInputValue('')
      return
    }
    if (inputValue) {
      const newWrongLabels = [
        ...wrongLabels,
        { id: uniqueId(), value: inputValue, is_new: true }
      ]
      useCreateImageLabelingQuizStore.setState({ wrongLabels: newWrongLabels })
    }
    setIsInput(false)
    setInputValue('')
    // Update to quiz form studio
    const convertedLabels = createdLabels?.map((item) => ({
      content: item?.value,
      left: item?.left,
      top: item?.top,
      alignment: item?.alignment,
      is_correct: true,
      is_new: item?.is_new,
      is_deleted: item?.is_deleted
    }))
    const previousWrongLabels = wrongLabels?.map((item) => ({
      content: item?.value,
      is_correct: false,
      is_new: item?.is_new,
      is_deleted: item?.is_deleted
    }))
    const convertedWrongLabels = [
      ...previousWrongLabels,
      { content: inputValue, is_correct: false, is_new: true }
    ]
    setObjQuizFormStudio({
      ...objQuizFormStudio,
      questions_hotspots: {
        data: [...convertedLabels, ...convertedWrongLabels]
      }
    })
  }

  return isInput ? (
    <div className="flex items-center gap-3" ref={container}>
      <span className="inline-block relative after:content-[''] after:absolute after:w-[1px] after:h-[19px] after:bg-[#181D27] after:right-[36px] after:top-[11px]">
        <Input
          placeholder="Thêm nhãn"
          className="max-w-[172px] !border-[#2D7CFB] border-[2px] relative pr-[44px] rounded-lg"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={(event) =>
            event.key === 'Enter' && handleCreateWrongLabel()
          }
        />
        <CornerDownLeft
          className="absolute right-[10px] top-[12px] cursor-pointer"
          color="#535862"
          size={16}
          onClick={handleCreateWrongLabel}
        />
      </span>
      <Trash
        color="#B42318"
        size={16}
        className="cursor-pointer"
        onClick={() => {
          setIsInput(false)
          setInputValue('')
        }}
      />
    </div>
  ) : (
    <Button
      disabled={notDeletedWrongLabels?.length >= 10}
      className="inline-flex items-center gap-1 border-[#D5D7DA] py-[9px] px-[13px] rounded-lg h-[40px] hover:bg-white"
      onClick={() => setIsInput(true)}
    >
      <Plus size={20} color="#414651" />
      <span className="text-[#414651] font-semibold">Thêm</span>
    </Button>
  )
}

export default AddWrongLabel
