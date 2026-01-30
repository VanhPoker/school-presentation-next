import { memo } from 'react'
import useDoQuiz from '../_hooks/useDoQuiz'
import { QUIZ_CATEGORY_CODE } from '@/types/quiz-studio'
import Image from 'next/image'
import AudioWaveform from '@/components/ui/wave-audio-player'
import ReactPlayer from 'react-player'
import dynamic from 'next/dynamic'
const LatexEditor = dynamic(() => import('@/components/base/latex-editor'), {
  ssr: false
})

const QuizName = () => {
  const {
    activeQuestionName,
    activeQuestionAssetType,
    activeQuestionFileUrl,
    activeQuestionCategoryCode
  } = useDoQuiz()

  const renderMedia = () => {
    if (!activeQuestionAssetType || !activeQuestionFileUrl) return null
    if (activeQuestionAssetType === 'images') {
      return (
        <div className="aspect-[320/240] relative w-full max-w-[245px] h-[180px] md:max-w-[280px] md:h-[210px] lg:min-w-[320px] lg:max-w-[320px] lg:h-[240px] border border-solid border-[#D5D7DA] rounded-lg mx-auto">
          <Image
            src={activeQuestionFileUrl}
            fill
            alt="Asset image"
            className="object-contain"
          />
        </div>
      )
    }
    if (activeQuestionAssetType === 'audios') {
      return (
        <div className="w-full max-w-[245px] md:max-w-[280px] lg:min-w-[320px] lg:max-w-[320px] border border-solid border-[#D5D7DA] rounded-lg p-4 mx-auto">
          <AudioWaveform audioUrl={activeQuestionFileUrl} />
        </div>
      )
    }
    if (activeQuestionAssetType === 'videos') {
      return (
        <div className="aspect-[320/240] w-full max-w-[245px] h-[180px] md:max-w-[280px] md:h-[210px] lg:min-w-[320px] lg:max-w-[320px] lg:h-[240px] border border-solid border-[#D5D7DA] rounded-lg overflow-hidden mx-auto">
          <ReactPlayer
            url={activeQuestionFileUrl}
            controls={true}
            width="100%"
            height="100%"
            alt="video-link"
          />
        </div>
      )
    }
    return null
  }

  if (
    activeQuestionCategoryCode === QUIZ_CATEGORY_CODE.SINGLE_CHOICE ||
    activeQuestionCategoryCode === QUIZ_CATEGORY_CODE.MULTIPLE_ANSWERS ||
    activeQuestionCategoryCode === QUIZ_CATEGORY_CODE.ESSAY
  ) {
    const hasMedia = !!activeQuestionAssetType && !!activeQuestionFileUrl
    if (hasMedia) {
      return (
        <div className="flex flex-col md:flex-row gap-4 items-center max-w-full md:max-w-[80%] lg:max-w-[50%] mx-auto grow overflow-y-auto px-4 md:px-0">
          {renderMedia()}
          <LatexEditor
            content={activeQuestionName || ''}
            className="font-semibold w-full text-center md:text-left text-base md:text-xl text-[#181D27] h-full [&>_*]:!p-0 [&>_*]:!min-h-[unset] [&>_*]:!max-w-[unset] [&_.tiptap]:!text-center md:[&_.tiptap]:!text-left"
          />
        </div>
      )
    }
    return (
      <div className="w-full lg:max-w-[50%] mx-auto grow overflow-y-auto px-4 md:px-0">
        <LatexEditor
          content={activeQuestionName || ''}
          className="font-semibold w-full text-center md:text-left text-base md:text-xl text-[#181D27] h-full [&>_*]:!p-0 [&>_*]:!min-h-[unset] [&>_*]:!max-w-[unset] [&_.tiptap]:!text-center md:[&_.tiptap]:!text-left"
        />
      </div>
    )
  }

  if (
    activeQuestionCategoryCode === QUIZ_CATEGORY_CODE.FILL_IN_THE_BLANK ||
    activeQuestionCategoryCode === QUIZ_CATEGORY_CODE.DRAG_AND_DROP ||
    activeQuestionCategoryCode === QUIZ_CATEGORY_CODE.MATCHING ||
    activeQuestionCategoryCode === QUIZ_CATEGORY_CODE.DROP_BOX
  ) {
    return null
  }

  return (
    <div className="max-w-[50%] mx-auto grow overflow-y-auto px-4 md:px-0">
      <LatexEditor
        content={activeQuestionName || ''}
        className="font-semibold text-center md:text-left text-[#181D27] text-xl h-full [&>_*]:!p-0 [&>_*]:!min-h-[unset] [&>_*]:!max-w-[unset] [&_.tiptap]:!text-center md:[&_.tiptap]:!text-left"
      />
    </div>
  )
}

export default memo(QuizName)
