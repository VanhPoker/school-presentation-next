'use client'
import { Separator } from '@/components/ui/separator'
import { DialogCustom } from '../dialog-custom'
import { Camera, Check, Loader2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { base64ToFile } from '@/helper/base64ToFile'
import { isMobile } from 'react-device-detect'

type CameraScreenShotProps = {
  isOpen?: boolean
  onClose: (status: boolean) => void
  onSave: (file: File) => void
}
export default function CameraScreenShot({
  isOpen = false,
  onClose,
  onSave
}: CameraScreenShotProps) {
  const [isMouted, setIsMouted] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [previewImage, setPreviewImage] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const currentStream = useRef<MediaStream>(null)
  const [isReady, setIsReady] = useState(false)
  const [isDeniedAccessCamera, setIsDeniedAccessCamera] = useState(false)
  const [chunks, setChunks] = useState<Blob[]>([])
  const [mediaRecorder, setMeadiaRecoreder] = useState<MediaRecorder>()
  const handleInitCamera = async () => {
    if (!videoRef.current) return
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(
          // constraints - only audio needed for this app
          {
            video: {
              facingMode: isMobile ? 'environment' : 'user'
            },
            audio: false
          }
        )
        if (!stream.active) {
          setIsDeniedAccessCamera(true)
          return
        }
        currentStream.current = stream
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm'
        })
        videoRef.current.srcObject = stream
        setMeadiaRecoreder(mediaRecorder)
      } catch (error) {
        setIsReady(true)
        setIsDeniedAccessCamera(true)
        console.error('record', error)
      }

      // Success callback
    }
  }
  const handleDataAvaiable = (ev: BlobEvent) => {
    if (ev.data) {
      setChunks([ev.data])
    }
  }
  const handleReset = () => {
    setChunks([])
    setPreviewImage('')
    mediaRecorder?.start()
  }
  const handleSave = () => {
    if (!previewImage) return
    const fileImage = base64ToFile(previewImage, 'thumbnail')
    onSave(fileImage)
    onClose(false)
  }
  const handleCapture = async (chunks: Blob[]) => {
    if (chunks.length === 0) return
    canvasRef.current!.height = videoRef.current!.videoHeight
    canvasRef.current!.width = videoRef.current!.videoWidth
    const context = canvasRef.current!.getContext('2d')
    context!.drawImage(
      videoRef.current!,
      0,
      0,
      canvasRef.current!.width,
      canvasRef.current!.height
    )
    setPreviewImage(canvasRef.current!.toDataURL())
  }
  useEffect(() => {
    if (!isMouted) {
      setIsMouted(true)
      return
    }
    if (!mediaRecorder) {
      handleInitCamera()
    } else {
      mediaRecorder.addEventListener('dataavailable', handleDataAvaiable)
      mediaRecorder.start()
      setIsReady(true)
    }
    return () => {
      mediaRecorder?.stop()
      mediaRecorder?.removeEventListener('dataavailable', handleDataAvaiable)
    }
  }, [mediaRecorder, isMouted])
  useEffect(() => {
    if (chunks.length === 0) return
    handleCapture(chunks)
  }, [chunks.length])
  //   useEffect(() => {
  //     if (videoUrl) {
  //       videoRef.current?.addEventListener('')
  //     }
  //   }, [videoUrl])
  useEffect(() => {
    return () => {
      currentStream.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])
  return (
    <DialogCustom
      className="max-w-5xl w-full max-h-[732px] h-screen"
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="w-full h-full flex flex-col">
        <h2 className="pb-5">Chụp ảnh</h2>
        <Separator className="mb-6" />
        <div className="flex-1 w-full rounded-md relative overflow-hidden">
          <div className="absolute inset-0 z-40">
            <video
              className="w-full h-full object-cover"
              ref={videoRef}
              muted
              autoPlay
              playsInline
              // onLoadedMetadata={()=>{
              //     handleInitCamera()
              // }}
              // playsInline
            ></video>
          </div>
          {isReady && !isDeniedAccessCamera && (
            <div className="absolute flex gap-2 -translate-x-1/2 left-1/2 bottom-8 z-50">
              {!previewImage && (
                <span
                  onClick={() => {
                    mediaRecorder?.stop()
                  }}
                  className="p-4 bg-red-500 rounded-full hover:scale-110 transition-transform cursor-pointer"
                >
                  <Camera color="#ffffff" size={32} />
                </span>
              )}
              {previewImage && (
                <span
                  onClick={() => {
                    handleReset()
                  }}
                  className="p-4 bg-red-500 z-50 rounded-full hover:scale-110 transition-transform cursor-pointer"
                >
                  <X color="#ffffff" size={32} />
                </span>
              )}
              {previewImage && (
                <span
                  onClick={handleSave}
                  className="p-4 bg-green-500 z-50 rounded-full hover:scale-110 transition-transform cursor-pointer"
                >
                  <Check color="#ffffff" size={32} />
                </span>
              )}
            </div>
          )}
          <canvas
            className="absolute top-0 left-0 -z-1"
            ref={canvasRef}
            // autoPlay
          ></canvas>
          {previewImage && (
            <div
              className="absolute inset-0 z-40"
              style={{
                background: `url(${previewImage})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            ></div>
          )}
          {isDeniedAccessCamera && (
            <div className=" absolute text-xl text-white inset-0 z-50 bg-black/30 grid place-content-center">
              Bạn đã không cung cấp quyền truy cập camera
            </div>
          )}
          {!isReady && (
            <div className="absolute z-50 inset-0 grid place-content-center bg-black/30">
              <span className="animate-spin">
                <Loader2 color="#ffffff" />
              </span>
            </div>
          )}
        </div>
      </div>
    </DialogCustom>
  )
}
