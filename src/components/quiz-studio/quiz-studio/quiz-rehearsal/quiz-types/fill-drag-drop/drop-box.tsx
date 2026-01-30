import { memo, useEffect, useState } from 'react'
import { RenderQuestionAnswersProps } from '@/types/quiz-studio'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'
import { isEmpty } from 'lodash-es'
import './style.scss'
const MediaRender = dynamic(() => import('@/components/base/media-render'), {
  ssr: false
})
const QuizStudioEditor = dynamic(
  () => import('@/components/studio/tools/quiz-studio-editor'),
  { ssr: false }
)

const DropBox = ({
  item,
  results,
  config,
  isCorrect,
  handleJSONChange,
  externalAnswers
}: RenderQuestionAnswersProps) => {
  const {
    questions_hotspots,
    question_category,
    file_urls,
    asset_type,
    embedded_url,
    content_preview
  } = item
  const url = file_urls?.url
  const code = question_category?.code
  const [parseContentPreview, setParseContentPreview] = useState<any[]>([])
  const [stringContentPreview, setStringContentPreview] = useState<string>('')

  const handleFomatContent = (items: any, newItems: any) => {
    return items.map((node: any) => {
      if (node.attrs && node.attrs.fill_order) {
        node.attrs.is_correct = null
        node.attrs.item_drop = {
          ...node.attrs,
          content: ''
        }
        const checkItem = newItems.find((x: any) => {
          return x.fill_order === node.attrs.fill_order
        })
        if (checkItem) {
          node.attrs.id = checkItem.id
          node.attrs.children = checkItem.children
        }
      }
      if (node.content) {
        return {
          ...node,
          content: handleFomatContent(node.content, newItems)
        }
      }
      return node
    })
  }

  const handleFomatResult = (
    items: any,
    result: boolean | undefined,
    newItems: any
  ) => {
    return items.map((node: any) => {
      if (node.attrs && node.attrs.fill_order) {
        if (isCorrect !== null || isCorrect !== undefined) {
          node.attrs.is_correct = isCorrect
        } else {
          node.attrs.is_correct = result
        }
        const checkItem = newItems.find((z: any) => {
          return z.hotspots_id === node.attrs.id
        })
        if (checkItem) {
          node.attrs.item_drop = checkItem.item_drop
        }
      }
      if (node.content) {
        return {
          ...node,
          content: handleFomatResult(node.content, result, newItems)
        }
      }
      return node
    })
  }

  useEffect(() => {
    if (!isEmpty(content_preview) && !isEmpty(questions_hotspots)) {
      if (!Array.isArray(questions_hotspots)) return
      const answersWithChildren = [...questions_hotspots]
        ?.sort((a: any, b: any) => a.fill_order - b.fill_order)
        ?.filter((x: any) => {
          return x.children && x.children.length > 0
        })
        ?.map((x: any) => {
          const newChildren = [...x.children].sort((a, b) => {
            if (a.is_correct) return -1
            if (b.is_correct) return 1
            return 0
          })
          return {
            ...x,
            children: newChildren
          }
        })
      const parseContentPreview = JSON.parse(content_preview)
      let fomatContentPreview = handleFomatContent(
        parseContentPreview,
        answersWithChildren
      )
      if (
        externalAnswers &&
        Array.isArray(externalAnswers) &&
        externalAnswers.length > 0
      ) {
        fomatContentPreview = handleFomatResult(
          fomatContentPreview,
          isCorrect,
          externalAnswers
        )
      }
      setTimeout(() => {
        setParseContentPreview(fomatContentPreview)
        setStringContentPreview(JSON.stringify(fomatContentPreview))
      }, 10)
    }
  }, [content_preview, questions_hotspots, externalAnswers, isCorrect, item.id])

  useEffect(() => {
    if (results && results.length > 0) {
      const fomatContentPreview = handleFomatResult(
        parseContentPreview,
        isCorrect,
        results
      )
      setTimeout(() => {
        setParseContentPreview(fomatContentPreview)
        setStringContentPreview(JSON.stringify(fomatContentPreview))
      }, 10)
    }
  }, [results])

  return (
    <div className="w-full h-full relative">
      <div
        className={cn(
          'w-full mx-auto',
          config && config.isInBook ? 'max-w-full' : 'max-w-[1024px]'
        )}
      >
        <div className="flex flex-col lg:flex-row gap-2 px-4 lg:px-0">
          {(url || embedded_url) && (
            <MediaRender
              type={asset_type}
              url={url || embedded_url}
              containerClass="aspect-[4/3] !rounded-md overflow-hidden bg-gray-200 w-full max-w-md lg:max-w-none lg:w-1/3 mx-auto lg:mx-0"
            />
          )}
          <div className="flex-1 space-y-3 flex items-start justify-start flex-col text-slate-900 text-base fill-drag-drop-editor">
            <QuizStudioEditor
              allowEdit={false}
              is_practise={true}
              content={stringContentPreview}
              placeholder="Nhập câu hỏi vào đây"
              fill={false}
              codeQuiz={code || ''}
              handleJSONChange={handleJSONChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(DropBox)
