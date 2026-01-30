import { Skeleton } from '@/components/ui/skeleton'
import { useGetFileLazyQuery } from '@/graphql/generated'
import useInteractionObserver from '@/hooks/use-interaction-observer'
import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'
import { Material_Code } from '@/types/material/type'
import { useDebounceEffect } from '@/hooks/use-debounce-effect'
import MediaRender from '@/components/base/media-render'

type ImageAttachMaterialProps = {
  src: string
  width?: number
  isPreview?: boolean
  onResize?: (value: number) => void
}
export default function ImageAttachMaterial({
  src,
  width = 100,
  isPreview = true,
  onResize
}: ImageAttachMaterialProps) {
  const [getFile] = useGetFileLazyQuery()
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const wrapperRef = useRef<HTMLElement>(null)
  const [error, setError] = useState('')
  const [config, setConfig] = useState<{
    containWidth?: number
    wrapperWidth?: number
  }>({
    containWidth: width,
    wrapperWidth: undefined
  })
  const [isInView, observerRef] = useInteractionObserver(wrapperRef, {
    threshold: 0.1
  })
  const lastX = useRef<number | undefined>(undefined)
  const directionDrag = useRef<'left' | 'right' | ''>('')

  const handleResize = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      !lastX.current ||
      !config?.containWidth ||
      !config?.wrapperWidth ||
      !isResizing ||
      !directionDrag.current
    )
      return

    const offset =
      directionDrag.current === 'right'
        ? e.clientX - lastX.current
        : lastX.current - e.clientX
    const currentWidth = (config.containWidth * config.wrapperWidth) / 100
    if (config.wrapperWidth <= currentWidth + offset) return
    const percentage = ((currentWidth + offset) * 100) / config.wrapperWidth!
    if (percentage < 30) return
    setConfig((prev) => ({
      ...prev,
      containWidth: percentage
    }))
    onResize?.(percentage)
  }
  const handleMouseUp = () => {
    setIsResizing(false)
    lastX.current = undefined
    directionDrag.current = ''
  }
  const handleImageLoad = () => {
    setConfig((prev) => ({
      ...prev,
      wrapperWidth: wrapperRef.current?.clientWidth || 0
    }))
  }
  const handleImageError = () => {
    setError('Ảnh lỗi')
  }
  const handleFetchImageUrl = async () => {
    try {
      const { data } = await getFile({ variables: { file_key: src } })
      if (data?.get_file?.url) {
        setImageUrl(data.get_file.url)
      }
    } catch (error) {
      console.error('error', error)
    }
    setLoading(false)
  }
  useEffect(() => {
    if (!imageRef.current || !imageUrl) return
    imageRef.current.addEventListener('load', handleImageLoad)
    imageRef.current.addEventListener('error', handleImageError)

    return () => {
      imageRef.current?.removeEventListener('load', handleImageLoad)
      imageRef.current?.removeEventListener('error', handleImageError)
    }
  }, [imageUrl])

  useDebounceEffect(
    () => {
      if (!src || !isInView) return
      if (isInView) {
        observerRef.current?.disconnect()
      }
      if (src.startsWith('image-node')) {
        handleFetchImageUrl()
      } else {
        setImageUrl(src)
        setLoading(false)
      }
    },
    200,
    [isInView]
  )

  return (
    <figure
      ref={wrapperRef}
      contentEditable={false}
      className={cn('flex-1 group z-10 relative', loading ? 'min-h-52' : '')}
    >
      <div
        ref={containerRef}
        className={cn('relative mx-auto', isResizing && 'pointer-events-none')}
        style={{ width: `${config.containWidth}%` }}
      >
        {!isPreview && !error && (
          <>
            <div
              onMouseDown={(e) => {
                lastX.current = e.clientX
                directionDrag.current = 'left'
                setIsResizing(true)
              }}
              className="w-1 h-16 cursor-col-resize absolute transition-opacity group-hover:opacity-100 opacity-0 left-1 z-20 top-1/2 -translate-y-1/2 rounded-lg border bg-black/40"
            />
            <div
              onMouseDown={(e) => {
                lastX.current = e.clientX
                directionDrag.current = 'right'
                setIsResizing(true)
              }}
              className={cn(
                'w-1 h-16 cursor-col-resize absolute transition-opacity group-hover:opacity-100 opacity-0 right-1 z-20 top-1/2 -translate-y-1/2 rounded-lg border bg-black/40'
              )}
            />
          </>
        )}
        {!error && !loading && imageUrl && (
          <MediaRender
            url={imageUrl}
            type={Material_Code.IMAGE}
            ref={imageRef}
          />
        )}
        {error && !loading && (
          <div className="text-center text-rose-500 py-4">{error}</div>
        )}
      </div>
      {loading && (
        <Skeleton className="absolute top-0 inset-x-0 min-h-52 z-30" />
      )}
      {/* {((config.wrapperWidth === undefined && !error) || loading) && (
          <Skeleton className="absolute top-0 inset-x-0 min-h-52 z-30" />
        )} */}
      {isResizing && (
        <div
          onMouseMove={handleResize}
          onMouseUp={handleMouseUp}
          className="fixed z-50 inset-0"
        />
      )}
    </figure>
  )
}
