import { useDoQuizStore } from '@/stores/use-do-quiz-store'
import { QUIZ_SOCKET_EVENT } from '@/types/quiz-studio'
import { getCountdownTimer } from '@/utils/quizStudio'
import { memo, useEffect, useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import useDoQuiz from '../_hooks/useDoQuiz'

const TotalTimeCountDown = () => {
  const [time, setTime] = useState(0)

  const {
    totalTime,
    quizSocketEvent,
    answers,
    isQuizStopped,
    isQuestionsFetched
  } = useDoQuizStore(
    useShallow((state) => ({
      totalTime: state.totalTime,
      quizSocketEvent: state.quizSocketEvent,
      answers: state.answers,
      isQuizStopped: state.isQuizStopped,
      isQuestionsFetched: state.isQuestionsFetched
    }))
  )
  const { handleSubmitAnswer } = useDoQuiz()

  const timer = useMemo(
    () =>
      getCountdownTimer(time, (value: number) =>
        value?.toString()?.padStart(2, '0')
      ),
    [time]
  )

  useEffect(() => {
    setTime(totalTime)
  }, [totalTime])
  useEffect(() => {
    if (
      quizSocketEvent === QUIZ_SOCKET_EVENT.END_QUIZ ||
      isQuizStopped ||
      !isQuestionsFetched
    ) {
      return
    }
    const countdownTimer = setInterval(() => {
      if (time === 0) {
        clearInterval(countdownTimer)
        useDoQuizStore.setState({
          quizSocketEvent: QUIZ_SOCKET_EVENT.TIMES_UP
        })
        return
      }
      setTime(time - 1)
      useDoQuizStore.setState({
        remainingTotalTime: time - 1
      })
    }, 1000)
    return () => {
      clearInterval(countdownTimer)
    }
  }, [time, quizSocketEvent, isQuizStopped, isQuestionsFetched])

  // Submit the answer when the time is up
  useEffect(() => {
    if (quizSocketEvent === QUIZ_SOCKET_EVENT.TIMES_UP) {
      handleSubmitAnswer()
    }
  }, [quizSocketEvent, answers])

  return (
    <span className="text-sm sm:text-2xl font-bold text-[#055BE6]">
      {timer?.hours !== '00' && `${timer?.hours} :`} {timer?.minutes} :{' '}
      {timer?.seconds}
    </span>
  )
}

export default memo(TotalTimeCountDown)
