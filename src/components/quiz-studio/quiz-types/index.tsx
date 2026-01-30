'use client'

import { QuizCreateResource } from '@/types/quiz-create'
import { redirect, useSearchParams } from 'next/navigation'
import Manual from './type-manual'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowLeftIcon } from 'lucide-react'

const StorageQuiz = dynamic(() => import('./storage-quiz'), {
  ssr: false
})

export default function QuizTypesMain() {
  const searchParams = useSearchParams()
  const typeFromUrl = searchParams.get('type')
  const renderQuizCreateByType = (type: string) => {
    switch (type) {
      case QuizCreateResource.STORAGE:
        return <StorageQuiz />
      case QuizCreateResource.AI_GEN:
        return (
          <div className="h-full bg-white p-6 rounded-2xl">
            <p className="text-center pt-4">Đang trong quá trình phát triển</p>
          </div>
        )
      case QuizCreateResource.MANUAL:
        return (
          <div className="h-full bg-white p-6 rounded-2xl">
            <Manual />
          </div>
        )

      default:
        redirect('/quiz-sources')
    }
  }

  return (
    <div className="quiz-source bg-gray-200 h-full">
      <div className="flex md:flex-row flex-col h-full">
        <div className="w-full min-h-full py-6 px-4 lg:px-16">
          <Link
            className="mb-4 inline-block"
            prefetch={false}
            href={`javascript:history.back()`}
          >
            <ArrowLeftIcon />
          </Link>
          {renderQuizCreateByType(typeFromUrl!)}
        </div>
      </div>
    </div>
  )
}
