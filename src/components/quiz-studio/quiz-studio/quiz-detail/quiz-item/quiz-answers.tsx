import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { QUIZ_TYPE } from '@/types/quiz-studio'
import { ArrowRightIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { handleGroupByString } from '../../quiz-service'
import { Material_Code } from '@/types/material/type'
import dynamic from 'next/dynamic'
const MediaRender = dynamic(() => import('@/components/base/media-render'), {
  ssr: false
})
const LatexEditor = dynamic(() => import('@/components/base/latex-editor'), {
  ssr: false
})
import RenderTiptapContent from '@/components/base/render-tiptap-content'
interface AnswerType {
  code: string
  answers?: any[]
  colNumber?: number
  showCorrectAnswers?: boolean
  questionBgColor?: 'none' | 'gray'
  hasCheckBox?: boolean
  relativeCheckbox?: boolean
  answerAspectRatio?: '4/3' | '2/1'
  isStudying?: boolean
  onSelectedAnswersChange?: (answers: number[]) => void
  isPreview?: boolean
  allChecked?: boolean
  answersNumber?: number
  resetKey?: number
  isDetail?: boolean
  matchingAnswers?: any
}

export function AnswersType({
  code,
  answers,
  colNumber = 2,
  showCorrectAnswers,
  questionBgColor,
  hasCheckBox,
  relativeCheckbox,
  answerAspectRatio,
  isStudying = false,
  onSelectedAnswersChange,
  resetKey = 0,
  isPreview = false,
  matchingAnswers
}: AnswerType) {
  const [expanded, setExpanded] = useState<boolean>(false)
  // const aiContent = answers && answers[0]?.ai_content_review
  const answerContent = answers?.[0]?.content || 'Câu này chưa có câu trả lời!'
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const answersNumber = answers?.length || 0

  useEffect(() => {
    if (onSelectedAnswersChange) {
      onSelectedAnswersChange(selectedAnswers)
    }
  }, [selectedAnswers, onSelectedAnswersChange])

  useEffect(() => {
    if (matchingAnswers?.[resetKey]) {
      setSelectedAnswers(
        matchingAnswers?.[resetKey]?.results?.map(
          (result: any) => result?.hotspots_id
        ) || []
      )
    } else {
      setSelectedAnswers([])
    }
  }, [resetKey])

  useEffect(() => {
    if (answerContent.length > 500) {
      setExpanded(true)
    }
  }, [answerContent])

  const handleCheckboxChange = (index: number) => {
    if (code === QUIZ_TYPE.single_choice) {
      setSelectedAnswers([index])
    } else {
      setSelectedAnswers((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index]
      )
    }
  }

  const checkHasPic = () => {
    return (
      answers?.some(
        (answer) => answer?.file_urls?.url || answer?.embedded_url
      ) || false
    )
  }

  const handleRenderCheckbox = (
    type: string,
    is_correct: boolean,
    i: number
  ) => {
    return (
      <>
        {hasCheckBox && (
          <Checkbox
            className={cn(
              ' !w-4 !h-4 border-gray-400 focus:outline-none transition-all appearance-none cursor-pointer',
              type === QUIZ_TYPE.single_choice
                ? 'rounded-full'
                : 'border text-white !rounded-sm',
              !isStudying && 'pointer-events-none',
              is_correct
                ? ' '
                : 'data-[state=checked]:border-red-500 data-[state=checked]:bg-red-500',
              type === QUIZ_TYPE.single_choice &&
                'data-[state=checked]:text-transparent data-[state=checked]:bg-white  data-[state=checked]:border-4',
              type === QUIZ_TYPE.single_choice &&
                (is_correct
                  ? '  data-[state=checked]:border-blue-500 '
                  : 'data-[state=checked]:border-red-500'),
              type === QUIZ_TYPE.multiple_answers &&
                '  data-[state=checked]:border-transparent ',
              (type === QUIZ_TYPE.multiple_answers ||
                type === QUIZ_TYPE.multiple_choice) &&
                (is_correct
                  ? '  data-[state=checked]:bg-blue-500 '
                  : 'data-[state=checked]:bg-red-500'),

              relativeCheckbox && 'absolute top-2 right-2'
            )}
            checked={
              isStudying ? selectedAnswers.includes(i) : showCorrectAnswers
            }
            isCorrect={is_correct}
            onCheckedChange={() => isStudying && handleCheckboxChange(i)}
          />
        )}
      </>
    )
  }
  const handlePicAnswer = (hasPic: boolean, type: string) => {
    switch (hasPic) {
      case true:
        return (
          <>
            <div
              className={cn(
                'gap-4 grid h-fit max-h-fit grid-cols-1',
                colNumber === 1 && 'grid-cols-1',
                colNumber === 2 && 'xl:grid-cols-2',
                colNumber === 3 && 'xl:grid-cols-3',
                colNumber === 4 && 'xl:grid-cols-4',

                answersNumber <= colNumber && 'grid-rows-1',
                answersNumber > colNumber &&
                  answersNumber <= 2 * colNumber &&
                  'grid-rows-2',
                answersNumber > 2 * colNumber &&
                  answersNumber <= 3 * colNumber &&
                  'grid-rows-3',
                answersNumber > 3 * colNumber &&
                  answersNumber <= 4 * colNumber &&
                  'grid-rows-4'
              )}
            >
              {answers?.map((answer, i) => {
                const { content, asset_type, is_correct } = answer
                const url = answer.file_urls?.url
                  ? answer.file_urls.url
                  : answer.embedded_url
                const matchingResult = matchingAnswers
                  ?.flatMap((ma: any) => ma?.results)
                  ?.find(
                    (result: any) => result?.hotspots_id === answer.id
                  )?.is_correct
                return (
                  <div
                    key={i + 1}
                    className={cn(
                      'flex items-center p-2 ',
                      relativeCheckbox &&
                        'relative flex-col border-[1px] rounded-xl ',
                      relativeCheckbox &&
                        hasCheckBox &&
                        (url ? 'pt-8' : 'justify-center'),
                      showCorrectAnswers &&
                        relativeCheckbox &&
                        selectedAnswers.includes(i) &&
                        is_correct &&
                        (hasCheckBox
                          ? 'border-blue-500 border-2'
                          : 'bg-green-50 border-2 border-green-500'),
                      showCorrectAnswers &&
                        relativeCheckbox &&
                        selectedAnswers.includes(i) &&
                        !is_correct &&
                        (hasCheckBox
                          ? 'border-red-500 border-2'
                          : 'bg-red-50 border-2 border-red-500'),
                      (isStudying || isPreview) &&
                        ' border-gray-300 rounded-lg p-2 aspect-[4/3] items-center justify-center cursor-pointer',
                      showCorrectAnswers &&
                        matchingResult === true &&
                        'border-green-500 bg-green-50 border-2',
                      showCorrectAnswers &&
                        matchingResult === false &&
                        'border-red-500 bg-red-50 border-2',
                      !showCorrectAnswers &&
                        selectedAnswers.includes(i) &&
                        'border-blue-500 border-2'
                    )}
                  >
                    {url && (
                      <MediaRender
                        url={url}
                        type={asset_type as Material_Code}
                        containerClass={cn(
                          asset_type !== 'audios' &&
                            (answerAspectRatio === '2/1' ? 'aspect-[2/1]' : ''),
                          asset_type !== 'audios' &&
                            (answerAspectRatio === '4/3' ? 'aspect-[4/3]' : ''),
                          asset_type === 'audios' ? 'p-3' : 'w-full',
                          'max-w-[200px]  !rounded-xl overflow-hidden mb-2 bg-gray-50 flex-grow-0 flex-shrink-0 cursor-pointer ',
                          !relativeCheckbox && hasCheckBox && 'mr-4',
                          relativeCheckbox && 'w-full'
                        )}
                        isMini={true}
                      />
                    )}
                    {handleRenderCheckbox(type, is_correct, i)}

                    <div
                      className={cn(
                        'font-medium text-md text-gray-600 break-words overflow-hidden w-full flex items-center text-left ',
                        (isPreview || isStudying) && 'justify-center'
                      )}
                      style={{
                        wordWrap: 'break-word',
                        whiteSpace: 'normal',
                        padding: '0 0.5rem'
                      }}
                    >
                      <RenderTiptapContent content={content} />
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )
      case false:
        return (
          <>
            <div
              className={cn(
                'gap-4 grid h-fit max-h-fit grid-cols-1',
                colNumber === 1 && 'grid-cols-1',
                colNumber === 2 && 'xl:grid-cols-2',
                colNumber === 3 && 'xl:grid-cols-3',
                colNumber === 4 && 'xl:grid-cols-4',
                answersNumber <= colNumber && 'grid-rows-1',
                answersNumber > colNumber &&
                  answersNumber <= 2 * colNumber &&
                  'grid-rows-2',
                answersNumber > 2 * colNumber &&
                  answersNumber <= 3 * colNumber &&
                  'grid-rows-3',
                answersNumber > 3 * colNumber &&
                  answersNumber <= 4 * colNumber &&
                  'grid-rows-4'
              )}
            >
              {answers?.map((answer, i) => {
                const { content, is_correct } = answer
                const matchingResult = matchingAnswers
                  ?.flatMap((ma: any) => ma?.results)
                  ?.find(
                    (result: any) => result?.hotspots_id === answer.id
                  )?.is_correct
                return (
                  <div
                    key={i + 1}
                    className={cn(
                      'flex items-center border border-transparent gap-2',
                      (isStudying || isPreview) &&
                        ' border-gray-300 rounded-lg p-2 aspect-[4/3] items-center justify-center cursor-pointer',
                      showCorrectAnswers &&
                        matchingResult === true &&
                        'border-green-500 bg-green-50 border-2',
                      showCorrectAnswers &&
                        matchingResult === false &&
                        'border-red-500 bg-red-50 border-2',
                      !showCorrectAnswers &&
                        selectedAnswers.includes(i) &&
                        'border-blue-500 border-2'
                    )}
                  >
                    {handleRenderCheckbox(type, is_correct, i)}
                    <RenderTiptapContent content={content} />
                  </div>
                )
              })}
            </div>
          </>
        )
      default:
        return null
    }
  }
  switch (code) {
    case QUIZ_TYPE.multiple_answers:
    case QUIZ_TYPE.multiple_choice:
    case QUIZ_TYPE.single_choice:
      return <>{handlePicAnswer(checkHasPic(), code)}</>
    case QUIZ_TYPE.essay:
      return (
        <>
          {answerContent !== '' && !isStudying && (
            <div
              className={cn(
                questionBgColor === 'none' && 'bg-gray-100 rounded-lg',
                'flex flex-col px-4',
                showCorrectAnswers && 'py-2 border border-gray-200 rounded-lg'
              )}
            >
              {showCorrectAnswers && (
                <span className="font-semibold text-md text-gray-800 mb-2">
                  Đáp án mẫu
                </span>
              )}
              <div className={cn('h-fit w-full shrink-0')}>
                {showCorrectAnswers && (
                  <div
                    className={cn(
                      'mt-2 mb-4 text-md text-gray-500 font-medium break-all ',
                      expanded ? 'line-clamp-2' : 'block'
                    )}
                  >
                    <LatexEditor content={answerContent} />
                  </div>
                )}
              </div>
              {showCorrectAnswers && expanded && (
                <span
                  className="text-blue-900 font-semibold cursor-pointer text-sm inline-block mt-2"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? 'Ẩn bớt' : 'Xem thêm'}
                </span>
              )}
            </div>
          )}
        </>
      )

    case QUIZ_TYPE.fill_in_the_blank:
    case QUIZ_TYPE.drag_and_drop:
      if (answers) {
        const newAnswers = [...answers].sort(
          (a, b) => a.fill_order - b.fill_order
        )
        return (
          <div
            className={cn(
              'flex gap-4 transition-all opacity-100 h-auto',
              !showCorrectAnswers && 'opacity-0 h-0'
            )}
          >
            {newAnswers.map((answer, i) => {
              const { content, is_correct } = answer
              return (
                <div
                  key={i + 1}
                  className={cn(
                    'flex gap-2 items-center ',
                    (isStudying || isPreview) &&
                      'border px-3 py-2 shadow-sm rounded-lg cursor-move'
                  )}
                  draggable={code === QUIZ_TYPE.drag_and_drop ? true : false}
                  onDragStart={(e) => {
                    if (code === QUIZ_TYPE.drag_and_drop) {
                      e.dataTransfer?.setData('text/plain', content || '')
                    }
                  }}
                >
                  <Checkbox
                    className={cn(
                      'w-4 h-4 border border-gray-400  focus:outline-none transition-all',
                      '!rounded-sm appearance-none data-[state=checked]:border-none',
                      is_correct && '!bg-blue-500',
                      !is_correct && '!bg-red-500'
                    )}
                    checked={true}
                    isCorrect={is_correct}
                  />
                  <RenderTiptapContent content={content} />
                </div>
              )
            })}
          </div>
        )
      }
      break
    case QUIZ_TYPE.drop_box:
      if (answers) {
        const newAnswers = [...answers].sort(
          (a, b) => a.fill_order - b.fill_order
        )
        const answersWithChildren = newAnswers
          .filter((x) => {
            return x.children && x.children.length > 0
          })
          .map((x) => {
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
        return (
          <div className="flex flex-col transition-all opacity-100 h-auto">
            {answersWithChildren.map((child, rowIndex) => (
              <div key={`row-${rowIndex}`} className="flex items-center gap-4">
                <span className="text-gray-700 text-md">
                  CHỖ TRỐNG {rowIndex + 1}:
                </span>
                {child.children.map((answer: any, i: number) => {
                  const { content, is_correct } = answer
                  return (
                    <div
                      key={i + 1}
                      className={cn(
                        'flex items-center gap-2',
                        (isStudying || isPreview) &&
                          'border px-3 py-2 shadow-sm rounded-lg cursor-move'
                      )}
                    >
                      <Checkbox
                        className={cn(
                          'w-4 h-4 border border-gray-400 focus:outline-none transition-all',
                          '!rounded-sm appearance-none data-[state=checked]:border-none',
                          showCorrectAnswers && is_correct && '!bg-blue-500',
                          showCorrectAnswers && !is_correct && '!bg-red-500'
                        )}
                        checked={showCorrectAnswers}
                        isCorrect={is_correct}
                      />
                      <RenderTiptapContent content={content} />
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )
      }
      break
    case QUIZ_TYPE.video_response:
    case QUIZ_TYPE.audio_response:
      if (isStudying || isPreview) {
        return <></>
      } else {
        return (
          <div className="px-4 pt-[10px]">
            <span className="text-slate-700 font-semibold text-md">
              {code === QUIZ_TYPE.video_response
                ? 'Trả lời bằng Video: '
                : 'Trả lời bằng Audio: '}{' '}
              {answers?.[0]?.duration > 60
                ? answers?.[0]?.duration / 60
                : answers?.[0]?.duration}{' '}
              {answers?.[0]?.duration > 60 ? 'phút' : 'giây'}
            </span>
          </div>
        )
      }
    case QUIZ_TYPE.matching:
      if (answers) {
        const newAnswers = handleGroupByString(answers, 'label')
        return (
          <div className="space-y-4">
            {newAnswers.map((answer) => {
              const { id, child } = answer
              return (
                <div key={id} className="flex items-center gap-4">
                  <div>
                    <Checkbox
                      className={cn(
                        'w-4 h-4 border border-gray-400  focus:outline-none transition-all',
                        '!rounded-sm appearance-none data-[state=checked]:border-none',
                        showCorrectAnswers && '!bg-blue-500'
                      )}
                      checked={showCorrectAnswers}
                      isCorrect={showCorrectAnswers}
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    {child.map((item: any, i: number) => {
                      const {
                        id,
                        embedded_url,
                        file_urls,
                        content,
                        asset_type
                      } = item
                      let url = ''
                      if (file_urls && file_urls.url) {
                        url = file_urls.url
                      }
                      if (embedded_url) {
                        url = embedded_url
                      }
                      return (
                        <div
                          key={id}
                          className={cn(
                            'flex gap-2 items-center justify-between',
                            i === 0 && 'w-96',
                            i === 1 && 'flex-1'
                          )}
                        >
                          <div>
                            {url !== '' && (
                              <MediaRender
                                url={url}
                                type={asset_type as Material_Code}
                                containerClass="rounded-xl overflow-hidden bg-gray-50 aspect-[4/3] w-[120px] flex items-center justify-center"
                                isMini={true}
                              />
                            )}
                          </div>
                          <div className="w-full">
                            <RenderTiptapContent content={content} />
                          </div>
                          <div>{i === 0 && <ArrowRightIcon size={20} />}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )
      }
      break
  }
  return null
}
