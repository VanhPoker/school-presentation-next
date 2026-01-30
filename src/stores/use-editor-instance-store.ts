import { create } from "zustand";

interface EditorInstanceStore {
  activeEditorId: string;
  editor: any;
  setActiveEditorId: (id: string) => void;
  setEditor: (editor: any) => void;
}

export const useEditorInstanceStore = create<EditorInstanceStore>((set) => ({
  activeEditorId: "",
  editor: null,
  setActiveEditorId: (id) => set({ activeEditorId: id }),
  setEditor: (editor) => set({ editor: editor }),
}));
