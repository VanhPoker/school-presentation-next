import { cn } from '@/lib/utils'
import { useMemo } from 'react'
import DOMPurify from 'dompurify'
import dynamic from 'next/dynamic'
import { AnswersLayoutType, Material_Code } from '@/types/material/type'
import RenderTiptapContent from '../../render-tiptap-content'
const MediaRender = dynamic(() => import('@/components/base/media-render'), {
  ssr: false
})
type MutipleChoiceQuizItemProps = {
  onClick: VoidFunction
  answersLayout?: AnswersLayoutType
  isSelected?: boolean
  color?: string
  background?: string
  imageUrl: string
  content: string
  assertType?: string
}
export default function MutipleChoiceQuizItem({
  onClick,
  content,
  background,
  color,
  isSelected,
  answersLayout,
  assertType,
  imageUrl
}: MutipleChoiceQuizItemProps) {
  const validateContent = useMemo(() => {
    if (!content) return ''
    return DOMPurify.sanitize(content, { ALLOWED_TAGS: ['math-inline'] })
  }, [content])
  return (
    <figure
      onClick={onClick}
      className={cn(
        'p-4 w-full relative flex items-center justify-center border-2 rounded-lg border-[#D5D7DA] bg-white',
        isSelected && 'border-[#2D7CFB]'
      )}
      style={{
        borderColor: isSelected ? color : undefined,
        backgroundColor: isSelected ? background : undefined
      }}
    >
      {/* <Checkbox className="absolute top-6 right-6 z-20" /> */}
      <div
        className={cn(
          'flex gap-2 w-full h-full',
          answersLayout === AnswersLayoutType.ONE_COLUMN ? '' : 'flex-col'
        )}
      >
        {assertType && imageUrl && (
          <MediaRender
            url={imageUrl}
            type={assertType as Material_Code}
            containerClass="flex-1"
          />
        )}
        {/* {imageUrl && (
          <div className="rounded-lg relative flex-1 max-h-28">
            <img
              alt="image"
              className="object-contain h-full mx-auto"
              src={imageUrl}
            />
          </div>
        )} */}
        {validateContent && (
          <figcaption
            className="p-2 flex-1 text-center flex items-center max-h-40 my-auto overflow-y-auto"
            // dangerouslySetInnerHTML={{ __html: validateContent }}
          >
            <RenderTiptapContent content={validateContent} />
          </figcaption>
        )}
      </div>
    </figure>
  )
}
