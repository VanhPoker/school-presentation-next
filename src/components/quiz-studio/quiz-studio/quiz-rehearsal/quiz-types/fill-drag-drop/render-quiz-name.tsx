import { QUIZ_CATEGORY_CODE } from '@/types/quiz-studio'
import ItemDrop from './item-drop'
type Props = {
  code: string
  array: any[]
  handleChangeInputValue: (id: string, value: string) => void
}

const RenderQuizName = ({ code, array, handleChangeInputValue }: Props) => {
  return (
    <>
      {array ? (
        <div className="flex items-center justify-center flex-wrap">
          {array.map((x: any, i: number) => {
            const { type, text } = x
            if (type === 'fill-drag-drop') {
              let checkReadOnly = false
              let borderStyle = ''
              if (code === QUIZ_CATEGORY_CODE.DRAG_AND_DROP) {
                checkReadOnly = true
                borderStyle = 'border-2 border-dashed'
              }
              return (
                <ItemDrop
                  key={x.attrs.id + i}
                  item={x}
                  borderStyle={borderStyle}
                  checkReadOnly={checkReadOnly}
                  code={code}
                  handleEmitInputValue={handleChangeInputValue}
                />
              )
            }
            return <span key={i}>{text}</span>
          })}
        </div>
      ) : (
        <p className="min-h-7"></p>
      )}
    </>
  )
}

export default RenderQuizName
