import { create } from "zustand";

interface EditorStateStore {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrike: boolean;
  isSubscript: boolean;
  isSuperscript: boolean;
  latexValueModal: string;
  setIsBold: (val: boolean) => void;
  setIsItalic: (val: boolean) => void;
  setIsUnderline: (val: boolean) => void;
  setIsStrike: (val: boolean) => void;
  setIsSubscript: (val: boolean) => void;
  setIsSuperscript: (val: boolean) => void;
  clearLatexValueModal: () => void;
}

export const useEditorStore = create<EditorStateStore>((set) => ({
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isStrike: false,
  isSubscript: false,
  isSuperscript: false,
  latexValueModal: "",
  setIsBold: (val) => set({ isBold: val }),
  setIsItalic: (val) => set({ isItalic: val }),
  setIsUnderline: (val) => set({ isUnderline: val }),
  setIsStrike: (val) => set({ isStrike: val }),
  setIsSubscript: (val) => set({ isSubscript: val }),
  setIsSuperscript: (val) => set({ isSuperscript: val }),
  clearLatexValueModal: () => set({ latexValueModal: "" }),
}));
