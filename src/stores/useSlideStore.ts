import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { Slide, SlideElement, ElementType } from "@/types/slide";

interface SlideState {
  deckId: string | null;
  slides: Slide[];
  activeSlideId: string;
  selectedElementIds: string[];
  activeTool: string;
  isDragging: boolean;
  scale: number;

  // Actions
  setDeckId: (id: string | null) => void;
  setSlides: (slides: Slide[]) => void;
  addSlide: (newSlide?: Partial<Slide>) => void;
  removeSlide: (id: string) => void;
  setActiveSlide: (id: string) => void;
  updateSlide: (id: string, updates: Partial<Slide>) => void;

  addElement: (element: Partial<SlideElement> & { type: ElementType }) => void;
  removeElements: (ids: string[]) => void;
  updateElement: (id: string, updates: Partial<SlideElement>) => void;

  selectElement: (id: string, multi?: boolean) => void;
  deselectAll: () => void;

  setActiveTool: (tool: string) => void;
  setZoom: (zoom: number) => void;
}

const createInitialSlide = (): Slide => ({
  id: uuidv4(),
  elements: [],
  background: "#ffffff",
});

// Mock initial data
const initialSlides: Slide[] = [
  {
    id: "slide-1",
    elements: [
      {
        id: "el-1",
        type: "text",
        x: 0.2,
        y: 0.3,
        width: 0.6,
        height: 0.2,
        layer: 1,
        content: {
          text: "Hình học không gian",
          color: "#000000",
          fontSize: 48,
          fontFamily: "Inter",
          textAlign: "center",
          fontWeight: "bold",
        },
        style: { color: "#000000" },
      },
      {
        id: "el-2",
        type: "text",
        x: 0.25,
        y: 0.5,
        width: 0.5,
        height: 0.1,
        layer: 2,
        content: {
          text: "Bài 1: Khái niệm cơ bản",
          color: "#666666",
          fontSize: 24,
          fontFamily: "Inter",
          textAlign: "center",
        },
        style: { color: "#666666" },
      },
    ],
  },
  { id: "slide-2", elements: [] },
  { id: "slide-3", elements: [] },
];

export const useSlideStore = create<SlideState>((set, get) => ({
  deckId: null,
  slides: initialSlides,
  activeSlideId: initialSlides[0].id,
  selectedElementIds: [],
  activeTool: "select",
  isDragging: false,
  scale: 1,

  setDeckId: (id) => set({ deckId: id }),
  setSlides: (slides) => set({ slides }),

  addSlide: (newSlide) =>
    set((state) => {
      const slide = { ...createInitialSlide(), ...newSlide };
      return {
        slides: [...state.slides, slide],
        activeSlideId: slide.id,
      };
    }),

  removeSlide: (id) =>
    set((state) => {
      if (state.slides.length <= 1) return state; // Don't remove last slide
      const newSlides = state.slides.filter((s) => s.id !== id);
      return {
        slides: newSlides,
        activeSlideId:
          state.activeSlideId === id ? newSlides[0].id : state.activeSlideId,
      };
    }),

  setActiveSlide: (id) => set({ activeSlideId: id, selectedElementIds: [] }),

  updateSlide: (id, updates) =>
    set((state) => ({
      slides: state.slides.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),

  addElement: (element) =>
    set((state) => {
      const activeSlide = state.slides.find(
        (s) => s.id === state.activeSlideId,
      );
      if (!activeSlide) return state;

      const newElement: SlideElement = {
        id: uuidv4(),
        x: 0.3,
        y: 0.3,
        width: 0.2,
        height: 0.2,
        layer: activeSlide.elements.length + 1,
        ...element,
      } as SlideElement;

      return {
        slides: state.slides.map((s) =>
          s.id === state.activeSlideId
            ? {
                ...s,
                elements: [...s.elements, newElement],
              }
            : s,
        ),
        selectedElementIds: [newElement.id],
        activeTool: "select",
      };
    }),

  removeElements: (ids) =>
    set((state) => ({
      slides: state.slides.map((s) =>
        s.id === state.activeSlideId
          ? {
              ...s,
              elements: s.elements.filter((e) => !ids.includes(e.id)),
            }
          : s,
      ),
      selectedElementIds: state.selectedElementIds.filter(
        (id) => !ids.includes(id),
      ),
    })),

  updateElement: (id, updates) =>
    set((state) => ({
      slides: state.slides.map((s) =>
        s.id === state.activeSlideId
          ? {
              ...s,
              elements: s.elements.map((e) =>
                e.id === id ? { ...e, ...updates } : e,
              ),
            }
          : s,
      ),
    })),

  selectElement: (id, multi = false) =>
    set((state) => ({
      selectedElementIds: multi
        ? state.selectedElementIds.includes(id)
          ? state.selectedElementIds.filter((eid) => eid !== id)
          : [...state.selectedElementIds, id]
        : [id],
    })),

  deselectAll: () => set({ selectedElementIds: [] }),

  setActiveTool: (tool) => set({ activeTool: tool }),
  setZoom: (zoom) => set({ scale: zoom / 100 }),
}));
