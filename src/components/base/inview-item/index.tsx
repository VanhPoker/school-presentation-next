'use client'

import { WEB_ENVIRONMENT } from '@/config'
import { useInView } from 'motion/react'
import { PropsWithChildren, useEffect, useRef } from 'react'

type InViewItemProps = {
  align?: 'start' | 'end'
}
export default function InViewItem({
  align = 'start',
  children
}: PropsWithChildren<InViewItemProps>) {
  const itemRef = useRef<HTMLDivElement>(null)
  const maskRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(itemRef, { amount: 0.9 })
  useEffect(() => {
    if (!maskRef.current) return
    if (isInView) {
      maskRef.current.classList.remove('opacity-100')
      maskRef.current.classList.add('opacity-0')
    } else {
      maskRef.current.classList.remove('opacity-0')
      maskRef.current.classList.add('opacity-100')
    }
  }, [isInView])
  if (WEB_ENVIRONMENT === 'test') return children
  return (
    <>
      {align === 'end' && (
        <div
          ref={maskRef}
          className="from-white pointer-events-none bg-gradient-to-l opacity-0 to-white/10 h-full w-24 absolute top-0 right-0 z-50"
        />
      )}
      {align === 'start' && (
        <div
          ref={maskRef}
          className="from-white pointer-events-none bg-gradient-to-r opacity-0 to-white/10 h-full w-24 absolute top-0 left-0 z-50"
        />
      )}
      <span className={'flex items-center'} ref={itemRef}>
        {children}
      </span>
    </>
  )
}
