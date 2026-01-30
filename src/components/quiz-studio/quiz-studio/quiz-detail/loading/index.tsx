import { Skeleton } from '@/components/ui/skeleton'

export default function QuizDetailLoading() {
  return (
    <div className="p-8 bg-white relative z-[2]">
      <div className="flex flex-col lg:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div className="flex md:items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Skeleton className="h-6 w-24" />
              <span className="text-gray-300">•</span>
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
        </div>
        <div className="flex items-center flex-col sm:flex-row gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <div className="bg-gray-100 rounded-md p-3">
        <div className="flex flex-wrap gap-3 items-center">
          <Skeleton className="h-5 w-40" />
          <span className="text-gray-300">•</span>
          <Skeleton className="h-5 w-32" />
          <span className="text-gray-300">•</span>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
        <div className="mt-2">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  )
}
