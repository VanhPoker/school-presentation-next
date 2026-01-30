import React, { useEffect, useRef, useState } from 'react'
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react'
import { cn } from '@/lib/utils'
import { ARRAY_BORDER_INPUT_COLOR } from '@/mock-data/quiz-studio'
import { useQuizFormStudioStore } from '@/stores/use-quiz-studio-store'
import { QUIZ_TYPE } from '@/types/quiz-studio'
import { useEditorInstanceStore } from '@/stores/use-editor-instance-store'
import { useEditorStore } from '@/stores/use-editor-state-store'
import { convertQuillToString } from '@/utils/convertQuillToString'
import { useDroppable } from '@dnd-kit/core'
import { Drop_Type } from '@/components/quiz-studio/quiz-rehearsal/quiz-types/matching/type'
import { isEmpty } from 'lodash-es'
import InputEdit from './input-edit'
import InputList from './input-list'
import InputPractiseFill from './input-practise-fill'
import InputPractiseDrag from './input-practise-drag'
import InputPractiseDrop from './input-practise-drop'

export interface InputChildProps {
  isTable?: boolean
  valueInput?: string
  item_drop?: any
  childrenList?: any
  latexValue?: string
  id?: string
  handleChangeInputValue?: (value: string, id?: string) => void
  handleAddContentAnswer?: () => void
  handleNodeRemove?: () => void
}

