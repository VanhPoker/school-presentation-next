import { cn } from '@/lib/utils'
import { useWhiteboardStore, WhiteboardTool } from '@/stores/use-white-board'
import { X } from 'lucide-react'
import { memo, useEffect, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
type WhiteboardProtactorProps = {
  x?: number
  y?: number
  offsetLeft?: number
  draggable?: boolean
  offsetTop?: number
  isDrawing?: boolean
  limitArea?: { x: number; y: number }
}
const PROTRACTOR_WIDTH = 500
const PROTRACTOR_HEIGHT = 270
function WhiteboardProtactor({
  x = 100,
  // limitArea,
  isDrawing = false,
  y = 100
}: WhiteboardProtactorProps) {
  const { currentTools, updateCurrentTools } = useWhiteboardStore(
    useShallow((state) => ({
      currentTools: state.currentTools,
      updateCurrentTools: state.updateCurrentTools
    }))
  )
  const rulerMode = useRef<'move' | 'rotate'>(undefined)
  const imageSvgRef = useRef<SVGImageElement>(null)
  const prevCursorPoint = useRef<{ x: number; y: number; rotate: number }>(
    undefined
  )
  const elementCenterPoint = useRef<{ x: number; y: number }>(undefined)
  const initialAngle = useRef(0)
  const prevPosition = useRef<{ x: number; y: number }>({
    x,
    y
  })
  const [currentPosition, setCurrentPosition] = useState<{
    x: number
    y: number
    rotate: number
  }>({
    x,
    y,
    rotate: 0
  })
  const { x: xPosition, y: yPosition, rotate: rotatePosition } = currentPosition
  const handleMouseMove = (event: MouseEvent) => {
    if (
      !imageSvgRef.current ||
      !prevCursorPoint.current ||
      !prevPosition.current ||
      rulerMode.current !== 'move'
    )
      return
    const { x: cursorX, y: cursorY } = prevCursorPoint.current
    const { clientX, clientY } = event

    const pointX = clientX - cursorX
    const pointY = clientY - cursorY
    const displayX = prevPosition.current.x + pointX
    const displayY = prevPosition.current.y + pointY

    // if (displayX < 0) {
    //   displayX = 0;
    // }
    // if (displayY < 0) {
    //   displayY = 0;
    // }
    // if (limitArea && displayX + RULER_WIDTH >= limitArea.x) {
    //   displayX = limitArea.x - RULER_WIDTH;
    // }
    // if (limitArea && displayY + RULER_HEIGHT >= limitArea.y) {
    //   displayY = limitArea.y - RULER_HEIGHT;
    //   return;
    // }
    setCurrentPosition((prev) => ({
      ...prev,
      x: displayX,
      y: displayY
    }))
  }
  const handleMouseRotate = (event: MouseEvent) => {
    if (
      !imageSvgRef.current ||
      !elementCenterPoint.current ||
      rulerMode.current !== 'rotate'
    )
      return
    const { clientX, clientY } = event
    const { x: centerX, y: centerY } = elementCenterPoint.current
    const { rotate } = prevCursorPoint.current!
    const currentDeltaX = clientX - centerX
    const currentDeltaY = clientY - centerY
    const currentAngle =
      (Math.atan2(currentDeltaY, currentDeltaX) * 180) / Math.PI
    const newRotation = currentAngle - initialAngle.current
    setCurrentPosition((prev) => ({
      ...prev,
      rotate: rotate + newRotation
    }))
  }

  const handleMouseUp = () => {
    // e.stopPropagation();
    if (rulerMode.current === 'move') {
      prevCursorPoint.current = undefined
    }
    rulerMode.current = undefined
    window!.removeEventListener('mousemove', handleMouseMove)
    window!.removeEventListener('mousemove', handleMouseRotate)
  }
  const handleMouseDown = (event: any, type?: 'move' | 'rotate') => {
    event.stopPropagation()
    if (!imageSvgRef.current || !type) return
    const { clientX, clientY } = event
    rulerMode.current = type

    switch (type) {
      case 'move': {
        const pointX = clientX
        const pointY = clientY
        prevPosition.current = { x: xPosition, y: yPosition }
        prevCursorPoint.current = {
          x: pointX,
          y: pointY,
          rotate: rotatePosition
        }
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mousemove', handleMouseRotate)
        window.removeEventListener('mouseup', handleMouseUp)
        window.addEventListener('mouseup', handleMouseUp)
        window.addEventListener('mousemove', handleMouseMove)
        break
      }

      case 'rotate': {
        window!.removeEventListener('mousemove', handleMouseMove)
        window!.removeEventListener('mousemove', handleMouseRotate)
        window!.removeEventListener('mouseup', handleMouseUp)
        prevCursorPoint.current = {
          x: clientX,
          y: clientY,
          rotate: rotatePosition
        }
        const rect = imageSvgRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        elementCenterPoint.current = { x: centerX, y: centerY }
        const initDeltaX = clientX - centerX
        const initDeltaY = clientY - centerY
        initialAngle.current =
          (Math.atan2(initDeltaY, initDeltaX) * 180) / Math.PI
        window.addEventListener('mouseup', handleMouseUp)
        window.addEventListener('mousemove', handleMouseRotate)
        break
      }

      default:
        break
    }
  }
  useEffect(() => {
    if (!imageSvgRef) return
    if (!(imageSvgRef.current?.parentNode instanceof SVGElement)) {
      throw new Error('This component must be nested inside a svg')
    }

    return () => {
      window?.removeEventListener('mousemove', handleMouseMove)
      window?.removeEventListener('mouseup', handleMouseUp)
      window?.removeEventListener('mousedown', handleMouseDown)
      window?.removeEventListener('mousemove', handleMouseRotate)
    }
  }, [])
  return (
    <div className={cn(isDrawing && 'pointer-events-none')}>
      <div
        className="flex items-start gap-2 absolute overflow-hidden"
        style={{
          top: yPosition,
          left: xPosition,
          transformOrigin: `250px 250px`,
          transform: `rotate(${rotatePosition}deg)`
        }}
      >
        <svg
          width={PROTRACTOR_WIDTH}
          height={PROTRACTOR_HEIGHT}
          onMouseUp={handleMouseUp}
          viewBox={`0 0 ${PROTRACTOR_WIDTH} ${PROTRACTOR_HEIGHT}`}
        >
          <g>
            <image
              ref={imageSvgRef}
              href="/whiteboard/protractor.svg"
              className="bg-rose-500 cursor-pointer"
              onMouseDown={(e) => {
                handleMouseDown(e, 'move')
              }}
              x={0}
              y={0}
              width={500}
            />
            <image
              className="cursor-pointer"
              href="/whiteboard/rotate.svg"
              onMouseDown={(e) => {
                handleMouseDown(e, 'rotate')
              }}
              x={234}
              y={30}
            />
            <image
              className="cursor-pointer pointer-events-none"
              href="/whiteboard/move.svg"
              // onMouseDown={(e) => {
              //   handleMouseDown(e, "move");
              // }}
              x={234}
              y={200}
            />
          </g>
        </svg>
        <span
          className="border border-red-400 rounded-full cursor-pointer relative right-16"
          onClick={() => {
            updateCurrentTools(
              currentTools.filter((tool) => tool !== WhiteboardTool.PROTRACTOR)
            )
          }}
        >
          <X x={400} color="red" y={0} />
        </span>
      </div>
    </div>
  )
}
export default memo(WhiteboardProtactor)
