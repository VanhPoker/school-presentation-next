import useInteractionObserver from '@/hooks/use-interaction-observer'
import { cn } from '@/lib/utils'
import { PropsWithChildren, useRef } from 'react'
type LazyLoadComponentProps = {
  className?: string
}
export default function LazyLoadComponent({
  children,
  className = ''
}: PropsWithChildren<LazyLoadComponentProps>) {
  const containerRef = useRef(null)
  const [isInview] = useInteractionObserver(containerRef, {
    runOnce: true,
    threshold: 0.5
  })
  return (
    <div className={cn(className)} ref={containerRef}>
      {isInview ? children : null}
    </div>
  )
}
