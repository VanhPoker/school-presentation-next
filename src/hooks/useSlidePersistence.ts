/**
 * Slide Persistence Hook
 * Syncs Zustand store with backend API with auto-save functionality.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useSlideStore } from "@/stores/useSlideStore";
import {
  getSlides,
  getElements,
  createElement,
  updateElement,
  deleteElement,
  createSlide,
  updateSlide,
  deleteSlide as apiDeleteSlide,
  mapApiSlideToFrontend,
  mapFrontendElementToApi,
  ApiSlideElement,
} from "@/api/slideApi";
import { Slide, SlideElement } from "@/types/slide";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface UseSlidePersistenceOptions {
  deckId: string;
  autoSaveDelayMs?: number;
  onError?: (error: Error) => void;
}

/**
 * Hook to manage slide persistence with auto-save.
 *
 * Usage:
 * ```tsx
 * const { saveStatus, loadDeck, saveCurrentSlide } = useSlidePersistence({
 *   deckId: "123",
 *   onError: (e) => toast.error(e.message),
 * });
 * ```
 */
export function useSlidePersistence({
  deckId,
  autoSaveDelayMs = 1500,
  onError,
}: UseSlidePersistenceOptions) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isLoading, setIsLoading] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingChangesRef = useRef<Map<string, Partial<SlideElement>>>(
    new Map(),
  );

  // Stabilize onError callback
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const { slides, setSlides, activeSlideId } = useSlideStore();

  // Track element IDs that exist in backend
  const backendElementIdsRef = useRef<Set<string>>(new Set());

  // ============ Load deck ============
  const loadDeck = useCallback(async () => {
    if (!deckId) return;

    setIsLoading(true);
    try {
      const apiSlides = await getSlides(deckId);

      // Load elements for each slide
      const frontendSlides: Slide[] = await Promise.all(
        apiSlides.map(async (apiSlide) => {
          const elements = await getElements(apiSlide.id);

          // Track backend element IDs
          elements.forEach((el) => backendElementIdsRef.current.add(el.id));

          return mapApiSlideToFrontend(apiSlide, elements);
        }),
      );

      // If no slides exist, create initial empty slide
      if (frontendSlides.length === 0) {
        const newSlide = await createSlide({
          deck_id: deckId,
          page_order: 0,
          layout_type: "blank",
          background: "#ffffff",
        });
        frontendSlides.push({
          id: newSlide.id,
          elements: [],
          background: "#ffffff",
        });
      }

      setSlides(frontendSlides);
      setSaveStatus("saved");
    } catch (error) {
      console.error("Failed to load deck:", error);
      onErrorRef.current?.(error as Error);
      setSaveStatus("error");
    } finally {
      setIsLoading(false);
    }
  }, [deckId, setSlides]);

  // ============ Save element ============
  // Map frontend element ID to backend element ID (for newly created elements)
  const frontendToBackendIdRef = useRef<Map<string, string>>(new Map());
  // Track deleted element IDs to prevent re-creation during auto-save race conditions
  const deletedElementIdsRef = useRef<Set<string>>(new Set());

  const saveElement = useCallback(
    async (slideId: string, element: SlideElement) => {
      // Skip if this element was deleted (prevents race condition with auto-save)
      if (deletedElementIdsRef.current.has(element.id)) {
        console.log(`[Persistence] Skipping deleted element: ${element.id}`);
        return;
      }

      const apiData = mapFrontendElementToApi(element, slideId);

      // Check if this element was already created (has a backend ID mapping)
      const backendId = frontendToBackendIdRef.current.get(element.id);
      const existsInBackend =
        backendId || backendElementIdsRef.current.has(element.id);

      try {
        if (!existsInBackend) {
          // Create new element
          const created = await createElement({
            ...apiData,
            slide_id: slideId,
          });
          // Map frontend ID to backend ID for future updates
          frontendToBackendIdRef.current.set(element.id, created.id);
          backendElementIdsRef.current.add(created.id);
          console.log(
            `[Persistence] Created element: frontend=${element.id} -> backend=${created.id}`,
          );
        } else {
          // Update existing element using the correct backend ID
          const idToUpdate = backendId || element.id;
          await updateElement(idToUpdate, {
            content: apiData.content,
            style: apiData.style,
            position: apiData.position,
            layer_order: apiData.layer_order,
            material_id: apiData.material_id,
          });
          console.log(`[Persistence] Updated element: ${idToUpdate}`);
        }
      } catch (error) {
        console.error("Failed to save element:", error);
        throw error;
      }
    },
    [],
  );

  // ============ Save current slide ============
  const saveCurrentSlide = useCallback(async () => {
    // Skip if no deckId (working with local mock data only)
    if (!deckId) {
      console.log("[Persistence] Skipping save - no deckId");
      setSaveStatus("saved");
      return;
    }

    const activeSlide = slides.find((s) => s.id === activeSlideId);
    if (!activeSlide) return;

    setSaveStatus("saving");

    try {
      // Save all elements in the active slide
      await Promise.all(
        activeSlide.elements.map((el) => saveElement(activeSlide.id, el)),
      );

      // Update slide metadata (background, notes)
      await updateSlide(activeSlide.id, {
        background: activeSlide.background,
        speaker_notes: activeSlide.notes,
      });

      setSaveStatus("saved");
    } catch (error) {
      console.error("Failed to save slide:", error);
      onErrorRef.current?.(error as Error);
      setSaveStatus("error");
    }
  }, [deckId, slides, activeSlideId, saveElement]);

  // ============ Auto-save with debounce ============
  const triggerAutoSave = useCallback(() => {
    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus("idle"); // Show unsaved indicator

    // Set new timeout
    saveTimeoutRef.current = setTimeout(() => {
      saveCurrentSlide();
    }, autoSaveDelayMs);
  }, [saveCurrentSlide, autoSaveDelayMs]);

  // ============ Delete element ============
  const removeElement = useCallback(async (elementId: string) => {
    // Mark as deleted FIRST to prevent race condition with auto-save
    deletedElementIdsRef.current.add(elementId);

    // Get the backend ID (may be different from frontend ID for newly created elements)
    const backendId =
      frontendToBackendIdRef.current.get(elementId) || elementId;

    // Try to delete from backend if it exists there
    if (backendElementIdsRef.current.has(backendId)) {
      try {
        await deleteElement(backendId);
        backendElementIdsRef.current.delete(backendId);
        console.log(`[Persistence] Deleted element from backend: ${backendId}`);
      } catch (error) {
        console.error("Failed to delete element:", error);
        onErrorRef.current?.(error as Error);
        // Remove from deleted set if deletion failed so it can be saved again
        deletedElementIdsRef.current.delete(elementId);
      }
    } else {
      // Element not synced to backend yet, just clean up local mappings
      console.log(
        `[Persistence] Element not in backend, cleaning local only: ${elementId}`,
      );
    }

    // Always clean up the frontend→backend mapping
    frontendToBackendIdRef.current.delete(elementId);
  }, []);

  // ============ Add new slide ============
  const addNewSlide = useCallback(async () => {
    try {
      const newSlide = await createSlide({
        deck_id: deckId,
        page_order: slides.length,
        layout_type: "blank",
        background: "#ffffff",
      });

      return {
        id: newSlide.id,
        elements: [],
        background: "#ffffff",
      } as Slide;
    } catch (error) {
      console.error("Failed to create slide:", error);
      onErrorRef.current?.(error as Error);
      return null;
    }
  }, [deckId, slides.length]);

  // ============ Delete slide ============
  const removeSlide = useCallback(async (slideId: string) => {
    try {
      await apiDeleteSlide(slideId);
    } catch (error) {
      console.error("Failed to delete slide:", error);
      onErrorRef.current?.(error as Error);
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Status
    saveStatus,
    isLoading,

    // Actions
    loadDeck,
    saveCurrentSlide,
    triggerAutoSave,
    removeElement,
    addNewSlide,
    removeSlide,
  };
}
