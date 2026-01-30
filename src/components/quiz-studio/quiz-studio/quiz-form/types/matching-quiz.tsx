import { useEffect, useState } from 'react'
import TopActionQuiz from '@/components/studio/tools/top-action-quiz/index'
import { QuizFormProps } from '..'
import { useDebounceEffect } from '@/hooks/use-debounce-effect'
import { AssetState } from '@/mock-data/quiz-studio'
import Matching from '@/components/studio/tools/matching'
import { cleanObject } from '@/helper/cleanObject'

export default function MatchingQuiz({
  quizzInfo,
  handleAddItemToQuizOne
}: QuizFormProps) {
  const [completedAutoSave, setCompletedAutoSave] = useState<number>(0)
  const [isDoneFetchDetail, setIsDoneFetchDetail] = useState<boolean>(false)
  const [quizzAnswersState, setQuizzAnswersState] = useState<any>([])
  const [quizzInfoState, setQuizzInfoState] = useState<AssetState>({
    name: '',
    asset_type: '',
    asset_url: '',
    embedded_url: '',
    file_urls: {
      url: ''
    }
  })

  useEffect(() => {
    if (quizzInfo) {
      setQuizzInfoState({
        name: quizzInfo.name || '',
        asset_type: quizzInfo.asset_type || '',
        asset_url: quizzInfo.asset_url || '',
        embedded_url: quizzInfo.embedded_url || '',
        file_urls: quizzInfo.file_urls || { url: '' }
      })
      const cleanData = quizzInfo.questions_hotspots?.data.map((x) => {
        return cleanObject(x)
      })
      setQuizzAnswersState(cleanData)
      setIsDoneFetchDetail(true)
    }
  }, [quizzInfo])

  useEffect(() => {
    if (quizzInfoState || quizzAnswersState) {
      setCompletedAutoSave((x) => x + 1)
    }
  }, [quizzInfoState, quizzAnswersState])

  useDebounceEffect(
    async () => {
      if (completedAutoSave > 0) {
        const finalObj = {
          ...quizzInfoState,
          questions_hotspots: {
            data: quizzAnswersState
          }
        }
        handleAddItemToQuizOne('', finalObj)
      }
    },
    500,
    [completedAutoSave]
  )

  return (
    <>
      {/* Top Quiz */}
      <TopActionQuiz
        isDoneFetchDetail={isDoneFetchDetail}
        contentInfo={quizzInfoState}
        handleAssetChange={(value) => {
          setQuizzInfoState((prev) => ({
            ...prev,
            ...value
          }))
        }}
      />
      <Matching
        isDoneFetchDetail={isDoneFetchDetail}
        contentAnswer={quizzAnswersState}
        updateChoices={(choices) => {
          setQuizzAnswersState(choices)
        }}
      />
    </>
  )
}