export default function InputFillDragDrop({
  deleteNode,
  updateAttributes,
  // getPos,
  node,
  editor
}: NodeViewProps) {
  const {
    id,
    quizId,
    is_correct,
    description,
    fill_order,
    content,
    item_drop,
    children
    // is_new,
  } = node.attrs

  const { setIdAnswerDelete, setObjAnswerContent } = useQuizFormStudioStore()
  const { setActiveEditorId } = useEditorInstanceStore()
  const { latexValueModal } = useEditorStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [, setIsFocused] = useState(false)
  const [boderColor, setBorderColor] = useState<string>('')
  const [valueInput, setValueInput] = useState<string>('')
  const [isEdit, setIsEdit] = useState(false)
  const [isList, setIsList] = useState(false)
  const [isPractise, setIsPractise] = useState(false)
  const [isFill, setIsFill] = useState(false)
  const [isDrag, setIsDrag] = useState(false)
  const [isDrop, setIsDrop] = useState(false)
  const [currentIdAnswer, setCurrentIdAnswer] = useState<string>('')
  const [isTable] = useState(editor.isActive('table'))
  const [dropType, setDropType] = useState<string>(Drop_Type.empty)
  const isContentTextSet = useRef(false)

  const { setNodeRef, isOver } = useDroppable({
    id: 'input-drop-zone-' + id,
    data: {
      id: id,
      type: dropType
    }
  })

  const handleAddContentAnswer = () => {
    setIsFocused(false)
  }

  const handleNodeRemove = () => {
    setIdAnswerDelete(id)
    deleteNode()
  }

  const handleChangeInputValue = (value: string, id?: string) => {
    const finalValueInput = '<p>' + convertQuillToString(value) + '</p>'
    setValueInput(finalValueInput)
    if (isEdit) {
      setObjAnswerContent({
        fill_order: fill_order,
        content: finalValueInput
      })
    }
    if (isEdit || (isPractise && isDrag)) {
      updateAttributes({
        ...node.attrs,
        content: finalValueInput
      })
    }
    if (isPractise && isFill) {
      updateAttributes({
        ...node.attrs,
        item_drop: {
          ...node.attrs.item_drop,
          content: finalValueInput
        }
      })
    }
    if (isPractise && isDrop) {
      const checkItem = children.find((x: any) => {
        return x.id === id
      })
      if (checkItem) {
        const { fill_order, is_correct } = checkItem
        updateAttributes({
          ...node.attrs,
          item_drop: {
            ...node.attrs.item_drop,
            content: finalValueInput,
            fill_order: fill_order,
            is_correct: is_correct,
            answer_id: id
          }
        })
      }
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
    setActiveEditorId(id)
  }

  const handleBlur = () => {
    setIsFocused(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const data = e.dataTransfer.getData('text/plain').split('+')
    const id = data[0]
    const content = data[1]
    const id_ques = 'fill-drag-drop-' + quizId
    const string_ques_data = localStorage.getItem(id_ques)
    if (string_ques_data) {
      const raw_ques_data = JSON.parse(string_ques_data)
      const fomat_ques_data = raw_ques_data.map((x: any) => {
        if (x.id === id) {
          x.is_disabled = true
        }
        if (x.id === currentIdAnswer) {
          x.is_disabled = false
        }
        return { ...x }
      })
      localStorage.setItem(id_ques, JSON.stringify(fomat_ques_data))
      window.dispatchEvent(
        new CustomEvent('fill-drag-drop-updated', {
          detail: { quizId }
        })
      )
      setCurrentIdAnswer(id || '')
      setValueInput(content || '')
      updateAttributes({
        ...node.attrs,
        id: id,
        content: content
      })
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  useEffect(() => {
    setTimeout(() => {
      if (inputRef.current) {
        const selection = window.getSelection()
        const range = document.createRange()
        range.selectNodeContents(inputRef.current)
        range.collapse(false)
        selection?.removeAllRanges()
        selection?.addRange(range)
        if (editor.isEditable) {
          inputRef.current.focus()
        }
      }
    }, 0)
  }, [])

  useEffect(() => {
    if (fill_order) {
      const bordercolor = ARRAY_BORDER_INPUT_COLOR[fill_order - 1]
      setBorderColor(bordercolor || '')
    }
  }, [fill_order])

  useEffect(() => {
    if (description) {
      if (description.includes(QUIZ_TYPE.fill_in_the_blank)) {
        setIsFill(true)
        setIsDrag(false)
        setIsDrop(false)
      }
      if (description.includes(QUIZ_TYPE.drag_and_drop)) {
        setIsFill(false)
        setIsDrag(true)
        setIsDrop(false)
      }
      if (description.includes(QUIZ_TYPE.drop_box)) {
        setIsFill(false)
        setIsDrag(false)
        setIsDrop(true)
      }
      if (description.includes('practise')) {
        setIsPractise(true)
        setIsEdit(false)
        setIsList(false)
      }
      if (description.includes('edit')) {
        setIsEdit(true)
        setIsPractise(false)
        setIsList(false)
      }
      if (description.includes('list')) {
        setIsList(true)
        setIsEdit(false)
        setIsPractise(false)
      }
    }
  }, [description])

  useEffect(() => {
    if (!isContentTextSet.current) {
      if (content) {
        setValueInput(content)
      } else {
        setValueInput('')
      }
      isContentTextSet.current = true
    }
  }, [content])

  useEffect(() => {
    if (isEmpty(item_drop)) {
      setDropType(Drop_Type.empty)
    } else {
      setValueInput(item_drop.content || '')
      // if (isFill) {
      //   setValueInput(item_drop.content)
      // }
      setDropType(Drop_Type.replace)
    }
  }, [item_drop])

  return (
    <NodeViewWrapper
      className={cn('inline-block', isTable && 'max-w-full')}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onBlur={handleBlur}
      onFocus={handleFocus}
    >
      {isEdit && (
        <div
          contentEditable="false"
          suppressContentEditableWarning
          className="isEdit rounded-lg transition-all border-2 bg-white px-1 py-0 mx-1 mb-1 h-9"
          style={{ borderColor: boderColor }}
        >
          <InputEdit
            isTable={isTable}
            valueInput={valueInput}
            latexValue={latexValueModal}
            id={id}
            handleChangeInputValue={handleChangeInputValue}
            handleAddContentAnswer={handleAddContentAnswer}
            handleNodeRemove={handleNodeRemove}
          />
        </div>
      )}
      {isList && (
        <div
          contentEditable="false"
          suppressContentEditableWarning
          className="isList rounded-lg transition-all border-2 bg-white px-1 py-1 mx-1 mb-1 min-h-9"
        >
          <InputList isTable={isTable} valueInput={valueInput} />
        </div>
      )}
      {isPractise && isDrag && (
        <div
          ref={setNodeRef}
          contentEditable="false"
          suppressContentEditableWarning
          className={cn(
            `isPractiseDrag rounded-lg transition-all border-2 bg-white px-1 py-0 mx-1 mb-1 min-h-9 cursor-move border-dashed relative`,
            isOver && 'border-blue-500',
            is_correct === false && 'border-red-500',
            is_correct === true && 'border-green-500'
          )}
        >
          <InputPractiseDrag isTable={isTable} item_drop={item_drop} />
        </div>
      )}
      {isPractise && isFill && (
        <div
          contentEditable="false"
          suppressContentEditableWarning
          className={cn(
            'isPractiseFill rounded-lg transition-all border-2 bg-white px-1 py-1 mx-1 mb-1 min-h-9 cursor-text',
            is_correct === false && 'border-red-500',
            is_correct === true && 'border-green-500'
          )}
        >
          <InputPractiseFill
            isTable={isTable}
            valueInput={valueInput}
            handleChangeInputValue={handleChangeInputValue}
          />
        </div>
      )}
      {isPractise && isDrop && (
        <div
          contentEditable="false"
          suppressContentEditableWarning
          className={cn(
            'isPractiseDrop rounded-lg transition-all border-2 bg-white px-1 py-0 mx-1 mb-1 min-h-9 cursor-text',
            is_correct === false && 'border-red-500',
            is_correct === true && 'border-green-500'
          )}
        >
          <InputPractiseDrop
            isTable={isTable}
            childrenList={children}
            handleChangeInputValue={handleChangeInputValue}
            item_drop={item_drop}
          />
        </div>
      )}
    </NodeViewWrapper>
  )
}
