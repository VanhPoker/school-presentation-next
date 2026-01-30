import { Skeleton } from '@/components/ui/skeleton'
import useInteractionObserver from '@/hooks/use-interaction-observer'
import { useEffect, useRef } from 'react'

type LoadMoreProps = {
  height?: number
  callBack?: VoidFunction
  isLoading?: boolean
  children?: React.ReactNode
}
export default function LoadMore({
  height = 88,
  isLoading = false,
  callBack,
  children
}: LoadMoreProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [isInView] = useInteractionObserver(wrapperRef, {
    threshold: 0.1
  })
  useEffect(() => {
    if (isLoading) return
    if (isInView) {
      callBack?.()
    }
  }, [isInView])
  return (
    <div role="loadmore-container" ref={wrapperRef}>
      {children ?? <Skeleton className="w-full h-full" style={{ height }} />}
    </div>
  )
}
