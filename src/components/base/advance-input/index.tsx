import { MathInline } from '@/components/admin/admin-create-content-lesson/components/editor-content-lesson/extensions/extension-math'
import { Placeholder } from '@/components/admin/admin-create-content-lesson/components/editor-content-lesson/extensions/extension-placeholder'
import { AnyExtension, EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import './style.scss'
import { KeyboardExtension } from '@/components/admin/admin-create-content-lesson/components/editor-content-lesson/extensions/extension-keyboard'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { X } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
type AdvanceInputProps = {
  placeholder?: string
  value?: string
  className?: string
  disable?: boolean
  loadingImage?: boolean
  isSticky?: boolean
  imageUploadUrl?: string | null
  onRemoveImage?: VoidFunction
  onPressEnter?: (message: string) => void
  onChange?: (message: string) => void
}
export default function AdvanceInput({
  placeholder = 'Nhập nội dung',
  value,
  disable = false,
  loadingImage = false,
  isSticky = true,
  imageUploadUrl = '',
  className = '',
  onPressEnter,
  onRemoveImage,
  onChange
}: AdvanceInputProps) {
  const editor = useEditor({
    immediatelyRender: true,
    onUpdate({ editor }) {
      const text = editor.getText({ blockSeparator: '\n' })
      onChange?.(text)
    },
    extensions: [
      StarterKit.configure({
        gapcursor: false,
        blockquote: false,
        listItem: false,
        horizontalRule: false,
        orderedList: false,
        bulletList: false,
        heading: false
      }) as AnyExtension,
      MathInline.configure({
        clickable: false,
        regex: /(?<!\$)\$\$([^$\n]+)\$\$(?!\$)$/
      }),
      KeyboardExtension.configure({ onPressEnter }),
      Placeholder.configure({ placeholder: placeholder })
    ],
    editorProps: {
      attributes: {
        class: `h-full !pl-4 !pr-8 !py-2`
      }
    }
  })

  useEffect(() => {
    if (!editor) return
    editor.commands.setContent(value || '')
  }, [value])
  useEffect(() => {
    if (disable) {
      editor.commands.setContent('')
    }
    editor.setOptions({ editable: !disable })
  }, [disable])
  return (
    <div
      className={cn(
        'w-full border rounded-[20px] bg-white',
        className,
        isSticky && 'absolute bottom-0 left-0 z-50'
      )}
    >
      {imageUploadUrl && !loadingImage && (
        <figure className="relative w-fit p-2 ">
          <Image
            height={80}
            width={120}
            className="object-contain rounded-lg"
            alt="upload-image"
            src={imageUploadUrl}
          />
          <span
            onClick={onRemoveImage}
            className="border cursor-pointer rounded-full bg-white absolute top-0 right-0 z-20"
          >
            <X size={18} />
          </span>
        </figure>
      )}
      {loadingImage && (
        <div className="p-2 h-20 w-28">
          <Skeleton className="h-full w-full" />
        </div>
      )}
      <EditorContent
        id="advance-input"
        className="min-h-16 max-h-28 overflow-y-auto w-full"
        editor={editor}
      />
    </div>
  )
}
