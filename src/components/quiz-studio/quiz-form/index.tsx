'use client'
import dynamic from 'next/dynamic'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  Extended_Hotspots_Insert_Input,
  Extended_Questions_Insert_Input,
  QUIZ_TYPE
} from '@/types/quiz-studio'
import { useEffect, useState } from 'react'
import {
  GetQuestionByPkDocument,
  GetQuestionByPkQuery
} from '@/graphql/generated'
import { ESSAY_QUIZ_SETTING } from '@/mock-data/quiz-studio/essay'
import { useApollo } from '@/app/apollo/apolloClient'
import { useQuizFormStudioStore } from '@/stores/use-quiz-studio-store'
import { cloneDeep } from 'lodash-es'
import RenderUIQuizForm from './render-ui'
import { Skeleton } from '@/components/ui/skeleton'

const Actions = dynamic(() => import('./actions'), {
  loading: () => <Skeleton className="h-14 w-full" />
})
export type QuizFormProps = {
  quizzInfo: Extended_Questions_Insert_Input | undefined
  arrQuizAnswers?: any[]
  handleAddItemToQuizOne: (path: string, value: any) => void
  checkType?: string
}

export type ChildProps = {
  contentAnswer: Extended_Hotspots_Insert_Input[]
  isDoneFetchDetail: boolean
  updateChoices: (choices: Extended_Hotspots_Insert_Input[]) => void

  contentInfo?: any
  handleAssetChange?: (value: any) => void
}

export default function QuizFormMain() {
  const { apolloWithAuth } = useApollo()
  const searchParams = useSearchParams()
  const codeUrl = searchParams.get('code')
  const quizdUrl = searchParams.get('quizId')
  const {
    objQuizFormStudio,
    isGetDetailDone,
    setObjQuizFormStudio,
    setIsGetDetailDone,
    setObjAnswerContent,
    setIdAnswerDelete,
    setArrayQuizzAnswers,
    setArrayQuizzFalseAnswers,
    setArrayQuizzExistAnswers
  } = useQuizFormStudioStore()
  const [arrQuizAnswers, setArrQuizAnswers] =
    useState<any[]>(ESSAY_QUIZ_SETTING)
  const [quizzInfo, setQuizzInfo] = useState<any>()
  const [loadingApi, setLoadingApi] = useState(false)
  const pathname = usePathname()
  const isPreview = pathname.includes('/quiz-form/preview')

  const handleAddItemToQuizOne = (path: string, value: any) => {
    const currentObj = cloneDeep(objQuizFormStudio)
    if (path === '') {
      setObjQuizFormStudio({ ...currentObj, ...value })
    } else {
      setObjQuizFormStudio({ ...currentObj, [path]: value })
    }
  }

  const fetchDetailQuiz = async () => {
    if (!apolloWithAuth) return
    try {
      setLoadingApi(true)
      const { data } = await apolloWithAuth.query<GetQuestionByPkQuery>({
        fetchPolicy: 'no-cache',
        query: GetQuestionByPkDocument,
        variables: {
          id: quizdUrl
        }
      })
      const detail = data?.questions_by_pk
      if (detail) {
        const quizHotspots =
          data?.questions_by_pk?.questions_hotspots.map((x) => {
            return { ...x }
          }) || []
        const featchObj = {
          asset_url: data?.questions_by_pk?.asset_url,
          asset_type: data?.questions_by_pk?.asset_type,
          embedded_url: data?.questions_by_pk?.embedded_url,
          created_by: data?.questions_by_pk?.created_by,
          name: data?.questions_by_pk?.name,
          content_preview: data?.questions_by_pk?.content_preview,
          must_response: data?.questions_by_pk?.must_response,
          point: data?.questions_by_pk?.point,
          time: data?.questions_by_pk?.time,
          file_urls: data?.questions_by_pk?.file_urls,
          layout_answer: data?.questions_by_pk?.layout_answer,
          code: data?.questions_by_pk?.question_category?.code,
          category_id: data?.questions_by_pk?.question_category?.id,
          questions_hotspots: {
            data: quizHotspots
          },
          media_width: data?.questions_by_pk?.media_width
        }
        setQuizzInfo(featchObj)
        setObjQuizFormStudio(featchObj)

        if (codeUrl === QUIZ_TYPE.essay) {
          const hotspot = data?.questions_by_pk?.questions_hotspots[0]
          const content = hotspot?.content
          const max_characters = hotspot?.max_characters || 0
          const ai_content_review = hotspot?.ai_content_review
          setArrQuizAnswers((prev) => {
            return prev.map((x) => {
              x.id_hotspot = quizHotspots[0]?.id
              if (x.path === 'ai_content_review') {
                return {
                  ...x,
                  content: ai_content_review
                }
              }
              if (x.path === 'max_characters') {
                return {
                  ...x,
                  content: max_characters
                }
              }
              if (x.path === 'content') {
                return {
                  ...x,
                  content: content
                }
              }
              return { ...x }
            })
          })
        } else {
          setArrQuizAnswers(quizHotspots)
        }
      }
      setIsGetDetailDone(true)
    } catch (error) {
      console.error('error', error)
    } finally {
      setLoadingApi(false)
    }
  }

  useEffect(() => {
    if (apolloWithAuth) {
      setObjAnswerContent({})
      setIdAnswerDelete('')
      setArrayQuizzAnswers([])
      setArrayQuizzFalseAnswers([])
      setArrayQuizzExistAnswers([])
      if (quizdUrl) {
        fetchDetailQuiz()
      } else {
        if (codeUrl === QUIZ_TYPE.essay) {
          setArrQuizAnswers((prev) => {
            return prev.map((x) => {
              x.id_hotspot = null
              x.content = ''
              return { ...x }
            })
          })
        }
      }
    }
  }, [quizdUrl, apolloWithAuth])

  return (
    <div className="quiz-form bg-gray-200 overflow-auto relative w-screen h-screen left-0 z-50 pb-40 no-scrollbar">
      {!isPreview && (
        <Actions
          isGetDetailDone={!isGetDetailDone || loadingApi}
          quizdUrl={quizdUrl || undefined}
          codeUrl={codeUrl || undefined}
        />
      )}
      <div className="w-full relative h-full">
        <div className="max-w-[1024px] mx-auto h-full relative pt-6">
          <RenderUIQuizForm
            quizzInfo={quizzInfo}
            arrQuizAnswers={arrQuizAnswers}
            handleAddItemToQuizOne={handleAddItemToQuizOne}
            isGetDetailDone={isGetDetailDone}
            loadingApi={loadingApi}
          />
        </div>
      </div>
    </div>
  )
}
