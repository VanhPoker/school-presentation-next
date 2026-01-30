import { cn } from '@/lib/utils'
import { useCreateImageLabelingQuizStore } from '@/stores/use-create-image-labeling-quiz'
import { useMemo } from 'react'

const GeneratedLabels = ({ className }: { className?: string }) => {
  const { createdLabels } = useCreateImageLabelingQuizStore()
  const notDeletedCreatedLabels = useMemo(
    () => createdLabels?.filter((item) => !item?.is_deleted),
    [createdLabels]
  )

  const renderGeneratedLabels = () => {
    if (notDeletedCreatedLabels?.length === 0)
      return (
        <h5 className="text-[#717680]">Bấm vào hình ảnh để thêm nhãn dán</h5>
      )
    return notDeletedCreatedLabels?.map((item) => (
      <div
        key={item?.id}
        className="rounded-lg border-2 border-solid border-[#2D7CFB] py-[6px] px-[10px] max-w-[172px] overflow-hidden text-ellipsis whitespace-nowrap"
        title={item?.value}
      >
        {item?.value}
      </div>
    ))
  }

  return (
    <div className={cn(className)}>
      <h6 className="text-[#181D27] font-semibold text-base mb-3">
        Nhãn dán đúng
      </h6>
      <div className="flex gap-2 flex-wrap">{renderGeneratedLabels()}</div>
    </div>
  )
}

export default GeneratedLabels
