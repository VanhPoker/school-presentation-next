'use client'

import { CompleteQuizWithoutShowingResultsModal } from '@/components/modals/complete-quiz-without-showing-results'
import QuizCompleteModal from '@/components/modals/quiz-complete-modal'
import { BE_SOCKET_URL } from '@/config'
import { Question, useDoQuizStore } from '@/stores/use-do-quiz-store'
import { QUIZ_SOCKET_EVENT } from '@/types/quiz-studio'
import { isArray, isNumber, pick } from 'lodash-es'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ReactNode, useEffect, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import useDoQuiz from '../_hooks/useDoQuiz'
import ExitModal from '@/components/modals/exit-modal'
import { useGlobalStore } from '@/stores/use-global-store'
import dayjs from 'dayjs'
import { useUserProfileStore } from '@/stores/use-user-profile-store'
import { USER_ACTIVITY_LOG } from '@/types/user'

type Props = {
  children: ReactNode
  userInfoId: string
}

export default function QuizStudyProvider({ children, userInfoId }: Props) {
  const { examId } = useParams()
  const searchParams = useSearchParams()
  const missionId = searchParams.get('missionId')
  const router = useRouter()
  const examDetailId = searchParams.get('examDetailId')
  const previousUrl = searchParams.get('previousUrl')
  const { getQuestionPreviewProps, getQuestionRetryCount, saveQuizProgress } =
    useDoQuiz()
  const {
    results,
    retryCounts,
    quizSocket,
    answers,
    studySetting,
    isOpenCompleteModal,
    analyticResult
  } = useDoQuizStore(
    useShallow((state) => ({
      results: state.results,
      retryCounts: state.retryCounts,
      quizSocket: state.quizSocket,
      answers: state.answers,
      studySetting: state.studySetting,
      isOpenCompleteModal: state.isOpenCompleteModal,
      analyticResult: state.analyticResult
    }))
  )
  const startReadingTime = useRef(new Date().toISOString())

  const connectWebSocket = () => {
    const socket = new WebSocket(`${BE_SOCKET_URL}/${missionId}`)
    socket.onopen = () => {
      const payload = {
        event: 'JOIN_ROOM',
        data: {
          exam_id: examId,
          exam_detail_id: examDetailId,
          user_id: userInfoId,
          mission_id: missionId,
          status: 'JOIN',
          is_host: false
        }
      }
      socket.send(JSON.stringify(payload))
      useDoQuizStore.setState({
        quizSocket: socket
      })
    }
    socket.onclose = () => console.log('WebSocket connection closed')
  }

  const renderCompleteModal = () => {
    if (studySetting.view_result_latest) {
      return (
        <QuizCompleteModal
          isOpen={isOpenCompleteModal}
          onClose={() => {
            useDoQuizStore.setState({ isOpenCompleteModal: false })
            router.push(previousUrl || '/')
          }}
          implementedFunction={() =>
            router.push(`/ca-nhan/ho-so-luyen-tap/${examDetailId}`)
          }
          infor={{
            title: 'Kết quả bài kiểm tra',
            subTitle: new Date().toLocaleString(),
            userPoint: Number(analyticResult?.total_score) ?? 0,
            circlePercentage: Number(
              Number(analyticResult?.total_score) /
                Number(analyticResult?.total_all_score)
            ),
            overallPercentage:
              Number(analyticResult?.last_correct_percent) ?? 0,
            currentPercentage:
              Number(analyticResult?.current_correct_percent) ?? 0,
            wrongAnswersNumber:
              Number(analyticResult?.total_wrong_answers) ?? 0,
            rightAnswersNumber:
              Number(analyticResult?.total_correct_answers) ?? 0,
            quizTimeTaken: Number(analyticResult?.total_duration) ?? 0
          }}
        />
      )
    }
    return (
      <CompleteQuizWithoutShowingResultsModal
        isOpen={isOpenCompleteModal}
        onClose={() => {
          useDoQuizStore.setState({ isOpenCompleteModal: false })
          router.push(previousUrl || '/')
        }}
        implementedFunction={() =>
          router.push(`/ca-nhan/ho-so-luyen-tap/${examDetailId}`)
        }
      />
    )
  }

  const handleCancelExitQuiz = () => {
    useGlobalStore.setState({ showExitModal: false })
    useDoQuizStore.setState({ isQuizStopped: false })
    window.history.pushState(null, '', window.location.href)
  }

  const handleConfirmExitQuiz = () => {
    saveQuizProgress()
    useGlobalStore.setState({ showExitModal: false })
    router.push(previousUrl || '/')
    saveUserLogToLocalStorage()
  }

  const saveUserLogToLocalStorage = () => {
    const readingActivityLog = {
      created_at: startReadingTime.current,
      updated_at: dayjs().toISOString(),
      action: USER_ACTIVITY_LOG.DOING_EXAM,
      action_details: useDoQuizStore.getState().quizTitle,
      user_id: useUserProfileStore?.getState().user?.user_id || ''
    }
    localStorage.setItem('userLog', JSON.stringify(readingActivityLog))
  }

  // Listen socket messages
  useEffect(() => {
    if (quizSocket === null || !quizSocket) return
    quizSocket.onmessage = (event) => {
      const message = JSON.parse(event.data)
      if (message.total_questions > 0) {
        const payload = {
          event: 'START_QUIZ',
          data: {
            user_id: userInfoId
          }
        }
        quizSocket.send(JSON.stringify(payload))
        const newTotalTime = isNumber(
          useDoQuizStore.getState()?.remainingTotalTime
        )
          ? useDoQuizStore.getState()?.remainingTotalTime
          : message?.total_time
        useDoQuizStore.setState({ totalTime: newTotalTime })
      }
      if (message.event === 'SEND_QUESTION') {
        const questions = isArray(message.data) ? message.data : []
        const convertedQuestions = questions?.map((item: any) => ({
          id: item?.id,
          name: item?.name,
          categoryCode: item?.question_category?.code,
          categoryName: item?.question_category?.name,
          point: item?.point,
          time: item?.time,
          assetType: item?.asset_type || '',
          fileUrl: item?.file_urls?.url || '',
          previewProps: getQuestionPreviewProps(item),
          choicesCount: item?.choices?.length || 0,
          mustResponse: item?.must_response || false
        }))
        const convertedQuestionIds = convertedQuestions?.map(
          (item: any) => item?.id
        )
        const orderedQuestionIds = useDoQuizStore.getState()?.orderedQuestionIds
        if (isArray(orderedQuestionIds) && orderedQuestionIds?.length > 0) {
          // If orderedQuestionIds is already set, use it
          convertedQuestions.sort((a: Question, b: Question) => {
            return (
              orderedQuestionIds.indexOf(a.id) -
              orderedQuestionIds.indexOf(b.id)
            )
          })
        }
        const newRetryCounts = new Map(retryCounts)
        convertedQuestions.forEach((question: Question) => {
          newRetryCounts.set(
            question?.id,
            getQuestionRetryCount(
              question?.categoryCode,
              question?.choicesCount
            )
          )
        })
        useDoQuizStore.setState({
          questions: convertedQuestions as Question[],
          orderedQuestionIds:
            isArray(orderedQuestionIds) && orderedQuestionIds?.length > 0
              ? orderedQuestionIds
              : convertedQuestionIds,
          isQuestionsFetched: true,
          quizSocketEvent: QUIZ_SOCKET_EVENT.SEND_QUESTION,
          // Set the first question as active if no active question
          activeQuestionId:
            useDoQuizStore.getState()?.activeQuestionId ||
            convertedQuestions?.[0]?.id,
          retryCounts: newRetryCounts
        })
      }

      if (message.event === 'SHOW_RESULT') {
        const questionId = message.data?.results?.[0]?.question_id || ''
        // Update results
        const newResults = new Map(results)
        newResults.set(questionId, {
          questionId,
          isCorrect: message.data?.is_all_correct,
          response: message.data?.results
        })

        // Update retry counts
        const newRetryCounts = new Map(retryCounts)
        const currentRetryCount = retryCounts.get(questionId)
        newRetryCounts.set(questionId, Number(currentRetryCount) - 1)

        useDoQuizStore.setState({
          results: newResults,
          retryCounts: newRetryCounts,
          isChecking: false
        })
      }

      if (message.event === 'ANALYTIC_RESULT') {
        useDoQuizStore.setState({
          analyticResult: pick(message.data, [
            'total_score',
            'last_correct_percent',
            'current_correct_percent',
            'total_wrong_answers',
            'total_correct_answers',
            'total_duration',
            'total_all_score'
          ])
        })
      }
      if (message.event === 'END_QUIZ') {
        useDoQuizStore.setState({
          isOpenCompleteModal: true,
          isSubmitting: false
        })
      }
    }
  }, [quizSocket, answers, studySetting, results, retryCounts])

  useEffect(() => {
    connectWebSocket()
  }, [])

  // Ping socket every 30 seconds to keep the connection alive
  useEffect(() => {
    if (!quizSocket) return
    const pingInterval = setInterval(() => {
      quizSocket.send(JSON.stringify({ event: 'PING' }))
    }, 30000)
    return () => {
      clearInterval(pingInterval)
    }
  }, [quizSocket])

  // Close socket and remove results before unmounting
  useEffect(() => {
    return () => {
      if (quizSocket) quizSocket.close()
    }
  }, [quizSocket])

  // Handle browser back button and before unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
      saveUserLogToLocalStorage()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    const handlePopState = () => {
      useGlobalStore.setState({ showExitModal: true })
      useDoQuizStore.setState({ isQuizStopped: true })
    }
    window.addEventListener('popstate', handlePopState)
    window.history.pushState(null, '', window.location.href)
    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      saveUserLogToLocalStorage()
    }
  }, [])

  return (
    <>
      {children}
      {renderCompleteModal()}

      <ExitModal
        onCancel={handleCancelExitQuiz}
        onConfirm={handleConfirmExitQuiz}
      />
    </>
  )
}
