import { useEffect, useState } from 'react'
import TopActionQuiz from '@/components/studio/tools/top-action-quiz/index'
import { QuizFormProps } from '..'
import { useDebounceEffect } from '@/hooks/use-debounce-effect'
import { AssetState } from '@/mock-data/quiz-studio'
import Choices from '@/components/studio/tools/choices'

export default function MultipleQuiz({
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
  const [quizzSettingState, setQuizzSettingState] = useState<any>({
    code: '',
    category_id: '',
    layout_answer: 2
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
      setQuizzSettingState({
        code: quizzInfo.code,
        category_id: quizzInfo.category_id,
        layout_answer: quizzInfo.layout_answer
      })
      setQuizzAnswersState(quizzInfo.questions_hotspots?.data)
      setIsDoneFetchDetail(true)
    }
  }, [quizzInfo])

  useEffect(() => {
    if (quizzInfoState || quizzSettingState || quizzAnswersState) {
      setCompletedAutoSave((x) => x + 1)
    }
  }, [quizzInfoState, quizzSettingState, quizzAnswersState])

  useDebounceEffect(
    async () => {
      if (completedAutoSave > 0) {
        const finalObj = {
          ...quizzInfoState,
          ...quizzSettingState,
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
      <Choices
        isDoneFetchDetail={isDoneFetchDetail}
        contentInfo={quizzSettingState}
        contentAnswer={quizzAnswersState}
        updateChoices={(choices) => {
          setQuizzAnswersState(choices)
        }}
        handleAssetChange={(value) => {
          setQuizzSettingState({
            ...quizzSettingState,
            ...value
          })
        }}
      />
    </>
  )
}
