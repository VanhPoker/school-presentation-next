import WhiteboardProtractor from '@/components/base/white-board-container/WhiteboardProtractor'
import { useWhiteboardStore, WhiteboardTool } from '@/stores/use-white-board'
import { memo } from 'react'
import WhiteboardRuler from './WhiteboardRuler'
type WhiteboardToolsContainerProps = {
  isDrawing?: boolean
  updateRulerPosition?: (data: {
    x: number
    y: number
    rotate: number
    width: number
    height: number
  }) => void
}
function WhiteboardToolsContainer({
  isDrawing = false,
  updateRulerPosition
}: WhiteboardToolsContainerProps) {
  const currentTools = useWhiteboardStore((state) => state.currentTools)
  return (
    <>
      {currentTools.includes(WhiteboardTool.PROTRACTOR) && (
        <WhiteboardProtractor isDrawing={isDrawing} />
      )}
      {currentTools.includes(WhiteboardTool.RULER) && (
        <WhiteboardRuler
          isDrawing={isDrawing}
          updateRulerPosition={updateRulerPosition}
        />
      )}
    </>
  )
}
export default memo(WhiteboardToolsContainer)
