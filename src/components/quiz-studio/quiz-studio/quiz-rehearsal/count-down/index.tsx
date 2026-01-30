'use client'

import { memo, useEffect, useRef, useState } from 'react'
import { useDoQuizStore } from '@/stores/use-do-quiz-store'
import { useShallow } from 'zustand/react/shallow'
import ProgressBar from './progress-bar'
import { QUIZ_SOCKET_EVENT } from '@/types/quiz-studio'
import useDoQuiz from '../_hooks/useDoQuiz'
import { isNumber } from 'lodash-es'

function CountDown() {
  const {
    activeQuestionId,
    questions,
    answers,
    quizSocketEvent,
    isQuestionsFetched,
    isQuizStopped,
    currentQuizElapsedTime
  } = useDoQuizStore(
    useShallow((state) => ({
      activeQuestionId: state.activeQuestionId,
      questions: state.questions,
      answers: state.answers,
      quizSocketEvent: state.quizSocketEvent,
      isQuestionsFetched: state.isQuestionsFetched,
      isQuizStopped: state.isQuizStopped,
      currentQuizElapsedTime: state.currentQuizElapsedTime
    }))
  )
  const { activeQuestionTime, activeQuestionIndex, handleSubmitAnswer } =
    useDoQuiz()
  const [elapsedTime, setElapsedTime] = useState(
    isNumber(currentQuizElapsedTime) ? currentQuizElapsedTime : 0
  )
  const prevActiveQuestionId = useRef(activeQuestionId)

  useEffect(() => {
    if (
      !isQuestionsFetched ||
      quizSocketEvent === QUIZ_SOCKET_EVENT.END_QUIZ ||
      isQuizStopped
    )
      return
    // If the active question ID has changed, reset the elapsed time
    if (prevActiveQuestionId.current !== activeQuestionId) {
      prevActiveQuestionId.current = activeQuestionId
      setElapsedTime(0)
    }
    const timer = setInterval(() => {
      setElapsedTime((prev) => {
        const next = prev + 10
        if (next >= Number(activeQuestionTime) * 1000) {
          // If the current question is not the last one, move to the next question. Otherwise, emit the TIMES_UP event.
          if (activeQuestionIndex === questions.length - 1) {
            useDoQuizStore.setState({
              quizSocketEvent: QUIZ_SOCKET_EVENT.TIMES_UP,
              currentQuizElapsedTime: next
            })
            return next
          } else {
            useDoQuizStore.setState({
              activeQuestionId: questions?.[activeQuestionIndex + 1]?.id,
              currentQuizElapsedTime: 0
            })
            return 0
          }
        }
        useDoQuizStore.setState({
          currentQuizElapsedTime: next
        })
        return next
      })
    }, 10)

    return () => {
      clearInterval(timer)
    }
  }, [
    activeQuestionId,
    activeQuestionTime,
    activeQuestionIndex,
    isQuestionsFetched,
    questions,
    quizSocketEvent,
    isQuizStopped
  ])

  // Submit the answer when the time is up
  useEffect(() => {
    if (quizSocketEvent === QUIZ_SOCKET_EVENT.TIMES_UP) {
      handleSubmitAnswer()
    }
  }, [quizSocketEvent, answers])

  if (!isQuestionsFetched) return
  return (
    <ProgressBar
      time={Number(activeQuestionTime)}
      elapsedTime={Number(elapsedTime) / 1000}
    />
  )
}

export default memo(CountDown)
