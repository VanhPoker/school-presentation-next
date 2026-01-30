'use client'
import { PropsWithChildren, useRef, useState } from 'react'
type ResizeElementWrapperProps = {
  onResize: (
    data: { width: number; height: number; top?: number; left?: number },
    type?: PointerDownType
  ) => void
  maxHeight?: number
  position: { x: number; y: number }
  maxWidth?: number
}
type PointerDownType = 'top' | 'bottom' | 'left' | 'right'
export default function ResizeElementWrapper({
  children,
  position,
  onResize
}: PropsWithChildren<ResizeElementWrapperProps>) {
  const [size, setSize] = useState<{ width: number; height: number }>()
  const containerRef = useRef<HTMLDivElement>(null)
  const leftRef = useRef<HTMLSpanElement>(null)
  const prevPosition = useRef(position)
  const rightRef = useRef<HTMLSpanElement>(null)
  const topRef = useRef<HTMLSpanElement>(null)
  const bottomRef = useRef<HTMLSpanElement>(null)
  const pointerDownType = useRef<PointerDownType>(undefined)
  const pointerDownCoor = useRef<{ x: number; y: number }>(undefined)
  const prevSize = useRef<{ width: number; height: number }>(undefined)
  const handlePointerDown = (ev: React.PointerEvent, type: PointerDownType) => {
    pointerDownType.current = type
    pointerDownCoor.current = { x: ev.clientX, y: ev.clientY }
    prevSize.current = size
    prevPosition.current = { ...position }
    ev.currentTarget.setPointerCapture(ev.pointerId)
    switch (type) {
      case 'top':
        topRef.current?.addEventListener('pointermove', handlePointerMove)
        topRef.current?.addEventListener('pointerup', handlePointerUp)
        break
      case 'bottom':
        bottomRef.current?.addEventListener('pointermove', handlePointerMove)
        bottomRef.current?.addEventListener('pointerup', handlePointerUp)
        break
      case 'left':
        leftRef.current?.addEventListener('pointermove', handlePointerMove)
        leftRef.current?.addEventListener('pointerup', handlePointerUp)
        break
      case 'right':
        rightRef.current?.addEventListener('pointermove', handlePointerMove)
        rightRef.current?.addEventListener('pointerup', handlePointerUp)
        break
      default:
        pointerDownType.current = undefined
        ev.currentTarget.releasePointerCapture(ev.pointerId)
        return
    }
  }
  const handlePointerMove = (ev: PointerEvent) => {
    if (!prevSize.current || !pointerDownCoor.current) return
    const { x, y } = pointerDownCoor.current
    const type = pointerDownType.current
    switch (type) {
      case 'right': {
        const newWidth = prevSize.current!.width + (ev.clientX - x)
        if (newWidth <= 400) return
        setSize((prev) => ({
          ...prev,
          height: prev?.height || 0,
          width: newWidth
        }))
        onResize({
          height: prevSize?.current.height || 0,
          width: newWidth
        })
        break
      }
      case 'left': {
        const newWidth = prevSize.current!.width - (ev.clientX - x)
        if (newWidth <= 400) return

        setSize((prev) => ({
          ...prev,
          height: prev?.height || 0,
          width: newWidth
        }))
        onResize(
          {
            height: prevSize?.current.height || 0,
            width: newWidth,
            left: prevPosition.current.x + ev.clientX - x,
            top: prevPosition.current.y
          },
          type
        )
        break
      }
      case 'bottom': {
        const newHeight = prevSize.current!.height + (ev.clientY - y)
        if (newHeight <= 400) return
        setSize((prev) => ({
          ...prev,
          width: prev?.width || 0,
          height: newHeight
        }))
        onResize({
          width: prevSize?.current?.width || 0,
          height: newHeight
        })
        break
      }
      case 'top': {
        const newHeight = prevSize.current!.height - (ev.clientY - y)
        if (newHeight <= 400) return
        setSize((prev) => ({
          ...prev,
          width: prev?.width || 0,
          height: newHeight
        }))
        onResize(
          {
            width: prevSize?.current?.width || 0,
            height: newHeight,
            left: prevPosition.current.x,
            top: prevPosition.current.y + (ev.clientY - y)
          },
          type
        )
        break
      }
      default:
        pointerDownType.current = undefined
        //@ts-expect-error todo
        ev.currentTarget.releasePointerCapture(ev.pointerId)
        break
    }
  }
  const handlePointerUp = (ev: PointerEvent) => {
    pointerDownType.current = undefined
    //@ts-expect-error todo
    ev.currentTarget.releasePointerCapture(ev.pointerId)
    topRef.current?.removeEventListener('pointerup', handlePointerMove)
    bottomRef.current?.removeEventListener('pointerup', handlePointerMove)
    leftRef.current?.removeEventListener('pointerup', handlePointerMove)
    rightRef.current?.removeEventListener('pointerup', handlePointerMove)
  }
  return (
    <div
      ref={(el) => {
        if (containerRef.current || !el) return
        containerRef.current = el
        setSize({ height: el?.clientHeight, width: el?.clientWidth })
      }}
      className="relative z-50"
      style={{ height: size?.height || 'auto', width: size?.width || 'auto' }}
    >
      {children}
      <span
        ref={topRef}
        onPointerDown={(e) => {
          handlePointerDown(e, 'top')
        }}
        className="absolute top-0 left-0 cursor-ns-resize right-0 h-2 z-20"
      ></span>
      <span
        ref={rightRef}
        onPointerDown={(e) => {
          handlePointerDown(e, 'right')
        }}
        className="absolute top-0 right-0 cursor-ew-resize bottom-0 w-2 z-20"
      ></span>
      <span
        ref={leftRef}
        onPointerDown={(e) => {
          handlePointerDown(e, 'left')
        }}
        className="absolute top-0 left-0 cursor-ew-resize bottom-0 w-2 z-20"
      ></span>
      <span
        ref={bottomRef}
        onPointerDown={(e) => {
          handlePointerDown(e, 'bottom')
        }}
        className="absolute left-0 right-0 cursor-ns-resize bottom-0 h-2 z-20"
      ></span>
    </div>
  )
}
