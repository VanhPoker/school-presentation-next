import { useCreateImageLabelingQuizStore } from '@/stores/use-create-image-labeling-quiz'
import EditWrongLabel from './EditWrongLabel'

type Props = {
  id: string
  value: string
}

const WrongLabel = ({ id, value }: Props) => {
  const { activeWrongLabelId } = useCreateImageLabelingQuizStore()

  return activeWrongLabelId === id ? (
    <EditWrongLabel value={value} />
  ) : (
    <div
      className="rounded-lg border-2 border-solid border-[#2D7CFB] py-[6px] px-[10px] cursor-pointer max-w-[172px] overflow-hidden text-ellipsis whitespace-nowrap"
      title={value}
      onClick={() =>
        useCreateImageLabelingQuizStore.setState({ activeWrongLabelId: id })
      }
    >
      {value}
    </div>
  )
}

export default WrongLabel
