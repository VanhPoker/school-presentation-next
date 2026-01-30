import {
  InsertMaterialProgressesOneDocument,
  Questions
} from '@/graphql/generated'
import { getUserInfoFromCookie } from '@/server-action/auth'
import { Question, useDoQuizStore } from '@/stores/use-do-quiz-store'
import { QUIZ_CATEGORY_CODE, QUIZ_SOCKET_EVENT } from '@/types/quiz-studio'
import { useMutation } from '@apollo/client'
import { isArray, omit } from 'lodash-es'
import { useParams, usePathname, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

export default function useDoQuiz() {
  const { examId } = useParams()
  const pathname = usePathname()

  const {
    questions,
    activeQuestionId,
    answers,
    quizSocket,
    retryCounts,
    results
  } = useDoQuizStore(
    useShallow((state) => ({
      questions: state.questions,
      activeQuestionId: state.activeQuestionId,
      answers: state.answers,
      quizSocket: state?.quizSocket,
      retryCounts: state.retryCounts,
      results: state.results
    }))
  )
  const searchParams = useSearchParams()
  const [insertMaterialProgress] = useMutation(
    InsertMaterialProgressesOneDocument
  )

  const isQuizPreview = useMemo(
    () => pathname?.includes(`/quiz-preview/${examId}`),
    [pathname]
  )

  const activeQuestionResult = results.get(activeQuestionId)
  const activeQuestionRetryCount = retryCounts.get(activeQuestionId)

  const activeQuestion = useMemo(() => {
    const result = questions?.find((item) => item?.id === activeQuestionId)
    return result
  }, [questions, activeQuestionId])
  const activeQuestionIndex = useMemo(() => {
    const result = questions?.findIndex((item) => item?.id === activeQuestionId)
    return result
  }, [questions, activeQuestionId])

  const canCheckAnswer = useMemo(() => {
    const payload = answers?.find(
      (item) => item?.questionId === activeQuestionId
    )?.payload
    let canCheck
    if (activeQuestion?.categoryCode === undefined) return false
    if (
      activeQuestion?.categoryCode === QUIZ_CATEGORY_CODE.AUDIO_RESPONSE ||
      activeQuestion?.categoryCode === QUIZ_CATEGORY_CODE.VIDEO_RESPONSE
    ) {
      canCheck = false
    } else if (activeQuestion?.categoryCode === QUIZ_CATEGORY_CODE.ESSAY) {
      canCheck = payload?.content?.length > 0
    } else {
      canCheck = payload?.filter((item: any) => item.hotspots_id)?.length > 0
    }
    return canCheck
  }, [answers, activeQuestionId, activeQuestion?.categoryCode])

  const getQuestionPreviewProps = (question: Questions | any) => {
    const {
      id,
      file_urls,
      questions_hotspots,
      choices,
      media_width,
      answer_positions,
      question_category,
      name,
      content_preview,
      asset_url,
      asset_type,
      embedded_url
    } = question
    const url = file_urls?.url
    const code = question_category?.code

    let props = {}
    if (code === QUIZ_CATEGORY_CODE.STICKER) {
      props = {
        imageUrl: url,
        questionsHotpots: isQuizPreview ? questions_hotspots : choices,
        originMediaWidth: media_width,
        answerPositions: answer_positions
      }
    }
    if (code === QUIZ_CATEGORY_CODE.ESSAY) {
      props = {
        questions_hotspots: isQuizPreview ? questions_hotspots : choices
      }
    }
    if (
      code === QUIZ_CATEGORY_CODE.SINGLE_CHOICE ||
      code === QUIZ_CATEGORY_CODE.MULTIPLE_ANSWERS
    ) {
      props = {
        hotspots: isQuizPreview
          ? question?.questions_hotspots
          : question?.choices
      }
    }
    if (
      code === QUIZ_CATEGORY_CODE.MATCHING ||
      code === QUIZ_CATEGORY_CODE.FILL_IN_THE_BLANK ||
      code === QUIZ_CATEGORY_CODE.DRAG_AND_DROP ||
      code === QUIZ_CATEGORY_CODE.DROP_BOX
    ) {
      props = {
        id: id,
        name: name,
        content_preview: content_preview,
        question_category: question_category,
        embedded_url: embedded_url,
        file_urls: file_urls,
        asset_type: asset_type,
        asset_url: asset_url,
        questions_hotspots: isQuizPreview ? questions_hotspots : choices
      }
    }
    if (
      code === QUIZ_CATEGORY_CODE.VIDEO_RESPONSE ||
      code === QUIZ_CATEGORY_CODE.AUDIO_RESPONSE
    ) {
      props = {
        id: id,
        name: name,
        content_preview: content_preview,
        question_category: question_category,
        embedded_url: embedded_url,
        file_urls: file_urls,
        asset_type: asset_type,
        asset_url: asset_url,
        questions_hotspots: isQuizPreview ? questions_hotspots : choices
      }
    }
    return props
  }

  const getQuestionRetryCount = (
    questionCategoryCode: QUIZ_CATEGORY_CODE,
    choicesCount?: number
  ) => {
    if (
      questionCategoryCode === QUIZ_CATEGORY_CODE.SINGLE_CHOICE ||
      questionCategoryCode === QUIZ_CATEGORY_CODE.MULTIPLE_ANSWERS
    ) {
      return Number(choicesCount) - 2
    }
    return 3
  }

  const handleCheckAnswer = async () => {
    const userInfoId = await getUserInfoFromCookie()
    if (!userInfoId) return
    useDoQuizStore.setState({
      isChecking: true
    })
    const payload = answers?.find(
      (item) => item?.questionId === activeQuestionId
    )?.payload
    let data
    if (activeQuestion?.categoryCode === QUIZ_CATEGORY_CODE.ESSAY) {
      data = [
        {
          ...payload,
          user_id: userInfoId
        }
      ]
    } else {
      data = payload
        ?.filter((item: any) => item?.hotspots_id)
        ?.map((item: any) => {
          const obj = { ...item }
          if (obj.item_drop) {
            obj.item_drop = {
              ...obj.item_drop,
              user_id: userInfoId
            }
          }
          return {
            ...omit(obj, 'category_code'),
            user_id: userInfoId
          }
        })
    }
    const value = {
      event: 'SUBMIT_ANSWER',
      data
    }
    quizSocket?.send(JSON.stringify(value))
  }

  const handleSubmitAnswer = async () => {
    const userInfoId = await getUserInfoFromCookie()
    if (!userInfoId) return
    useDoQuizStore.setState({
      isSubmitting: true,
      quizSocketEvent: QUIZ_SOCKET_EVENT.END_QUIZ
    })
    const data = answers
      ?.flatMap((item) => item?.payload)
      ?.map((item) => ({
        ...omit(item, 'category_code'),
        user_id: userInfoId
      }))
    const submitValue = {
      event: 'SUBMIT_ANSWER',
      data,
      is_submit_all: true
    }
    quizSocket?.send(JSON.stringify(submitValue))
    const endValue = {
      event: 'END_QUIZ',
      data: {
        user_id: userInfoId
      }
    }
    quizSocket?.send(JSON.stringify(endValue))
    saveQuizProgress(true)
  }

  const saveQuizProgress = async (isDone?: boolean) => {
    const userInfoId = await getUserInfoFromCookie()
    const missionId = searchParams.get('missionId')
    const examDetailId = searchParams.get('examDetailId')
    const materialId = searchParams.get('materialId')
    const {
      studySetting,
      answers,
      activeQuestionId,
      questions,
      currentQuizElapsedTime,
      remainingTotalTime,
      orderedQuestionIds
    } = useDoQuizStore.getState()
    const metadata: {
      study_setting: typeof studySetting
      exam_id: typeof examId
      exam_detail_id: typeof examDetailId
      mission_id: typeof missionId
      answers: typeof answers
      current_question_id: typeof activeQuestionId
      progress: number
      is_done: boolean
      ordered_question_ids: string[]
      current_quiz_elapsed_time?: typeof currentQuizElapsedTime
      remaining_total_time?: typeof remainingTotalTime
    } = {
      study_setting: studySetting,
      exam_id: examId,
      exam_detail_id: examDetailId,
      mission_id: missionId,
      answers,
      current_question_id: activeQuestionId,
      progress: Math.round((answers?.length / questions?.length) * 100),
      is_done: isDone || false,
      ordered_question_ids: orderedQuestionIds
    }
    if (studySetting?.limit_time_by === 0) {
      metadata.current_quiz_elapsed_time = currentQuizElapsedTime
    }
    if (studySetting?.limit_time_by === 1) {
      metadata.remaining_total_time = remainingTotalTime
    }
    insertMaterialProgress({
      variables: {
        object: {
          material_id: materialId,
          created_by: userInfoId,
          metadata: JSON.stringify(metadata)
        },
        on_conflict: {
          constraint: 'unique_material_created_by',
          update_columns: ['metadata']
        }
      }
    })
  }

  const clearQuestionResult = () => {
    const newResults = new Map(results)
    newResults.delete(activeQuestionId)
    useDoQuizStore.setState({
      results: newResults
    })
  }

  const checkQuestionMustBeAnswered = () => {
    const activeQuestionAnswers = answers?.find(
      (item) => item?.questionId === activeQuestionId
    )
    if (activeQuestion?.mustResponse && !activeQuestionAnswers) {
      return true
    }
    return false
  }

  const checkAllQuestionsHasOneMustBeAnswered = (
    checkQuestions?: Question[]
  ) => {
    const mustBeAnsweredQuestions = (
      isArray(checkQuestions) ? checkQuestions : questions
    )?.filter((item) => item?.mustResponse === true)
    const hasQuestionUnanswered = mustBeAnsweredQuestions?.some((item) => {
      const answered = answers?.find(
        (answer) => answer?.questionId === item?.id
      )
      if (!answered) {
        return true
      }
      return false
    })
    return hasQuestionUnanswered
  }

  return {
    isQuizPreview,
    activeQuestion,
    activeQuestionCategoryCode: activeQuestion?.categoryCode || '',
    activeQuestionCategoryName: activeQuestion?.categoryName || '',
    activeQuestionPoint: activeQuestion?.point,
    activeQuestionTime: activeQuestion?.time,
    activeQuestionName: activeQuestion?.name,
    activeQuestionAssetType: activeQuestion?.assetType,
    activeQuestionFileUrl: activeQuestion?.fileUrl,
    activeQuestionIndex,
    activeQuestionResult,
    activeQuestionRetryCount,
    getQuestionPreviewProps,
    getQuestionRetryCount,
    handleCheckAnswer,
    canCheckAnswer,
    handleSubmitAnswer,
    saveQuizProgress,
    clearQuestionResult,
    checkQuestionMustBeAnswered,
    checkAllQuestionsHasOneMustBeAnswered
  }
}
