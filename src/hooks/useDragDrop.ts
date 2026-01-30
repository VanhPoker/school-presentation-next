import { useState, useCallback, useRef, DragEvent } from "react";
import { MaterialCardData } from "@/components/slide/DraggableMaterialCard";

/**
 * Prefix for drag-drop data transfer type
 */
export const DRAG_TRANSFER_TYPE = "application/x-slide-material";

/**
 * Hook for creating drag source behavior.
 * Used by MaterialDragPanel to make items draggable.
 */
export function useDragSource(material: MaterialCardData) {
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.dataTransfer.setData(DRAG_TRANSFER_TYPE, JSON.stringify(material));
      e.dataTransfer.effectAllowed = "copy";
      setIsDragging(true);

      // Create custom drag image
      if (dragRef.current) {
        const rect = dragRef.current.getBoundingClientRect();
        e.dataTransfer.setDragImage(
          dragRef.current,
          rect.width / 2,
          rect.height / 2,
        );
      }
    },
    [material],
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  return {
    isDragging,
    dragRef,
    dragHandlers: {
      draggable: true,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
    },
  };
}

/**
 * Hook for creating drop target behavior.
 * Used by SlideEditor canvas to accept material drops.
 */
export function useDropTarget(options: {
  canvasWidth: number;
  canvasHeight: number;
  onDrop: (
    material: MaterialCardData,
    position: { x: number; y: number },
  ) => void;
}) {
  const { canvasWidth, canvasHeight, onDrop } = options;
  const [isOver, setIsOver] = useState(false);
  const [canDrop, setCanDrop] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if it's our type
    if (e.dataTransfer.types.includes(DRAG_TRANSFER_TYPE)) {
      e.dataTransfer.dropEffect = "copy";
      setCanDrop(true);
      setIsOver(true);
    }
  }, []);

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes(DRAG_TRANSFER_TYPE)) {
      setIsOver(true);
      setCanDrop(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // Only set isOver false if we're leaving the canvas element itself
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsOver(false);
      setCanDrop(false);

      const data = e.dataTransfer.getData(DRAG_TRANSFER_TYPE);
      if (!data) return;

      try {
        const material: MaterialCardData = JSON.parse(data);

        // Calculate position relative to canvas
        const rect = dropRef.current?.getBoundingClientRect();
        if (!rect) return;

        // Normalize position (0-1 range)
        let x = (e.clientX - rect.left) / canvasWidth;
        let y = (e.clientY - rect.top) / canvasHeight;

        // Clamp and center the element (assuming 0.3 default size)
        x = Math.max(0, Math.min(0.7, x - 0.15));
        y = Math.max(0, Math.min(0.7, y - 0.15));

        onDrop(material, { x, y });
      } catch (err) {
        console.error("Failed to parse dropped material:", err);
      }
    },
    [canvasWidth, canvasHeight, onDrop],
  );

  return {
    isOver,
    canDrop,
    dropRef,
    dropHandlers: {
      onDragOver: handleDragOver,
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
}

/**
 * Combined hook for managing drag sources for multiple materials.
 * Returns a factory function to create drag handlers per material.
 */
export function useDragSourceFactory() {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const createDragHandlers = useCallback((material: MaterialCardData) => {
    return {
      draggable: true,
      onDragStart: (e: DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData(DRAG_TRANSFER_TYPE, JSON.stringify(material));
        e.dataTransfer.effectAllowed = "copy";
        setDraggingId(material.id);
      },
      onDragEnd: () => {
        setDraggingId(null);
      },
    };
  }, []);

  const isDragging = useCallback(
    (materialId: string) => {
      return draggingId === materialId;
    },
    [draggingId],
  );

  return {
    draggingId,
    createDragHandlers,
    isDragging,
  };
}
