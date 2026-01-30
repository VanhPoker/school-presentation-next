'use client'

import dynamic from 'next/dynamic'
import Essay from '../../quiz-rehearsal/quiz-types/essay'
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

  url: any
}

export default function EssayQuizPreview({
  content,
  content_preview,
  asset_type,
  url
}: EssayQuizPreviewProps) {
  return (
    <div className="flex flex-col items-center h-full px-6">
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
      <div className="border border-solid border-[#D5D7DA] mx-6 rounded-xl w-full h-full">
        <Essay />
      </div>
    </div>
  )
}
