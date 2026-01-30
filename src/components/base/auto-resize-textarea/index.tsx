// import { mesureTextWithCanvas } from '@/components/global-tools/tools/whiteboard-global-tools/helper'
// import { mesureTextWithCanvas } from '@/components/global-tools/tools/whiteboard-global-tools/helper'
// import { Textarea } from '@/components/ui/textarea'
import {
  ComponentProps,
  useEffect,
  forwardRef,
  useRef,
  useState,
  useImperativeHandle
} from 'react'
type AutoResizeTextArea = ComponentProps<'textarea'> & {
  elementWidth?: number
  onValueChange?: (data: { value: string; height: number }) => void
}
const AutoResizeTextArea = forwardRef<HTMLTextAreaElement, AutoResizeTextArea>(
  ({ onChange, onValueChange, elementWidth = 0, value, ...rest }, ref) => {
    const textAreaRef = useRef<HTMLTextAreaElement>(null)
    const [textAreaHeight, setTextAreaHeight] = useState(() => {
      const initalHeight = 28
      if (!value) return initalHeight
      const numberOfLines = (value as string).split('\n').length
      const newHeight = 28 + 24 * (numberOfLines - 1)
      return newHeight
    })
    const [inputValue, setInputValue] = useState(`${value || ''}`)
    useImperativeHandle(ref, () => {
      return textAreaRef.current!
    })
    useEffect(() => {
      if (!textAreaRef.current) return
      console.log('elementWidth', elementWidth)

      // setTextAreaHeight(textAreaRef.current.clientHeight)
      textAreaRef.current.focus()
      if (!inputValue.length) return
      textAreaRef.current.selectionEnd = inputValue.length
      textAreaRef.current.selectionStart = inputValue.length
    }, [])
    return (
      <textarea
        {...rest}
        value={inputValue}
        onChange={(e) => {
          const textInput = e.currentTarget.value
          const elementHeight = e.currentTarget.scrollHeight
          // if (e.currentTarget.scrollHeight > textAreaHeight) {
          //   textInput = textInput.slice(0, -1) + '\n' + textInput.slice(-1)
          // }
          // const numberOfLines = textInput.split('\n').length
          // const newHeight = 28 + heightOfEachLine * (numberOfLines - 1)
          setInputValue(textInput)
          onValueChange?.({
            height: elementHeight,
            value: textInput
          })
          setTextAreaHeight(elementHeight)
        }}
        style={{
          ...rest.style,
          height: textAreaHeight || '100%'
        }}
        ref={(textArea) => {
          if (!textArea) return
          textAreaRef.current = textArea
        }}
      />
    )
  }
)
AutoResizeTextArea.displayName = 'AutoResizeTextArea'
export default AutoResizeTextArea
