import { Skeleton } from '@/components/ui/skeleton'

export default function BookItemLoading() {
  return (
    <div
      role="book-skeleton-loading"
      className="w-full h-96 relative rounded-lg overflow-hidden"
    >
      <Skeleton className="w-full h-full" />
      <div className="absolute bottom-0 right-0 left-0 w-full bg-white z-2 ">
        <div className="relative p-4">
          <Skeleton className="w-1/2 h-4 mb-2" />
          <Skeleton className="w-1/3 h-4" />
        </div>
      </div>
    </div>
  )
}
