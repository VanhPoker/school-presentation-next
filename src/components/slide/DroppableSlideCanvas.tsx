import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Pure UI component for a droppable slide canvas container.
 * Following "Package-First" architecture: no DnD library dependencies here.
 * Parent handles DnD logic and passes state/ref via props.
 */

interface DroppableSlideCanvasProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Canvas content (slides, elements, etc.) */
  children: ReactNode;
  /** Whether something is currently being dragged over */
  isOver?: boolean;
  /** Whether the canvas can accept the current drag item */
  canDrop?: boolean;
  /** Drop ref to attach for DnD */
  dropRef?: React.Ref<HTMLDivElement>;
  /** Text to show when hovering over dropzone */
  dropHintText?: string;
  /** Additional className */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
  /** Data attribute for canvas identification */
  dataCanvasDroppable?: boolean;
}

export function DroppableSlideCanvas({
  children,
  isOver = false,
  canDrop = false,
  dropRef,
  dropHintText = "Thả để thêm học liệu",
  className,
  style,
  dataCanvasDroppable = true,
  onClick,
  ...props
}: DroppableSlideCanvasProps) {
  return (
    <div
      ref={dropRef}
      data-canvas-droppable={dataCanvasDroppable || undefined}
      onClick={onClick}
      className={cn(
        "relative transition-all duration-200",
        isOver && canDrop && "ring-4 ring-primary/50 ring-offset-2",
        canDrop && !isOver && "ring-2 ring-primary/20 ring-offset-1",
        className,
      )}
      style={style}
      {...props}
    >
      {children}

      {/* Drop overlay indicator */}
      {isOver && canDrop && (
        <div className="absolute inset-0 bg-primary/10 pointer-events-none flex items-center justify-center z-50">
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg font-medium">
            {dropHintText}
          </div>
        </div>
      )}
    </div>
  );
}
