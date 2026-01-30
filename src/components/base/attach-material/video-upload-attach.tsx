import { Skeleton } from '@/components/ui/skeleton'
import { useGetFileLazyQuery } from '@/graphql/generated'
import { useDebounceEffect } from '@/hooks/use-debounce-effect'
import useInteractionObserver from '@/hooks/use-interaction-observer'
import { useEffect, useRef, useState } from 'react'

type VideoUploadAttachProps = {
  src: string
}
export default function VideoUploadAttach({ src }: VideoUploadAttachProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)

  const [getFile] = useGetFileLazyQuery()
  const [isInView, observerRef] = useInteractionObserver(wrapperRef, {
    threshold: 0.1
  })
  const [error, setError] = useState('')
  const handleError = () => {
    setError('Video bị lỗi')
  }
  const handleFetchVideoUrl = async () => {
    try {
      const { data } = await getFile({ variables: { file_key: src } })
      if (data?.get_file?.url) {
        setVideoUrl(data.get_file.url)
      }
    } catch (error) {
      console.error('error', error)
    }
    setLoading(false)
  }
  useDebounceEffect(
    () => {
      if (!src || !isInView) return
      if (isInView) {
        observerRef.current?.disconnect()
      }
      handleFetchVideoUrl()
    },
    200,
    [isInView]
  )
  useEffect(() => {
    if (videoUrl && !loading) {
      videoRef.current?.addEventListener('error', handleError)
      return () => {
        videoRef.current?.removeEventListener('error', handleError)
      }
    }
    return
  }, [videoUrl, loading])
  return (
    <div
      ref={wrapperRef}
      className="flex-1 rounded-lg overflow-hidden h-[420px] mx-auto"
    >
      {!error && !loading && videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          className="w-auto mx-auto h-[420px]"
        />
      )}
      {error && !loading && (
        <div className="text-center text-rose-500 py-4">{error}</div>
      )}
      {!error && loading && <Skeleton className="w-full h-72" />}
    </div>
  )
}
