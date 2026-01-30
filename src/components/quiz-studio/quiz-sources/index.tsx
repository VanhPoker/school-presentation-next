'use client'

import { cn } from '@/lib/utils'
import { QUIZ_SOURCE_LIST } from '@/mock-data/quiz-studio/quiz-source'
import { ArrowLeftIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function QuizSourcesMain() {
  const searchParams = useSearchParams()
  const examIdFromUrl = searchParams.get('examId')
  const idBook = searchParams.get('idBook')
  const statusParams = searchParams.get('status')
  const codeParams = searchParams.get('codeType')
  return (
    <div className="px-6 pt-16 lg:pt-40 min-h-full overflow-y-auto flex bg-gray-200">
      <div className="max-w-5xl w-full mx-auto absolute top-0 left-0 z-20 p-6">
        <Link
          className="inline-block"
          href={`javascript:history.back()`}
          prefetch={false}
        >
          <ArrowLeftIcon />
        </Link>
      </div>
      <div className="max-w-5xl mx-auto">
        <div className="mb-16 relative text-center">
          <p className="text-md text-orange-500 mb-3">Tạo bài tập</p>
          <h1 className="text-4xl font-semibold">Chọn nguồn Tạo bài tập</h1>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {QUIZ_SOURCE_LIST.map((x: any, i: number) => {
            const { type, disable, imgIcon, title, description } = x
            return (
              <Link
                key={i + 1}
                id={type}
                href={`/quiz-types?type=${type}${examIdFromUrl ? `&examId=${examIdFromUrl}` : ''}&idBook=${idBook}&status=${statusParams}&codeType=${codeParams}`}
                className={cn(
                  'rounded-xl p-6 bg-white shadow-md hover:shadow-lg transition-all mb-5',
                  disable && 'pointer-events-none opacity-60 cursor-not-allowed'
                )}
              >
                <div className="flex flex-col items-center text-center -mt-14">
                  <Image
                    width={72}
                    height={72}
                    src={`${imgIcon}`}
                    className="border rounded-md mb-5 bg-white p-2"
                    alt="create-from-gk-ebook"
                  />
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {title}
                  </h3>
                  <p className="font-normal text-sm text-gray-600 text-center">
                    {description}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
