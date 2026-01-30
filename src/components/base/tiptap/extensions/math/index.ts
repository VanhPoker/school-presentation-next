import {
  // callOrReturn,
  extensions,
  InputRule,
  mergeAttributes,
  Node,
  PasteRule
} from '@tiptap/core'
import { mathPlugin } from './mathPlugin'
const REGEX_INLINE_MATH_DOLLARS: RegExp = /\$(.+?)\$/
const REGEX_INLINE_MATH_DOLLARS_GlOBAL: RegExp = /\$(.+?)\$/g
interface MathInlineOptions {
  /**
   * Include dollar sign when copy with clipboard
   * @default false
   * @example { includeDollarWhenCopy: true }
   */
  includeDollarWhenCopy: boolean
  regex?: RegExp
  clickable?: boolean
}
export const MathInline = Node.create<MathInlineOptions>({
  name: 'inlineMath',
  group: 'inline math',
  content: 'text*',
  inline: true,
  atom: true,
  addOptions() {
    return {
      includeDollarWhenCopy: false,
      clickable: true
    }
  },
  parseHTML() {
    return [
      {
        tag: 'math-inline'
      }
    ]
  },
  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: (element) => {
          return element.getAttribute('data-latex')
        },
        renderHTML: (attributes) => {
          return {
            'data-latex': attributes.latex
          }
        }
      }
    }
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'math-inline',
      mergeAttributes({ class: 'math-node' }, HTMLAttributes),
      0
    ]
  },
  addProseMirrorPlugins() {
    return [mathPlugin]
  },
  renderText({ node }) {
    if (this.options.includeDollarWhenCopy) {
      return `$${node.textContent}$`
    }
    return node.attrs.latex || node.textContent
  },
  //@ts-expect-error todo
  addCommands() {
    //@ts-expect-error todo
    const commands = extensions.Commands?.config?.addCommands?.()
    const replaceNewlinesOutsideMath = (text: string): string => {
      const parts = text.split(/(\$.*?\$)/) // chia theo từng đoạn toán học
      return parts
        .map((part) => {
          if (part.startsWith('$') && part.endsWith('$')) return part // toán học giữ nguyên
          return part.replace(/\n/g, '<br/>') // đoạn thường mới thay \n
        })
        .join('')
    }
    if (!commands) return false
    return {
      setContent: (content, emitUpdate, parseOptions) => (props) => {
        if (typeof content === 'string') {
          const contentWithBr = replaceNewlinesOutsideMath(content)
          const formatContent = contentWithBr.replace(
            REGEX_INLINE_MATH_DOLLARS_GlOBAL,
            (_, eq) => {
              if (/\\begin{.*matrix}/.test(eq)) {
                return `<math-inline>${eq}</math-inline>`
              } else {
                const cleaned = eq.replace(/\\\\/g, '\\')
                return `<math-inline>${cleaned}</math-inline>`
              }
            }
          )
          // .replaceAll('\\n', '</br>')
          return commands.setContent?.(
            formatContent,
            emitUpdate,
            parseOptions
          )(props)
        }
        return commands.setContent?.(content, emitUpdate, parseOptions)(props)
      }
    }
  },
  addInputRules() {
    return [
      new InputRule({
        find: this.options.regex || REGEX_INLINE_MATH_DOLLARS,
        //@ts-expect-error todo
        handler: ({ state, range, match }) => {
          // const getAttributes = undefined
          const nodeType = this.type as any
          const start = range.from
          const end = range.to
          const $start = state.doc.resolve(start)
          const index = $start.index()
          const $end = state.doc.resolve(end)
          // get attrs
          // const attributes = callOrReturn(getAttributes, undefined, match) || {}
          // check if replacement valid
          if (!$start.parent.canReplaceWith(index, $end.index(), nodeType)) {
            return null
          }
          // perform replacement
          return state.tr.replaceRangeWith(
            start,
            end,
            nodeType.create({ latex: match[0] }, nodeType.schema.text(match[1]))
          )
        }
      })
    ]
  },
  addPasteRules() {
    return [
      new PasteRule({
        find: this.options.regex || REGEX_INLINE_MATH_DOLLARS_GlOBAL,
        //@ts-expect-error todo
        handler: ({ state, range, match }) => {
          // const getAttributes = undefined
          const nodeType = this.type as any
          const start = range.from
          const end = range.to

          const $start = state.doc.resolve(start)
          const index = $start.index()
          const $end = state.doc.resolve(end)
          // get attrs
          // const attributes = callOrReturn(getAttributes, undefined, match) || {}
          // check if replacement valid
          if (!$start.parent.canReplaceWith(index, $end.index(), nodeType)) {
            return null
          }
          // perform replacement
          return state.tr.replaceRangeWith(
            start,
            end,
            nodeType.create({ latex: match[0] }, nodeType.schema.text(match[1]))
          )
        }
      })
    ]
  }
})
