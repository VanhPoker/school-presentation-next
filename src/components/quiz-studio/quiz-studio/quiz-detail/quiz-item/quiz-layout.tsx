import Loading from '@/components/base/loading'
import dynamic from 'next/dynamic'
const MediaRender = dynamic(() => import('@/components/base/media-render'), {
  loading: () => (
    <div className="w-screen h-screen grid place-content-center">
      <Loading />
    </div>
  ),
  ssr: false
})
import { cn } from '@/lib/utils'
import { AnswersType } from './quiz-answers'
import { QUIZ_TYPE } from '@/types/quiz-studio'
import 'katex/dist/katex.min.css'
import { Material_Code } from '@/types/material/type'

const LatexEditor = dynamic(() => import('@/components/base/latex-editor'), {
  ssr: false
})

interface QuestionLayoutProps {
  layout?: 1 | 2 | 3 | 4 | 5
  url?: string
  asset_type?: string
  question_category_code?: string
  questions_hotspots?: any[]
  validateQuestion?: string
  colNumber?: number
  showCorrectAnswers?: boolean
  questionBgColor?: 'none' | 'gray'
  hasCheckBox?: boolean
  relativeCheckbox?: boolean
  answerAspectRatio?: '4/3' | '2/1'
  isPreview?: boolean
  content_preview?: string
  quizLayoutClassName?: string
}

export function QuizzLayout({
  layout,
  url,
  asset_type,
  question_category_code,
  questions_hotspots,
  validateQuestion,
  colNumber = 2,
  showCorrectAnswers,
  questionBgColor,
  hasCheckBox,
  relativeCheckbox,
  answerAspectRatio,
  isPreview,
  content_preview,
  quizLayoutClassName
}: QuestionLayoutProps) {
  const renderMediaPart = (cn: string) => {
    return (
      <MediaRender
        url={url ? url : ''}
        type={(asset_type as Material_Code) ?? ''}
        containerClass={cn}
      />
    )
  }
  const renderNameContentPart = () => {
    return (
      <LatexEditor
        content={validateQuestion || ''}
        content_preview={content_preview}
        showAnswer={showCorrectAnswers}
        className={cn(
          '[&>*]:!p-0 [&>*]:!min-h-0 [&>*]:!max-w-none text-center',
          question_category_code !== QUIZ_TYPE.fill_in_the_blank &&
            question_category_code !== QUIZ_TYPE.drag_and_drop &&
            question_category_code !== QUIZ_TYPE.drop_box &&
            '[&_p]:text-left'
        )}
        is_list={true}
      />
    )
  }

  const renderAnswersType = (obj?: any) => {
    return (
      <AnswersType
        code={question_category_code ?? ''}
        answers={questions_hotspots}
        colNumber={colNumber}
        showCorrectAnswers={showCorrectAnswers}
        questionBgColor={questionBgColor}
        hasCheckBox={hasCheckBox}
        relativeCheckbox={relativeCheckbox}
        answerAspectRatio={answerAspectRatio}
        isPreview={isPreview}
        {...obj}
      />
    )
  }

  switch (layout) {
    case 1:
      return (
        <div className="flex flex-col gap-4">
          {url &&
            asset_type &&
            renderMediaPart(
              cn(
                !asset_type.includes('audio') && 'aspect-[4/3]',
                'md:w-[420px] !rounded-md overflow-hidden bg-gray-200'
              )
            )}

          <div
            className={cn(
              questionBgColor === 'gray' && 'bg-gray-100',
              'py-2 px-4 font-semibold text-md rounded-lg ',
              'h-full',
              'space-y-2'
            )}
          >
            {renderNameContentPart()}
          </div>

          {renderAnswersType()}
        </div>
      )
    case 2:
      return (
        <>
          <div className="flex flex-col gap-4 ">
            <div
              className={cn(
                questionBgColor === 'gray' && 'bg-gray-50',
                'py-2 px-4 font-semibold text-md rounded-lg  bg-gray-50',
                (question_category_code === QUIZ_TYPE.fill_in_the_blank ||
                  question_category_code === QUIZ_TYPE.drop_box ||
                  question_category_code === QUIZ_TYPE.drag_and_drop) &&
                  'tiptap',
                quizLayoutClassName
              )}
            >
              {renderNameContentPart()}
            </div>
            {url &&
              asset_type &&
              renderMediaPart(
                cn(
                  !asset_type.includes('audio') &&
                    'max-w-[420px] max-h-[315px]',
                  'sm:w-[420px] !rounded-md overflow-hidden bg-gray-200'
                )
              )}

            {renderAnswersType({ isDetail: true })}
          </div>
        </>
      )
    case 3:
      return (
        <>
          <div className="flex gap-4">
            {url &&
              asset_type &&
              renderMediaPart(
                cn(
                  !asset_type.includes('audio') && 'aspect-[4/3]',
                  'w-[420px] !rounded-md overflow-hidden bg-gray-200'
                )
              )}
            <div className="flex flex-col gap-6 w-full">
              <div
                className={cn(
                  questionBgColor === 'gray' && 'bg-gray-100',
                  'py-2 px-4 font-semibold text-md rounded-lg ',
                  'h-full',
                  'space-y-2'
                )}
              >
                {renderNameContentPart()}
              </div>

              {renderAnswersType()}
            </div>
          </div>
        </>
      )
    case 4:
      return (
        <>
          <div className="flex flex-col gap-4">
            <div className={cn('flex justify-between gap-4 w-full  py-3 px-4')}>
              <div
                className={cn(
                  'font-semibold text-md tiptap w-full rounded-lg ',
                  'h-full',
                  'space-y-2',
                  questionBgColor === 'gray' && 'bg-gray-50'
                )}
              >
                {renderNameContentPart()}
              </div>
              {url && asset_type && (
                <>
                  {renderMediaPart(
                    cn(
                      !asset_type.includes('audio') &&
                        '!aspect-[4/3] h-[180px] shrink-0',
                      'w-[240px] !rounded-md overflow-hidden bg-gray-50'
                    )
                  )}
                </>
              )}
            </div>

            {renderAnswersType({ isDetail: true })}
          </div>
        </>
      )
    case 5:
      return (
        <>
          <div className="flex flex-col gap-3">
            <div
              className={cn(
                'grid gap-4',
                asset_type && url ? 'grid-cols-2' : 'grid-cols-1'
              )}
            >
              {url &&
                asset_type &&
                renderMediaPart(
                  cn(
                    !asset_type.includes('audio') && 'aspect-[4/3]',
                    'w-[1/2] !rounded-md overflow-hidden bg-gray-200'
                  )
                )}
              <div className="w-full h-full flex items-center">
                <div className="h-fit w-full">
                  <div
                    className={cn(
                      questionBgColor === 'gray' && 'bg-gray-100',
                      'py-2 px-4 font-semibold text-md rounded-lg ',
                      'h-full',
                      'space-y-2'
                    )}
                  >
                    {renderNameContentPart()}
                  </div>
                </div>
              </div>
            </div>

            {renderAnswersType()}
          </div>
        </>
      )
    default:
      return null
  }
}
