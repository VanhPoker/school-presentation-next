'use client'

import { useApollo } from '@/app/apollo/apolloClient'
import { useGetExamByPkQuery } from '@/graphql/generated'
import { Question, useDoQuizStore } from '@/stores/use-do-quiz-store'
import { isArray } from 'lodash-es'
import { useParams } from 'next/navigation'
import { ReactNode, useEffect } from 'react'
import useDoQuiz from '../_hooks/useDoQuiz'

type Props = {
  children: ReactNode
}

export default function QuizPreviewProvider({ children }: Props) {
  const { examId } = useParams()

  const { apolloWithAuth } = useApollo()
  const { data: examData } = useGetExamByPkQuery({
    variables: { id: examId },
    skip: !apolloWithAuth || !examId,
    fetchPolicy: 'no-cache'
  })
  const { getQuestionPreviewProps } = useDoQuiz()
  const { questions } = useDoQuizStore()

  useEffect(() => {
    const questions = isArray(examData?.exams_by_pk?.exam_questions)
      ? examData?.exams_by_pk?.exam_questions
      : []
    const convertedQuestions = questions?.map((item) => ({
      id: item?.id,
      name: item?.question?.name,
      categoryCode: item?.question?.question_category?.code,
      categoryName: item?.question?.question_category?.name,
      point: item?.question?.point,
      time: item?.question?.time,
      assetType: item?.question?.asset_type || '',
      fileUrl: item?.question?.file_urls?.url || '',
      previewProps: getQuestionPreviewProps(item?.question)
    }))
    useDoQuizStore.setState({
      questions: convertedQuestions as Question[],
      activeQuestionId: convertedQuestions?.[0]?.id || ''
    })
  }, [examData, examId])

  useEffect(() => {
    if (questions)
      useDoQuizStore.setState({
        isQuestionsFetched: true
      })
  }, [questions])

  return <>{children}</>
}
