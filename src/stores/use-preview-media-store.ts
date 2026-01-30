import { create } from 'zustand'

type PreviewMediaStore = {
  url: string
  type: string
  isFullScreenInit: boolean

  setUrl: (url: string) => void
  setType: (type: string) => void
  toggleFullScreenInit: (check: boolean) => void
}

export const usePreviewMediaStore = create<PreviewMediaStore>((set) => {
  return {
    url: '',
    type: '',
    isFullScreenInit: false,

    setUrl: (url) => {
      set({ url: url })
    },
    setType: (type) => {
      set({ type: type })
    },
    toggleFullScreenInit: (check) => {
      set({ isFullScreenInit: check })
    }
  }
})
