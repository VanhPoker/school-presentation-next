'use client'

import dynamic from 'next/dynamic'
import { QuizMediaResponse } from '../../quiz-rehearsal/quiz-types/quiz-media-response'
const LatexEditor = dynamic(() => import('@/components/base/latex-editor'), {
  ssr: false
})
const MediaRender = dynamic(() => import('@/components/base/media-render'), {
  ssr: false
})

interface EssayQuizPreviewProps {
  content: any
  content_preview: any
  asset_type: any
  code: any

  hotspots: any
  url: any
}

export default function QuizMediaPreview({
  content,
  content_preview,
  asset_type,
  url,
  code,
  hotspots
}: EssayQuizPreviewProps) {
  return (
    <div className="flex flex-col items-center h-full">
      {' '}
      <div
        className={`flex font-semibold ${asset_type ? 'flex-col md:flex-row' : 'items-center justify-center'} gap-6 mb-8 max-w-[768px] mx-auto `}
      >
        {' '}
        {asset_type && (
          <div className="w-full md:w-2/5 border rounded-lg flex-shrink-0">
            <MediaRender
              type={asset_type}
              url={url}
              containerClass="relative aspect-[4/3] w-full"
            />
          </div>
        )}{' '}
        <div
          className={`${asset_type ? 'w-full md:w-3/5' : 'text-center'} flex items-center`}
        >
          <LatexEditor
            content={content || ''}
            content_preview={content_preview}
            showAnswer={false}
            className="[&>*]:!p-0 [&>*]:!min-h-0 [&>*]:!max-w-none font-semibold text-xl"
            is_list={true}
          />
        </div>
      </div>
      <QuizMediaResponse
        item={{
          question_category: { code: code },
          questions_hotspots: hotspots
        }}
      />
    </div>
  )
}
