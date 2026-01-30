import { ReactElement } from "react";

import { Input } from "@/components/ui/input";
import { Search, Loader2, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DraggableMaterialCard,
  MaterialCardData,
} from "./DraggableMaterialCard";

/**
 * Pure UI component for material drag panel.
 * Following "Package-First" architecture: no store/hook imports.
 * All data and logic controlled via props.
 */

export interface CategoryData {
  code: string;
  name: string;
  count: number;
}

interface MaterialDragPanelProps {
  /** List of categories to display in tabs */
  categories: CategoryData[];
  /** Currently active category code */
  activeCategory: string;
  /** Callback when category changes */
  onCategoryChange: (code: string) => void;
  /** Current search query */
  searchQuery: string;
  /** Callback when search query changes */
  onSearchChange: (query: string) => void;
  /** Filtered materials to display */
  materials: MaterialCardData[];
  /** Whether data is loading */
  isLoading?: boolean;
  /** Callback when material is double-clicked */
  onMaterialDoubleClick?: (material: MaterialCardData) => void;
  /** Render function for category icon */
  renderCategoryIcon?: (code: string, size: number) => ReactElement;
  /** Get background color for category */
  getBgColor?: (code: string) => string;
  /** Get border color for category */
  getBorderColor?: (code: string) => string;
  /** Factory to create drag handlers for each material */
  createDragHandlers?: (material: MaterialCardData) => {
    draggable?: boolean;
    onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
  };
  /** Function to check if material is being dragged */
  isDragging?: (materialId: string) => boolean;
  /** Additional className */
  className?: string;
}

// Default implementations
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
const defaultGetBgColor = () => "rgba(200, 200, 200, 0.2)";
const defaultGetBorderColor = () => "rgba(200, 200, 200, 0.5)";

export function MaterialDragPanel({
  categories,
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  materials,
  isLoading = false,
  onMaterialDoubleClick,
  renderCategoryIcon = defaultRenderIcon,
  getBgColor = defaultGetBgColor,
  getBorderColor = defaultGetBorderColor,
  createDragHandlers,
  isDragging,
  className,
}: MaterialDragPanelProps) {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Search */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Tìm học liệu..."
            className="h-8 pl-8 pr-8 text-xs"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-8 w-8"
              onClick={() => onSearchChange("")}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Category tabs - horizontal scrollable */}
      <div className="border-b border-border">
        <div className="w-full overflow-x-auto custom-scrollbar">
          <div className="flex gap-1 p-2">
            {categories.map((cat) => (
              <button
                key={cat.code}
                onClick={() => onCategoryChange(cat.code)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs whitespace-nowrap transition-colors",
                  activeCategory === cat.code
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {renderCategoryIcon(cat.code, 12)}
                <span>{cat.name}</span>
                <span className="ml-0.5 opacity-70">({cat.count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Drag hint */}
      <div className="px-3 py-2 bg-muted/30 border-b border-border flex items-center gap-2 text-xs text-muted-foreground">
        <GripVertical className="w-3 h-3" />
        <span>Kéo thả học liệu vào slide hoặc double-click để thêm</span>
      </div>

      {/* Material list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-3">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              {searchQuery ? "Không tìm thấy học liệu" : "Chưa có học liệu"}
            </div>
          ) : (
            <div className="space-y-1">
              {materials.map((material) => (
                <DraggableMaterialCard
                  key={material.id}
                  material={material}
                  variant="compact"
                  isDragging={isDragging?.(material.id)}
                  dragHandlers={createDragHandlers?.(material)}
                  renderCategoryIcon={renderCategoryIcon}
                  getBgColor={getBgColor}
                  getBorderColor={getBorderColor}
                  onDoubleClick={() => onMaterialDoubleClick?.(material)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
