'use client'
import { Editor, EditorContent } from '@tiptap/react'
import './style.scss'

type QuizEditorContentProps = {
  editor: Editor | null
}

export const QuizEditorContent = ({ editor }: QuizEditorContentProps) => {
  return <EditorContent editor={editor} />
}
