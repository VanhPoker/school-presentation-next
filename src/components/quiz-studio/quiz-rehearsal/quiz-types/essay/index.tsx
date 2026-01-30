'use client'
import { useEffect, useRef, useState } from 'react'
import { AnyExtension, useEditor } from '@tiptap/react'
// import '@benrbray/prosemirror-math/dist/prosemirror-math.css'
import 'katex/dist/katex.min.css'
import StarterKit from '@tiptap/starter-kit'
import TextStyle from '@tiptap/extension-text-style'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'

import { TableOfContents } from '@/components/admin/admin-create-content-lesson/components/editor-content-lesson/extensions/toc'
import emojiSuggestion from '@/components/admin/admin-create-content-lesson/components/editor-content-lesson/extensions/extension-emoji/emoji-suggestion'
import Mention from '@tiptap/extension-mention'
import Image from '@tiptap/extension-image'
import ImagesNode from '@/components/admin/admin-create-content-lesson/components/editor-content-lesson/nodes/images/index'
import ExtensionDragHandle from '@/components/admin/admin-create-content-lesson/components/editor-content-lesson/extensions/extension-drag-handle'
import ExampleNode from '@/components/admin/admin-create-content-lesson/components/editor-content-lesson/nodes/example/index'
import MenuNode from '@/components/admin/admin-create-content-lesson/components/editor-content-lesson/nodes/menu/index'
import CalloutNode from '@/components/admin/admin-create-content-lesson/components/editor-content-lesson/nodes/callout'
import BubbleFloatingTableMenu from '@/components/admin/admin-create-content-lesson/components/editor-content-lesson/BubbleFloatingTableMenu'
import { findElementByCursorPosition } from '@/helper/findElementByCursorPosition'
import { MathInline } from '@/components/admin/admin-create-content-lesson/components/editor-content-lesson/extensions/extension-math'
import ColumnExtension from '@/components/admin/admin-create-content-lesson/components/editor-content-lesson/extensions/extension-column'
import { Table } from '@/components/admin/admin-create-content-lesson/components/editor-content-lesson/nodes/table/table'
import { TableRow } from '@/components/admin/admin-create-content-lesson/components/editor-content-lesson/nodes/table/table-row'
import { TableCell } from '@/components/admin/admin-create-content-lesson/components/editor-content-lesson/nodes/table/table-cell'
import { TableHeader } from '@/components/admin/admin-create-content-lesson/components/editor-content-lesson/nodes/table/table-header'
import commandsSuggestionStudyQuiz from '@/components/admin/admin-create-content-lesson/components/editor-content-lesson/extensions/extension-suggestion-study-quiz/commandsSuggestionStudyQuiz'
import CommandsSuggestionStudyQuiz from '@/components/admin/admin-create-content-lesson/components/editor-content-lesson/extensions/extension-suggestion-study-quiz/index'
import { Highlight } from '@/components/admin/admin-create-content-lesson/components/editor-content-lesson/extensions/extension-highlight'
import { QuizEditorContent } from './quiz-editor-content'
import UniqueId from '@/components/admin/admin-create-content-lesson/components/editor-content-lesson/extensions/extension-unique-id'
import { Placeholder } from '@/components/admin/admin-create-content-lesson/components/editor-content-lesson/extensions/extension-placeholder'
import { Heading } from '@/components/admin/admin-create-content-lesson/components/editor-content-lesson/extensions/extension-heading'

type QuizEditorProps = {
  editorRef?: React.RefObject<any>
  handleEssayChange?: (content: string) => void
  externalAnswer?: string
}
const NO_PLACEHOLDER_NODE = ['callout', 'table', 'columnBlock']

