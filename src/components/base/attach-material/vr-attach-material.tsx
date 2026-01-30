import { Skeleton } from '@/components/ui/skeleton'
import useInteractionObserver from '@/hooks/use-interaction-observer'
import { useRef } from 'react'
import EmbeddedUploadAttach from './embedded-upload-attach'
import { useDebounceEffect } from '@/hooks/use-debounce-effect'

type VrAttachMaterialProps = {
  src: string
}
export default function VrAttachMaterial({ src }: VrAttachMaterialProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [isInView, observerRef] = useInteractionObserver(wrapperRef, {
    threshold: 0.4
  })
  useDebounceEffect(
    () => {
      if (!isInView) return
      observerRef.current?.disconnect()
    },
    200,
    [isInView]
  )
  if (src.startsWith('image-node')) {
    return <EmbeddedUploadAttach type="vr" src={src} />
  }

  return (
    <div ref={wrapperRef} className="min-h-96 w-full">
      {!isInView ? (
        <Skeleton className="w-full h-full" />
      ) : (
        <iframe allowFullScreen src={src} className="w-full h-full" />
      )}
    </div>
  )
}
