import { Skeleton } from '@/components/ui/skeleton'
import { useSearchParams } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { RenderUIProps } from '..'

export default function RenderLoadingQuiz({
  isGetDetailDone,
  loadingApi
}: RenderUIProps) {
  const searchParams = useSearchParams()
  const quizdUrl = searchParams.get('quizId')

  if ((!isGetDetailDone && quizdUrl) || loadingApi) {
    return (
      <div className="p-6 space-y-6 bg-white rounded-md">
        <div className="flex items-center gap-1">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-60 w-full rounded-lg" />
        </div>
        <div className="mb-6">
          <div className="flex justify-between items-center flex-wrap mb-4">
            <div className="flex items-center">
              <Skeleton className="w-40 h-10 rounded-md" />
              <Separator orientation="vertical" className="bg-gray-300 h-9 " />
              <Skeleton className="w-40 h-10 rounded-md" />
            </div>
            <div className="flex items-center">
              <Skeleton className="w-10 h-10 rounded-md" />
              <Skeleton className="w-10 h-10 rounded-md ml-1" />
              <Skeleton className="w-10 h-10 rounded-md ml-1" />
              <Skeleton className="w-10 h-10 rounded-md ml-1" />
            </div>
          </div>
        </div>
        <div className="grid gap-4 grid-cols-2">
          <div className="relative w-full">
            <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
              <Skeleton className="w-10 h-10 rounded-md" />
              <Skeleton className="w-10 h-10 rounded-md" />
              <Skeleton className="w-10 h-10 rounded-md" />
              <Skeleton className="w-10 h-10 rounded-md" />
            </div>
            <Skeleton className="h-60 w-full rounded-lg" />
          </div>
          <div className="relative w-full">
            <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
              <Skeleton className="w-10 h-10 rounded-md" />
              <Skeleton className="w-10 h-10 rounded-md" />
              <Skeleton className="w-10 h-10 rounded-md" />
              <Skeleton className="w-10 h-10 rounded-md" />
            </div>
            <Skeleton className="h-60 w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }
  return null
}
