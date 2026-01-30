import dynamic from 'next/dynamic'
import { QUIZ_TYPE } from '@/types/quiz-studio'
import { useSearchParams } from 'next/navigation'
import { RenderUIProps } from '..'
import { Loader2 } from 'lucide-react'
const ImageLabelQuiz = dynamic(() => import('../../types/image-label-quiz'), {
  loading: () => (
    <div className="grid place-content-center h-full">
      <span className="animate-spin">
        <Loader2 />
      </span>
    </div>
  )
})
const EssayQuiz = dynamic(() => import('../../types/essay-quiz'), {
  loading: () => (
    <div className="grid place-content-center h-full">
      <span className="animate-spin">
        <Loader2 />
      </span>
    </div>
  )
})
const MultipleQuiz = dynamic(() => import('../../types/multiple-quiz'), {
  loading: () => (
    <div className="grid place-content-center h-full">
      <span className="animate-spin">
        <Loader2 />
      </span>
    </div>
  )
})
const VideoAndAudioQuiz = dynamic(
  () => import('../../types/video-and-audio-quiz'),
  {
    loading: () => (
      <div className="grid place-content-center h-full">
        <span className="animate-spin">
          <Loader2 />
        </span>
      </div>
    )
  }
)
const MatchingQuiz = dynamic(() => import('../../types/matching-quiz'), {
  loading: () => (
    <div className="grid place-content-center h-full">
      <span className="animate-spin">
        <Loader2 />
      </span>
    </div>
  )
})
const FillDragDropQuiz = dynamic(
  () => import('../../types/fill-drag-drop-quiz'),
  {
    loading: () => (
      <div className="grid place-content-center h-full">
        <span className="animate-spin">
          <Loader2 />
        </span>
      </div>
    )
  }
)

export default function RenderFormQuiz({
  quizzInfo,
  arrQuizAnswers,
  handleAddItemToQuizOne
}: RenderUIProps) {
  const searchParams = useSearchParams()
  const codeUrl = searchParams.get('code')

  if (codeUrl === QUIZ_TYPE.sticker) {
    return <ImageLabelQuiz />
  }

  if (codeUrl === QUIZ_TYPE.essay) {
    return (
      <EssayQuiz
        quizzInfo={quizzInfo}
        arrQuizAnswers={arrQuizAnswers}
        handleAddItemToQuizOne={handleAddItemToQuizOne}
      />
    )
  }

  if (
    codeUrl === QUIZ_TYPE.multiple_choice ||
    codeUrl === QUIZ_TYPE.single_choice ||
    codeUrl === QUIZ_TYPE.multiple_answers
  ) {
    return (
      <MultipleQuiz
        quizzInfo={quizzInfo}
        handleAddItemToQuizOne={handleAddItemToQuizOne}
      />
    )
  }

  if (
    codeUrl === QUIZ_TYPE.video_response ||
    codeUrl === QUIZ_TYPE.audio_response
  ) {
    return (
      <VideoAndAudioQuiz
        quizzInfo={quizzInfo}
        arrQuizAnswers={arrQuizAnswers}
        handleAddItemToQuizOne={handleAddItemToQuizOne}
        checkType={codeUrl}
      />
    )
  }

  if (
    codeUrl === QUIZ_TYPE.fill_in_the_blank ||
    codeUrl === QUIZ_TYPE.drag_and_drop ||
    codeUrl === QUIZ_TYPE.drop_box
  ) {
    return (
      <FillDragDropQuiz
        quizzInfo={quizzInfo}
        handleAddItemToQuizOne={handleAddItemToQuizOne}
      />
    )
  }

  if (codeUrl === QUIZ_TYPE.matching) {
    return (
      <MatchingQuiz
        quizzInfo={quizzInfo}
        handleAddItemToQuizOne={handleAddItemToQuizOne}
      />
    )
  }

  return (
    <div className="grid place-content-center h-full">
      <p>Loại quiz này không có dữ liệu</p>
    </div>
  )
}
