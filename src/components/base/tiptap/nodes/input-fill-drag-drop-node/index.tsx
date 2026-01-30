import { InputRule, mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import InputFillDragDrop from './component'
import { toasts } from '@/components/ui/toast-color'

const InputFillDragDropRegex = /__$/
const MAX_ANSWERS = 10

function getTotalCorrectAnswers(): number {
  try {
    const quizStudio = localStorage.getItem('quizStudio')
    if (!quizStudio) return 0
    const parsed = JSON.parse(quizStudio)
    const answers = parsed?.state?.arrayQuizzAnswers || []
    return answers.filter((x: any) => x.is_correct && !x.is_deleted).length
  } catch (err) {
    console.error('[fill-drag-drop] Failed to parse quizStudio:', err)
    return 0
  }
}

export default Node.create({
  name: 'fill-drag-drop',
  group: 'inline',
  inline: true,
  atom: false,
  content: 'block*',

  addAttributes() {
    return {
      id: { default: null },
      quizId: { default: null },
      is_correct: { default: null },
      description: { default: null },
      fill_order: { default: null },
      content: { default: null },
      is_new: { default: null },
      is_deleted: { default: null },
      item_drop: { default: null },
      children: { default: null }
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-fill-drag-drop]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['fill-drag-drop', mergeAttributes(HTMLAttributes), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(InputFillDragDrop)
  },

  addInputRules() {
    return [
      new InputRule({
        find: InputFillDragDropRegex,
        //@ts-expect-error todo
        handler: ({ state, range }) => {
          const totalCorrect = getTotalCorrectAnswers()
          if (totalCorrect >= MAX_ANSWERS) {
            toasts.error(`Tối đa ${MAX_ANSWERS} ô trống`)
            return null
          }
          const { tr } = state
          const node = this.type.create()
          tr.replaceRangeWith(range.from, range.to, node)
          return tr
        }
      })
    ]
  }

  // addPasteRules() {
  //   return [
  //     new PasteRule({
  //       find: InputFillDragDropRegex,
  //       //@ts-expect-error todo
  //       handler: ({ state, range }) => {
  //         const totalCorrect = getTotalCorrectAnswers()
  //         if (totalCorrect >= MAX_ANSWERS) {
  //           toasts.error(`Tối đa ${MAX_ANSWERS} ô trống`)
  //           return null
  //         }
  //         const { tr } = state
  //         const node = this.type.create()
  //         tr.replaceRangeWith(range.from, range.to, node)
  //         return tr
  //       }
  //     })
  //   ]
  // }
})
