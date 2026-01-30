import { useWhiteboardStore, WhiteboardTool } from '@/stores/use-white-board'
import { X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import WhiteboardRulerLine from './WhiteboardRulerLine'
import { cn } from '@/lib/utils'
// import { calculateRotatedPosition } from '@/helper/calculateRotatedPosition'
type WhiteboardRulerProps = {
  x?: number
  y?: number
  isDrawing?: boolean
  updateRulerPosition?: (data: {
    x: number
    y: number
    width: number
    height: number
    rotate: number
  }) => void
}

function adjustRectangle() {
  // rectangle: { x: number; y: number; width: number; height: number },
  // bottomRightX: number,
  // bottomRightY: number,
  // angle: number
  // const [cx, cy] = [
  //   rectangle.x + rectangle.width / 2,
  //   rectangle.y + rectangle.height / 2
  // ]
  // const rotatedA = calculateRotatedPosition(
  //   rectangle.x,
  //   rectangle.y,
  //   cx,
  //   cy,
  //   angle
  // )
  // if (!rotatedA[0] || !rotatedA[1]) return []
  // const newCenter = [
  //   (rotatedA[0] + bottomRightX) / 2,
  //   (rotatedA[1] + bottomRightY) / 2
  // ]
  // if (!newCenter[0] || !newCenter[1]) return []
  // const newTopLeft = calculateRotatedPosition(
  //   rotatedA[0],
  //   rotatedA[1],
  //   newCenter[0],
  //   newCenter[1],
  //   -angle
  // )
  return []
}
export default function WhiteboardRuler({
  x = 100,
  y = 100,
  isDrawing = false,
  updateRulerPosition
}: WhiteboardRulerProps) {
  const [rulerWidth, setRulerWidth] = useState(520)
  const generateRulerNumbers = useMemo(() => {
    const list: number[] = [10]
    let start = 10
    do {
      start += 50
      list.push(start)
    } while (start <= rulerWidth)
    return list
  }, [rulerWidth])
  const prevRulerWidth = useRef(rulerWidth)
  const { currentTools, updateCurrentTools } = useWhiteboardStore(
    useShallow((state) => ({
      currentTools: state.currentTools,
      updateCurrentTools: state.updateCurrentTools
    }))
  )
  const moveIconRef = useRef<SVGImageElement>(null)
  const rulerMode = useRef<'move' | 'rotate' | 'resize'>(undefined)
  const svgRef = useRef<SVGSVGElement>(null)
  const prevCursorPoint = useRef<{ x: number; y: number; rotate: number }>(
    undefined
  )
  const elementCenterPoint = useRef<{ x: number; y: number }>(undefined)
  const initialAngle = useRef(0)
  const prevAngle = useRef(0)
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
  const { x: xPosition, y: yPosition, rotate: rotateAngle } = currentPosition
  const handleRulerMove = (event: MouseEvent) => {
    if (
      !svgRef.current ||
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
    setCurrentPosition((prev) => ({
      ...prev,
      x: displayX,
      y: displayY
    }))
  }
  const handleRulerRotate = (event: MouseEvent) => {
    if (
      !svgRef.current ||
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
    const validRotation =
      rotate + newRotation >= 0
        ? rotate + newRotation
        : 360 + rotate + newRotation
    prevAngle.current = validRotation
    setCurrentPosition((prev) => ({
      ...prev,
      rotate: validRotation
    }))
  }
  const handleRulerResize = (event: MouseEvent) => {
    if (
      !svgRef.current ||
      !prevCursorPoint.current ||
      !prevPosition.current ||
      rulerMode.current !== 'resize'
    )
      return
    const { x: cursorX, y: cursorY } = prevCursorPoint.current
    const { clientX, clientY } = event
    const radian = (Math.PI * prevAngle.current) / 180
    const pointX = Math.cos(radian) * (clientX - cursorX)
    const pointY = Math.sin(radian) * (clientY - cursorY)
    let validPoint = pointX
    if (Math.abs(pointX) < Math.abs(pointY)) {
      validPoint = pointY
    }
    if (
      prevRulerWidth.current + pointX < 200 ||
      prevRulerWidth.current + Math.round(validPoint) <= 200
    )
      return
    // const centerX = Math.cos((rotateAngle * Math.PI) / 180) * validPoint
    // const centerY = Math.sin((rotateAngle * Math.PI) / 180) * validPoint
    const [newPositionX, newPositionY] = adjustRectangle()
    // {
    //   x: xPosition,
    //   y: yPosition,
    //   width: rulerWidth - 20,
    //   height: 30
    // },
    // cursorX + centerX,
    // cursorY + centerY,
    // rotateAngle
    if (!newPositionX || !newPositionY) return
    setCurrentPosition((prev) => ({
      ...prev,
      x: newPositionX,
      y: newPositionY
    }))
    setRulerWidth(prevRulerWidth.current + Math.round(validPoint))
  }
  const handleMouseUp = (event: MouseEvent) => {
    if (!svgRef.current || !prevCursorPoint.current) return
    const { x: cursorX, y: cursorY } = prevCursorPoint.current
    const { clientX, clientY } = event
    const radian = (Math.PI * prevAngle.current) / 180
    const pointX = Math.cos(radian) * (clientX - cursorX)
    const pointY = Math.sin(radian) * (clientY - cursorY)
    let validPoint = pointX
    if (Math.abs(pointX) < Math.abs(pointY)) {
      validPoint = pointY
    }
    updateRulerPosition?.({
      x: xPosition + (clientX - cursorX),
      y: yPosition + (clientY - cursorY),
      width: rulerWidth + Math.round(validPoint),
      height: 60,
      rotate: Math.round(prevAngle.current)
    })
    if (rulerMode.current === 'move') {
      prevCursorPoint.current = undefined
    }
    rulerMode.current = undefined
    window.removeEventListener('mouseup', handleMouseUp)
    window.removeEventListener('mousemove', handleRulerMove)
    window.removeEventListener('mousemove', handleRulerResize)
    window.removeEventListener('mousemove', handleRulerRotate)
  }

  const handleMouseDown = (
    event: React.MouseEvent<SVGImageElement | SVGSVGElement> | MouseEvent,
    type?: typeof rulerMode.current
  ) => {
    event.stopPropagation()
    if (!svgRef.current || !type) return
    const { clientX, clientY } = event
    rulerMode.current = type
    window.removeEventListener('mousemove', handleRulerMove)
    window.removeEventListener('mousemove', handleRulerRotate)
    window.removeEventListener('mousemove', handleRulerResize)
    window.removeEventListener('mouseup', handleMouseUp)
    switch (type) {
      case 'move': {
        const pointX = clientX
        const pointY = clientY
        prevPosition.current = { x: xPosition, y: yPosition }
        prevCursorPoint.current = {
          x: pointX,
          y: pointY,
          rotate: rotateAngle
        }
        window.addEventListener('mouseup', handleMouseUp)
        window.addEventListener('mousemove', handleRulerMove)
        break
      }
      case 'resize': {
        const pointX = clientX
        const pointY = clientY
        prevPosition.current = { x: xPosition, y: yPosition }
        prevRulerWidth.current = rulerWidth
        prevCursorPoint.current = {
          x: pointX,
          y: pointY,
          rotate: rotateAngle
        }
        window.addEventListener('mouseup', handleMouseUp)
        window.addEventListener('mousemove', handleRulerResize)
        break
      }
      case 'rotate': {
        prevCursorPoint.current = {
          x: clientX,
          y: clientY,
          rotate: rotateAngle
        }
        const rect = svgRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        elementCenterPoint.current = { x: centerX, y: centerY }
        const initDeltaX = clientX - centerX
        const initDeltaY = clientY - centerY
        initialAngle.current =
          (Math.atan2(initDeltaY, initDeltaX) * 180) / Math.PI
        window.addEventListener('mouseup', handleMouseUp)
        window.addEventListener('mousemove', handleRulerRotate)
        break
      }
      default:
    }
  }
  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleRulerMove)
      window.removeEventListener('mousemove', handleRulerResize)
      window.removeEventListener('mousemove', handleRulerRotate)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])
  return (
    <div className={cn(isDrawing && 'pointer-events-none')}>
      <div
        className="flex items-start gap-2 absolute overflow-hidden"
        style={{
          top: Math.round(yPosition),
          left: Math.round(xPosition),
          transformOrigin: `${rulerWidth / 2}px ${60}px`,
          transform: `rotate(${Math.round(rotateAngle)}deg)`
        }}
      >
        <svg
          width={rulerWidth}
          height={120}
          viewBox={`0 0 ${rulerWidth} 120`}
          fill="none"
          ref={svgRef}
          onMouseDown={(e) => {
            handleMouseDown(e, 'move')
          }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="0.5"
            y="1"
            width={rulerWidth}
            height="120"
            rx="4"
            fill="#F5F5F5"
          />
          <WhiteboardRulerLine
            rulerWidth={rulerWidth}
            generateRulerNumbers={generateRulerNumbers}
          />
          {/* Icon xoay */}
          <image
            className="cursor-pointer"
            href="/whiteboard/rotate.svg"
            onMouseDown={(e) => {
              handleMouseDown(e, 'rotate')
            }}
            x={20}
            y={45}
          />
          {/* Icon xoay */}
          {/* Icon di chuyển */}
          <image
            ref={moveIconRef}
            className="cursor-pointer"
            href="/whiteboard/move.svg"
            onMouseDown={(e) => {
              handleMouseDown(e, 'move')
            }}
            x={rulerWidth * 0.5 - 16}
            y={45}
          />
          <image
            className="cursor-pointer"
            href="/whiteboard/resize.svg"
            onMouseDown={(e) => {
              handleMouseDown(e, 'resize')
            }}
            x={rulerWidth - 50}
            y={45}
          />
          <rect
            x="1"
            y="1"
            width={rulerWidth - 1}
            height="121"
            rx="3.5"
            stroke="#E5E5E5"
          />
        </svg>
        <span className="cursor-pointer border border-rose-300 rounded-full">
          <X
            color="red"
            onClick={() => {
              updateCurrentTools(
                currentTools.filter((tool) => tool !== WhiteboardTool.RULER)
              )
            }}
          />
        </span>
      </div>
    </div>
  )
}