const Essay = ({
  editorRef,
  handleEssayChange,
  externalAnswer
}: QuizEditorProps) => {
  const [initialContent] = useState(() => externalAnswer || '')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [selectedPos, setSelectedPos] = useState<number>()
  const [clientRect, setClientRect] = useState<{
    leftHorizontal?: number
    topHorizontal?: number
    leftVertical?: number
    topVertical?: number
    pos?: number
  }>()
  const isFirstUpdate = useRef(true)

  const editor = useEditor({
    immediatelyRender: true,
    extensions: [
      StarterKit.configure({ heading: false }) as AnyExtension,
      Heading,
      ExtensionDragHandle,
      TextStyle,
      Table.configure({
        resizable: false,
        lastColumnResizable: false,
        allowTableNodeSelection: false
      }),
      TableRow,
      TableCell,
      TableHeader,
      Image.configure({ inline: true }),
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline.configure(),
      ColumnExtension,
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (NO_PLACEHOLDER_NODE.includes(node.type.name)) return ''
          return 'Nhập văn bản, hoặc nhấn "/" để nhập thêm các nội dung khác'
        }
      }),
      TableOfContents.configure({
        levels: [1, 2, 3],
        onUpdate() {}
      }),
      CommandsSuggestionStudyQuiz.configure({
        commandsSuggestionStudyQuiz
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention'
        },
        suggestion: emojiSuggestion
      }),
      ImagesNode,
      ExampleNode,
      MenuNode,
      CalloutNode,
      UniqueId.configure({
        attributeName: 'id',
        types: [
          'paragraph',
          'heading',
          'orderedList',
          'bulletList',
          'listItem'
        ],
        createId: () => window.crypto.randomUUID()
      }),
      MathInline
    ],
    editorProps: {
      attributes: {
        class: 'h-full w-full'
      },
      handleDoubleClickOn: (ctx, pos, node, nodePos, event) => {
        const resolve = ctx.state.doc.resolve(pos)
        //@ts-expect-error todo
        if (Array.isArray(resolve.path)) {
          //@ts-expect-error todo
          const hasTableNode = resolve.path.some((item) => {
            return item?.type?.name === 'table'
          })
          if (hasTableNode) {
            const element = findElementByCursorPosition({
              selector: 'td, th',
              x: event.clientX,
              y: event.clientY
            })
            if (!element) return false
            let isFirstRow = false
            let isFirstColumn = false
            if (
              element.parentElement?.tagName === 'TR' &&
              !element.parentElement.previousSibling
            ) {
              isFirstRow = true
            }
            if (!element.previousSibling) {
              isFirstColumn = true
            }
            const { left, top } = element.getBoundingClientRect()
            setClientRect({
              leftHorizontal: isFirstRow
                ? left + element.clientWidth * 0.5 - 13
                : 0,
              topHorizontal: isFirstRow ? top - 10 : 0,
              leftVertical: isFirstColumn ? left - 9 : 0,
              topVertical: isFirstColumn ? top + element.clientHeight - 26 : 0
            })
          }
        }
        return true
      },
      handleClickOn: (ctx, pos, node, nodePos) => {
        if (node.type.name === 'tableCell') {
          setSelectedPos(nodePos)
        }
        setClientRect(undefined)
      },
      handleClick() {
        setClientRect(undefined)
      }
    },
    onUpdate: ({}) => {
      if (isFirstUpdate.current) {
        isFirstUpdate.current = false
        return
      }
      if (handleEssayChange) {
        handleEssayChange(editor?.getText())
      }
    },
    content: initialContent
  })

  useEffect(() => {
    if (!editor) return
    return () => {
      if (editor) {
        editor.destroy()
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [editor])

  useEffect(() => {
    if (editorRef && editor) {
      editorRef.current = editor
    }
  }, [editor, editorRef])

  if (!editor) return null
  return (
    <>
      <QuizEditorContent editor={editor} />
      {clientRect && (
        <BubbleFloatingTableMenu
          resetClientRect={() => {
            setClientRect(undefined)
            setSelectedPos(undefined)
          }}
          editor={editor}
          clientRect={{ ...clientRect, pos: selectedPos }}
        />
      )}
    </>
  )
}

export default Essay
