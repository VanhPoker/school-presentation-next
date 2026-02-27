import { v4 as uuidv4 } from 'uuid'

export default function useQuizStudioEditor() {
  const InputfillDragDropNodes = ['fill-drag-drop']

  const isValidJSON = (str: string) => {
    try {
      JSON.parse(str)
      return true
    } catch {
      return false
    }
  }

  const collectFillDragDrop = (items: any, result: any = []) => {
    let arrays: any = items
    if (isValidJSON(items)) {
      const parseItems = JSON.parse(items)
      arrays = parseItems
    }
    arrays.forEach((node: any) => {
      if (!node) return node
      if (InputfillDragDropNodes.includes(node.type)) {
        result.push(node)
      }
      if (Array.isArray(node.content) && node.content.length > 0) {
        collectFillDragDrop(node.content, result)
      }
    })
    return result
  }

  const updateFillDragDrop = (
    items: any,
    is_list: boolean | undefined,
    is_practise: boolean | undefined,
    codeQuiz: string | undefined
  ) => {
    return items.map((node: any) => {
      if (!node) return node
      if (InputfillDragDropNodes.includes(node.type)) {
        if (is_list) {
          node.attrs.description = 'list - ' + codeQuiz
        }
        if (is_practise) {
          node.attrs.description = 'practise - ' + codeQuiz
        }
        if (!is_list && !is_practise) {
          node.attrs.description = 'edit - ' + codeQuiz
          if (node.attrs.is_correct === null) {
            node.attrs.is_correct = true
          }
          if (node.attrs.is_new === null) {
            node.attrs.is_new = true
          }
          if (node.attrs.is_deleted === null) {
            node.attrs.is_deleted = false
          }
          if (node.attrs.id === null) {
            node.attrs.id = uuidv4().slice(0, 8)
          }
        }
        return {
          ...node
        }
      }
      if (node.content) {
        return {
          ...node,
          content: updateFillDragDrop(
            node.content,
            is_list,
            is_practise,
            codeQuiz
          )
        }
      }
      return node
    })
  }

  // Modified to accept codeQuiz as 5th parameter (even if not used in this simplified version)
  const replaceDescriptionFillDragDrop = (
    items: any,
    is_list: boolean | undefined,
    is_practise: boolean | undefined,
    id: string | undefined,
    _codeQuiz?: string | undefined // Accept but not use for now
  ) => {
    return items.map((node: any) => {
      if (!node) return node
      if (InputfillDragDropNodes.includes(node.type)) {
        node.attrs.quizId = id ? id : null
        if (is_list) {
          node.attrs.description = node.attrs.description.replace(
            'edit',
            'list'
          )
        }
        if (is_practise) {
          node.attrs.description = node.attrs.description.replace(
            'edit',
            'practise'
          )
        }
        return {
          ...node
        }
      }
      if (node.content) {
        return {
          ...node,
          content: replaceDescriptionFillDragDrop(
            node.content,
            is_list,
            is_practise,
            id,
            _codeQuiz
          )
        }
      }
      return node
    })
  }

  return {
    InputfillDragDropNodes,
    isValidJSON,
    collectFillDragDrop,
    updateFillDragDrop,
    replaceDescriptionFillDragDrop
  }
}
