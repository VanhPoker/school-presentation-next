import 'react-image-crop/src/ReactCrop.scss'
import './style.scss'
import React, { useState, useRef, memo, useEffect } from 'react'
import { canvasPreview } from './canvasPreview'
import { useDebounceEffect } from '@/hooks/use-debounce-effect'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'
import { useListChatMessagesStore } from '@/stores/use-list-chat-messages-store'
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop'
import { pushFileToS3AndAppendPresignedUrl } from '@/helper/pushFileToS3AndAppendPresignedUrl'
import { useApollo } from '@/app/apollo/apolloClient'
import { toasts } from '@/components/ui/toast-color'
import { BE_API_URL, IMAGE_DOMAIN_URL } from '@/config'
import { useBookSidebarStore } from '@/stores/use-book-sidebar-store'
import Image from 'next/image'
type ImageRangeCaptureProps = {
  firstImageSrc: string
  containerRef: HTMLDivElement | null
  onCancel: VoidFunction
  secondImageSrc: string
}
function ImageRangeCapture({
  firstImageSrc,
  secondImageSrc,
  onCancel
}: ImageRangeCaptureProps) {
  const { apolloWithAuth } = useApollo()
  const imageRefOne = useRef<HTMLImageElement>(null)
  const [loading, setLoading] = useState(false)
  const imageRefTwo = useRef<HTMLImageElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const imageOneRefContainer = useRef<HTMLDivElement>(null)
  const imageTwoRefContainer = useRef<HTMLDivElement>(null)
  const [crop, setCrop] = useState<Crop>()
  const setStatus = useBookSidebarStore((state) => state.setStatus)
  const updateUploadedImageUrl = useListChatMessagesStore(
    (state) => state.updateUploadedImageUrl
  )
  const updateImageFileKey = useListChatMessagesStore(
    (state) => state.updateImageFileKey
  )
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const onEndCapture = () => {
    if (!previewCanvasRef.current || !apolloWithAuth) return
    setLoading(true)
    try {
      previewCanvasRef.current.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], 'capture.png', { type: 'image/png' })
          const { file_id, file_key } = await pushFileToS3AndAppendPresignedUrl(
            apolloWithAuth,
            file,
            'crop-image'
          )
          if (!file_id || !file_key) {
            toasts.error('Tải lên hình ảnh không thành công')
          } else {
            updateUploadedImageUrl(`${IMAGE_DOMAIN_URL}/${file_key}`)
            updateImageFileKey(file_key)
            setStatus({ isShowChatbot: true })
            onCancel()
          }
        }
        setLoading(false)
      })
    } catch (error) {
      toasts.error('Crop ảnh thất bại')
      console.error('error', error)
      setLoading(false)
    }
  }

  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imageRefOne.current &&
        previewCanvasRef.current
      ) {
        canvasPreview(
          imageRefTwo.current,
          imageRefOne.current,
          previewCanvasRef.current,
          completedCrop,
          imageOneRefContainer.current,
          imageTwoRefContainer.current
        )
      }
    },
    100,
    [completedCrop]
  )
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])
  return (
    <div className="absolute inset-0 z-50 ">
      <div className="fixed inset-0 bg-black/30 z-40 pointer-events-none"></div>
      <Button
        onClick={(e) => {
          e.stopPropagation()
          onCancel()
          updateUploadedImageUrl(null)
        }}
        type="button"
        className="fixed top-4 left-4 z-[9999]"
      >
        <X /> Thoát
      </Button>
      <div className="flex w-full h-full">
        <ReactCrop
          crop={crop}
          minHeight={10}
          minWidth={10}
          className="w-full relative"
          onChange={(_, percentCrop) => {
            setCrop(percentCrop)
            setCompletedCrop(undefined)
          }}
          onComplete={(c) => {
            setCompletedCrop(c)
          }}
          aspect={undefined}
        >
          <div className="flex justify-center h-full absolute top-0 left-0 pointer-events-none w-full">
            {firstImageSrc && (
              <div
                ref={imageOneRefContainer}
                className="xl:w-auto w-full xl:aspect-[653/912] relative z-50"
              >
                <Image
                  alt="crop-image"
                  ref={imageRefOne}
                  // Use unoptimize due to next/image optimize natural width on screen resize which make crop image calculate wrong crop position
                  unoptimized
                  crossOrigin="anonymous"
                  src={`${BE_API_URL}/api/v1/file-uploads/proxy-image?url=${firstImageSrc}`}
                  fill
                  className="object-contain w-full"
                />
              </div>
            )}
            {secondImageSrc && (
              <div
                ref={imageTwoRefContainer}
                className="xl:w-auto w-full xl:aspect-[653/912] relative z-50 xl:block hidden"
              >
                <Image
                  alt="crop-image"
                  ref={imageRefTwo}
                  crossOrigin="anonymous"
                  unoptimized
                  src={`${BE_API_URL}/api/v1/file-uploads/proxy-image?url=${secondImageSrc}`}
                  fill
                  className="object-contain hidden md:block w-full"
                />
              </div>
            )}
          </div>
        </ReactCrop>
      </div>
      {completedCrop &&
        completedCrop.width > 0 &&
        completedCrop.height > 0 &&
        imageOneRefContainer.current && (
          <div
            className="flex gap-2 fixed z-50 justify-center mt-6 md:mt-2"
            style={{
              top: `${Math.min(completedCrop.height + completedCrop.y + 70, imageOneRefContainer.current?.clientHeight - 90)}px`,
              zIndex: 99,
              left: `${completedCrop.x}px`,
              width: `${completedCrop.width}px`
            }}
          >
            <Button
              disabled={loading}
              onClick={(e) => {
                e.stopPropagation()
                setCrop(undefined)
                setCompletedCrop(undefined)
              }}
            >
              <X />
            </Button>
            <Button loading={loading} onClick={onEndCapture} disabled={loading}>
              <Check />
            </Button>
          </div>
        )}
      {!!completedCrop && (
        <div
          className="absolute bottom-2 right-2 border-2 box-content pointer-events-none opacity-0"
          style={{
            zIndex: 60,
            width: completedCrop.width,
            height: completedCrop.height
          }}
        >
          <canvas
            ref={previewCanvasRef}
            className="w-full h-full"
            style={
              {
                //   objectFit: 'contain'
              }
            }
          />
        </div>
      )}
      {/* {crop && (
        <Button onClick={onEndCapture} className="absolute top-4 right-4">
          Hỏi AI
        </Button>
      )} */}
    </div>
  )
}
export default memo(ImageRangeCapture)
