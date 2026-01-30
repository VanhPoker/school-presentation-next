'use client'
import LatexEditor from '@/components/base/latex-editor'
import { QUIZ_CATEGORY_CODE } from '@/types/quiz-studio'
import Choice from '../../quiz-rehearsal/quiz-types/choice'
import dynamic from 'next/dynamic'
const MediaRender = dynamic(() => import('@/components/base/media-render'), {
  ssr: false
})

interface ChoiceAnswerQuizProps {
  questionAnswers: any[]
  content: any
  content_preview: any
  asset_type: any

  url: any
  code: string
}
export default function ChoiceQuizPreview({
  questionAnswers,
  content,
  content_preview,
  asset_type,
  url,
  code
}: ChoiceAnswerQuizProps) {
  return (
    <div className="flex flex-col">
      <div
        className={`flex font-semibold ${asset_type ? 'flex-col md:flex-row' : 'items-center justify-center'} gap-6 mb-8`}
      >
        {asset_type && (
          <div className="w-full md:w-2/5 border rounded-lg flex-shrink-0">
            <MediaRender
              type={asset_type}
              url={url}
              containerClass="relative aspect-[4/3] w-full"
            />
          </div>
        )}
        <div
          className={`${asset_type ? 'w-full md:w-3/5' : 'text-center'} flex items-center`}
        >
          <LatexEditor
            content={content || ''}
            content_preview={content_preview}
            showAnswer={false}
            className="[&>*]:!p-0 [&>*]:!min-h-0 [&>*]:!max-w-none font-semibold text-sm"
            is_list={true}
          />
        </div>
      </div>
      <Choice
        hotspots={questionAnswers}
        isMultiple={code === QUIZ_CATEGORY_CODE.SINGLE_CHOICE ? false : true}
      />
    </div>
  )
}
