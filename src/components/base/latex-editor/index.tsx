import { useEditor, EditorContent, AnyExtension } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { MathInline } from '@/components/admin/admin-create-content-lesson/components/editor-content-lesson/extensions/extension-math'
import { useEffect, useMemo, useRef, useState } from 'react'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import InputFillDragDropNode from '@/components/studio/editor-node/input-fill-drag-drop-node/index'
import { cn } from '@/lib/utils'
import { Highlight } from '@/components/admin/admin-create-content-lesson/components/editor-content-lesson/extensions/extension-highlight'
import './style.scss'
import { TrailingNode } from '@/components/admin/admin-create-content-lesson/components/editor-content-lesson/nodes/trailing'
import DOMPurify from 'dompurify'
import { Table } from '@/components/admin/admin-create-content-lesson/components/editor-content-lesson/nodes/table/table'
import { TableRow } from '@/components/admin/admin-create-content-lesson/components/editor-content-lesson/nodes/table/table-row'
import { TableCell } from '@/components/admin/admin-create-content-lesson/components/editor-content-lesson/nodes/table/table-cell'
import { TableHeader } from '@/components/admin/admin-create-content-lesson/components/editor-content-lesson/nodes/table/table-header'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { Heading } from '@/components/admin/admin-create-content-lesson/components/editor-content-lesson/extensions/extension-heading'
import 'katex/dist/katex.min.css'
import { useEditorStore } from '@/stores/use-editor-state-store'
import { useEditorInstanceStore } from '@/stores/use-editor-instance-store'

interface LatexEditorProps {
  content: string
  content_preview?: any
  onChange?: (value: string) => void
  editable?: boolean
  className?: string
  placeholder?: string
  disableEnter?: boolean
  showAnswer?: boolean
  is_practise?: boolean
  is_list?: boolean
  contentMiddle?: boolean
  latexValue?: string
  id?: string
}

export default function LatexEditor({
  content,
  onChange,
  editable = false,
  className = '',
  disableEnter = false,
  content_preview,
  showAnswer = false,
  is_list = false,
  is_practise = false,
  contentMiddle = false,
  latexValue,
  id
}: LatexEditorProps) {
  const InputNodes = ['fill-drag-drop']
  const isAplliedContent = useRef(false)
  const [currentPos, setCurrentPos] = useState<number>()
  const { clearLatexValueModal } = useEditorStore()
  const { activeEditorId } = useEditorInstanceStore()
  const validateQuestion = useMemo(() => {
    if (content) {
      return DOMPurify.sanitize(content, {
        ALLOWED_TAGS: [
          'p',
          'br',
          'span',
          'strong',
          'math-inline',
          'table',
          'thead',
          'tbody',
          'tr',
          'td',
          'th'
        ],
        ALLOWED_ATTR: ['colspan', 'rowspan', 'style']
      })
    }
    return ''
  }, [content])
  const editor = useEditor({
    editorProps: {
      attributes: {
        class: `!h-full outline-transparent p-3 ${contentMiddle ? 'flex flex-col style-edit' : ''}`
      },

      handleKeyDown: (_, event) => {
        if (disableEnter && event.key === 'Enter') {
          event.preventDefault()
          return true
        }
        return false
      },
      handlePaste: (view, event) => {
        if (event.clipboardData) {
          const text = event.clipboardData.getData('text/plain')
          if (text) {
            if (disableEnter) {
              event.preventDefault()
              const singleParagraph = text.replace(/[\r\n]+/g, ' ')
              view.dispatch(
                view.state.tr.replaceSelectionWith(
                  view.state.schema.text(singleParagraph)
                )
              )
              return true
            }
          }
        }
        return false
      }
    },
    extensions: [
      StarterKit.configure({
        gapcursor: false,
        orderedList: false,
        bulletList: false,
        heading: false
      }) as AnyExtension,
      Heading,
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      //Có cần thẻ link không ?
      // Link.configure({
      //   autolink: true,
      //   defaultProtocol: 'https',
      //   protocols: ['http', 'https']
      // }),
      Highlight.configure({ multicolor: true }),
      Underline,
      //Strike đã có sẵn trong starterkit
      // Strike,
      MathInline.configure({
        regex: /(?<!\$)\$\$([^$\n]+)\$\$(?!\$)$/
      }),
      Subscript,
      Superscript,
      InputFillDragDropNode,
      Table.configure({
        resizable: false,
        lastColumnResizable: false,
        allowTableNodeSelection: false
      }),
      TableRow,
      TableCell,
      TableHeader,
      TrailingNode
    ],
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange?.(html === '<p></p>' ? '' : html)
    },
    onFocus: ({ editor }) => {
      setCurrentPos(editor?.state.selection.from)
    }
  })

  const updateFillDragDrop = (items: any) => {
    return items.map((node: any) => {
      if (InputNodes.includes(node.type)) {
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
        if (!showAnswer) {
          node.attrs.content = ''
        }
        return {
          ...node
        }
      }
      if (node.content) {
        return {
          ...node,
          content: updateFillDragDrop(node.content)
        }
      }
      return node
    })
  }

  useEffect(() => {
    if (!editor) return
    const currentHtml = editor.getHTML()
    if (
      !content_preview &&
      validateQuestion &&
      currentHtml !== validateQuestion &&
      !isAplliedContent.current
    ) {
      editor.commands.setContent(validateQuestion, false, {
        preserveWhitespace: 'full'
      })
    } else if (content_preview) {
      const json = JSON.parse(content_preview)
      editor.commands.setContent(updateFillDragDrop(json))
    }
  }, [editor, validateQuestion, content_preview, showAnswer])

  useEffect(() => {
    if (
      activeEditorId === id &&
      typeof currentPos === 'number' &&
      latexValue &&
      editor &&
      editor?.state.selection.from >= 0
    ) {
      const cleanLatexValue = latexValue.replace(/\$/g, '')
      const convertMathInline = `<math-inline>${cleanLatexValue}</math-inline>`
      editor.commands.insertContentAt(
        editor?.state.selection.from,
        convertMathInline
      )
      clearLatexValueModal()
    }
  }, [latexValue, editor?.state.selection.from, activeEditorId])
  return (
    <div id="latex-editor-content" className="outline-transparent">
      <EditorContent editor={editor} className={cn('cursor-text', className)} />
    </div>
  )
}
