import { useCreateImageLabelingQuizStore } from '@/stores/use-create-image-labeling-quiz'
import AddWrongLabel from './AddWrongLabel'
import { CircleHelp } from 'lucide-react'
import WrongLabel from './WrongLabel'
import { useMemo } from 'react'

const WrongLabels = () => {
  const { wrongLabels } = useCreateImageLabelingQuizStore()

  const notDeletedWrongLabels = useMemo(
    () => wrongLabels?.filter((item) => !item?.is_deleted),
    [wrongLabels]
  )

  return (
    <>
      <h6 className="text-[#181D27] font-semibold text-base mb-3 flex items-center gap-2">
        Nhãn dán không chính xác
        <CircleHelp size={16} color="#A4A7AE" />
      </h6>
      <div className="flex gap-2 flex-wrap">
        {notDeletedWrongLabels?.map((item) => (
          <WrongLabel key={item?.id} id={item?.id} value={item?.value} />
        ))}
        <AddWrongLabel />
      </div>
    </>
  )
}

export default WrongLabels
