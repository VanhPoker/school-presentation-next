import { Extended_Hotspots_Insert_Input } from '@/types/quiz-studio'
export interface Custom_Drag_Type extends Extended_Hotspots_Insert_Input {
  is_disabled?: boolean
  attrs?: any
  dropId?: string
  realId?: string
}
export interface MatchingQuizPreview {
  id: number
  is_correct: boolean | null
  child: Custom_Drag_Type[]
}

export interface ItemChildProps {
  item: Custom_Drag_Type
  borderColor?: string
  borderStyle?: string
  checkReadOnly?: boolean
  drag_type?: string
  is_sticky?: boolean
  code?: string
  editClass?: string
  config?: any
  dragHeight?: number
  handleCheckAfterDrop?: (value: number) => void
  handleEmitInputValue?: (id: string, value: string) => void
}

export const Drag_Type = {
  in: 'drag_in',
  out: 'drag_out'
}

export const Drop_Type = {
  empty: 'drop_empty',
  replace: 'drop_replace'
}
