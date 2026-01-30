import { useReadOriginalBookStore } from '@/stores/use-read-original-book-store'
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

export default function useQuizInBook() {
  const { activeQuizId, quizResults, quizAction } = useReadOriginalBookStore(
    useShallow((state) => ({
      activeQuizId: state.activeQuizId,
      quizResults: state.quizResults,
      quizAction: state.quizAction
    }))
  )

  const activeQuizResult = useMemo(
    () => quizResults?.find((item) => item?.id === activeQuizId),
    [activeQuizId, quizResults]
  )

  const isActiveQuizChecking = (quizId: string) =>
    quizAction === 'check' && quizId === activeQuizId

  const isActiveQuizExplaining = (quizId: string) =>
    quizAction === 'explain' && quizId === activeQuizId

  const isActiveQuizRefreshing = (quizId: string) =>
    quizAction === 'refresh' && quizId === activeQuizId

  return {
    activeQuizResult,
    activeQuizResultStatus: activeQuizResult?.status,
    isActiveQuizChecking,
    isActiveQuizExplaining,
    isActiveQuizRefreshing
  }
}
