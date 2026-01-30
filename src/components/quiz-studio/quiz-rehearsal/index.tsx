'use client'

import Main from './main'
import Sidebar from './sidebar'
import { useEffect } from 'react'
import {
  DoQuizStore,
  initDoQuizStore,
  useDoQuizStore
} from '@/stores/use-do-quiz-store'

export default function QuizRehearsal() {
  useEffect(() => {
    return () => {
      useDoQuizStore.setState(initDoQuizStore as DoQuizStore)
    }
  }, [])

  return (
    <div className="bg-gray-200 flex h-full relative">
      {/* Desktop only: Sidebar pushes Main */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>
      <Main />
    </div>
  )
}
