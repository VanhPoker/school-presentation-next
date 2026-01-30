import { cn } from '@/lib/utils'
import {
  DndContext,
  DraggableSyntheticListeners,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import styles from './Draggable.module.css'
import { Coordinates, Transform } from '@dnd-kit/utilities'
import {
  useState,
  ReactNode,
  forwardRef,
  useEffect,
  useRef,
  CSSProperties
} from 'react'
import { debounce } from 'lodash-es'
type DraggableWrapperProps = {
  children: ReactNode
  elementDragSize: number
  defaultPosition?: { x: number; y: number }
  onClick?: VoidFunction
  style?: CSSProperties
  handleUpdatePosition?: (data: { x: number; y: number }) => void
  handle?: boolean
}
enum Axis {
  All,
  Vertical,
  Horizontal
}
type DraggableItemProps = {
  handle?: boolean
  children: React.ReactNode
  style?: React.CSSProperties
  buttonStyle?: React.CSSProperties
  axis?: Axis
  top?: number
  left?: number
}
type DraggableProps = {
  axis?: Axis
  dragOverlay?: boolean
  dragging?: boolean
  handle?: boolean
  listeners?: DraggableSyntheticListeners
  style?: React.CSSProperties
  buttonStyle?: React.CSSProperties
  transform?: Transform | null
  isPendingDelay?: boolean
  children?: React.ReactNode
}
export default function DraggableWrapper({
  children,
  style,
  handle = false,
  elementDragSize,
  defaultPosition = { x: 0, y: 0 },
  handleUpdatePosition
}: DraggableWrapperProps) {
  const [{ x, y }, setCoordinates] = useState<Coordinates>(defaultPosition)
  const elementSizeRef = useRef(elementDragSize)
  const positionRef = useRef(defaultPosition)
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 5 }
  })
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { distance: 5 }
  })
  const sensors = useSensors(mouseSensor, touchSensor)
  const Item = DraggableItem
  const handleResize = () => {
    if (window.innerWidth <= positionRef.current.x + elementDragSize) {
      const newCoor = {
        ...positionRef.current,
        x: window.innerWidth - elementDragSize - 54
      }
      setCoordinates(newCoor)
      handleUpdatePosition?.(newCoor)
    }
  }
  useEffect(() => {
    if (defaultPosition.x !== x || defaultPosition.y !== y) {
      setCoordinates(defaultPosition)
    }
  }, [defaultPosition])
  useEffect(() => {
    elementSizeRef.current = elementDragSize
  }, [elementDragSize])
  useEffect(() => {
    window.addEventListener('resize', debounce(handleResize, 200))
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  return (
    <DndContext
      sensors={sensors}
      onDragEnd={({ delta }) => {
        setCoordinates(({ x, y }) => {
          const newCoor = {
            x: x + delta.x,
            y: y + delta.y
          }
          handleUpdatePosition?.(newCoor)
          return newCoor
        })
        positionRef.current = {
          x: x + delta.x,
          y: y + delta.y
        }
      }}
      modifiers={[restrictToWindowEdges]}
    >
      <Item top={y} handle={handle} left={x} style={style}>
        {children}
      </Item>
    </DndContext>
  )
}
const Draggable = forwardRef<HTMLDivElement, DraggableProps>(function Draggable(
  {
    axis,
    dragOverlay,
    dragging,
    handle,
    listeners,
    transform,
    style,
    buttonStyle,
    isPendingDelay = false,
    ...props
  },
  ref
) {
  return (
    <div
      className={cn(
        styles.Draggable,
        dragOverlay && styles.dragOverlay,
        dragging && styles.dragging,
        handle && styles.handle,
        isPendingDelay && styles.pendingDelay
      )}
      style={
        {
          ...style,
          '--translate-x': `${transform?.x ?? 0}px`,
          '--translate-y': `${transform?.y ?? 0}px`
        } as React.CSSProperties
      }
    >
      <div
        {...props}
        aria-label="Draggable"
        data-cypress="draggable-item"
        {...(handle ? {} : listeners)}
        tabIndex={handle ? -1 : undefined}
        ref={ref}
        style={buttonStyle}
      >
        {props.children}
      </div>
    </div>
  )
})
function DraggableItem({
  axis,
  style,
  top,
  left,
  children,
  handle,
  buttonStyle
}: DraggableItemProps) {
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useDraggable({
      id: 'draggable'
    })

  return (
    <Draggable
      ref={setNodeRef}
      dragging={isDragging}
      handle={handle}
      listeners={listeners}
      style={{ ...style, top, left }}
      buttonStyle={buttonStyle}
      transform={transform}
      axis={axis}
      {...attributes}
    >
      {children}
    </Draggable>
  )
}
