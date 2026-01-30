import { IMAGE_DOMAIN_URL } from '@/config'
import { useDebounceEffect } from '@/hooks/use-debounce-effect'
import useInteractionObserver from '@/hooks/use-interaction-observer'
import { startsWith } from 'lodash-es'
import { Loader } from 'lucide-react'
import { useCallback, useRef, useState, useEffect } from 'react'

type ScromAttachMaterialProps = {
  src: string
  className?: string
  isPreview?: boolean
  defaultMaterialName?: string
  defaultMaterialContent?: string
  handleUpdateContent?: (data: {
    materialName?: string
    materialContent?: string
  }) => void
}

export default function ScromAttachMaterial({
  src,
  className,
  defaultMaterialContent,
  defaultMaterialName,
  ...rest
}: ScromAttachMaterialProps) {
  const [scromUrl, setScromUrl] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const [isInView, observerRef] = useInteractionObserver(containerRef, {
    threshold: 0.1
  })

  const handleSetScromUrl = useCallback(() => {
    if (startsWith(src, 'http')) {
      setScromUrl(src)
    } else {
      setScromUrl(`${IMAGE_DOMAIN_URL}/${src}`)
    }
  }, [src])

  useEffect(() => {
    handleSetScromUrl()
  }, [src, handleSetScromUrl])

  useDebounceEffect(
    () => {
      if (isInView && !scromUrl) {
        observerRef.current?.disconnect()
        handleSetScromUrl()
      }
    },
    200,
    [isInView, scromUrl, handleSetScromUrl]
  )

  return (
    <div ref={containerRef} className={className}>
      {scromUrl ? (
        <iframe
          src={scromUrl}
          onError={(e) => {
            console.error('Error loading SCORM content:', e)
          }}
          allowFullScreen
          className="grow w-full"
          {...rest}
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-500">
          <Loader className="animate-spin" />
        </div>
      )}
    </div>
  )
}
