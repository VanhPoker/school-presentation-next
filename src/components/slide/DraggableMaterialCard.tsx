import { ReactElement } from "react";
import { GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Pure UI component for displaying a draggable material card.
 * Following "Package-First" architecture: no store/hook dependencies.
 * All data via props, all actions via callbacks.
 */

export interface MaterialCardData {
  id: string;
  title: string;
  categoryCode: string;
  subjectName?: string;
  thumbnailUrl?: string | null;
}

interface DraggableMaterialCardProps {
  /** Material data to display */
  material: MaterialCardData;
  /** Card display variant */
  variant?: "default" | "compact";
  /** Whether this card is currently being dragged */
  isDragging?: boolean;
  /** Render function for category icon */
  renderCategoryIcon?: (code: string, size: number) => ReactElement;
  /** Get background color for category */
  getBgColor?: (code: string) => string;
  /** Get border color for category */
  getBorderColor?: (code: string) => string;
  /** Callback when double-clicked */
  onDoubleClick?: () => void;
  /** Native drag event handlers from useDragDrop hook */
  dragHandlers?: {
    draggable?: boolean;
    onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
  };
  /** Additional className */
  className?: string;
}

// Default color functions if not provided
const defaultGetBgColor = () => "rgba(200, 200, 200, 0.2)";
const defaultGetBorderColor = () => "rgba(200, 200, 200, 0.5)";
const defaultRenderIcon = (_code: string, size: number) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: 4,
      backgroundColor: "#ddd",
    }}
  />
);

export function DraggableMaterialCard({
  material,
  variant = "default",
  isDragging = false,
  renderCategoryIcon = defaultRenderIcon,
  getBgColor = defaultGetBgColor,
  getBorderColor = defaultGetBorderColor,
  onDoubleClick,
  dragHandlers,
  className,
}: DraggableMaterialCardProps) {
  const { title, categoryCode, subjectName, thumbnailUrl } = material;

  if (variant === "compact") {
    return (
      <div
        {...dragHandlers}
        onDoubleClick={onDoubleClick}
        className={cn(
          "flex items-center gap-2 p-2 rounded-lg cursor-grab active:cursor-grabbing transition-all",
          "border border-transparent hover:border-primary/30 hover:bg-primary/5",
          isDragging && "opacity-50 border-primary ring-2 ring-primary/20",
          className,
        )}
        style={{
          backgroundColor: isDragging ? getBgColor(categoryCode) : undefined,
        }}
      >
        {/* Drag handle */}
        <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />

        {/* Thumbnail */}
        <div
          className="w-10 h-10 rounded flex-shrink-0 flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: getBgColor(categoryCode) }}
        >
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            renderCategoryIcon(categoryCode, 16)
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{title}</p>
          <p className="text-[10px] text-muted-foreground truncate">
            {subjectName || "Chung"}
          </p>
        </div>
      </div>
    );
  }

  // Default variant - card style
  return (
    <div
      {...dragHandlers}
      onDoubleClick={onDoubleClick}
      className={cn(
        "group relative rounded-lg overflow-hidden cursor-grab active:cursor-grabbing transition-all",
        "border-2 border-transparent hover:shadow-md",
        isDragging && "opacity-50 shadow-xl scale-105",
        className,
      )}
      style={{
        borderColor: isDragging ? getBorderColor(categoryCode) : undefined,
      }}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-muted relative overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            className="w-full h-full object-cover"
            alt=""
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: getBgColor(categoryCode) }}
          >
            {renderCategoryIcon(categoryCode, 32)}
          </div>
        )}

        {/* Drag indicator overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
            isDragging && "opacity-100",
          )}
        >
          <div className="bg-white/90 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
            <GripVertical className="w-3 h-3" />
            Kéo thả
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-2 bg-card">
        <h4 className="font-medium text-xs line-clamp-1 mb-1">{title}</h4>
        <Badge
          variant="secondary"
          className="text-[10px] h-5 px-1.5 font-normal"
        >
          {subjectName || "Chung"}
        </Badge>
      </div>
    </div>
  );
}
