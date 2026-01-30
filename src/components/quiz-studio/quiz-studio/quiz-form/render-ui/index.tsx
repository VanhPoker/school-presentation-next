import { useSearchParams } from 'next/navigation'
import RenderFormQuiz from './render-form'
import RenderLoadingQuiz from './render-loaing'

export type RenderUIProps = {
  quizzInfo?: any
  arrQuizAnswers?: any[]
  handleAddItemToQuizOne: (path: string, value: any) => void
  isGetDetailDone?: boolean
  loadingApi?: boolean
}

export default function RenderUIQuizForm({
  quizzInfo,
  arrQuizAnswers,
  isGetDetailDone,
  loadingApi,
  handleAddItemToQuizOne
}: RenderUIProps) {
  const searchParams = useSearchParams()
  const quizdUrl = searchParams.get('quizId')
  const code = searchParams.get('code')

  if ((!isGetDetailDone && quizdUrl) || loadingApi) {
    return (
      <RenderLoadingQuiz
        isGetDetailDone={isGetDetailDone}
        loadingApi={loadingApi}
        handleAddItemToQuizOne={handleAddItemToQuizOne}
      />
    )
  } else {
    return (
      <RenderFormQuiz
        //key change will reset all contents
        key={code}
        quizzInfo={quizzInfo}
        arrQuizAnswers={arrQuizAnswers}
        handleAddItemToQuizOne={handleAddItemToQuizOne}
      />
    )
  }
}
