import { Skeleton } from '@/components/ui/skeleton'
import AudioWaveform from '@/components/ui/wave-audio-player'
import { useGetFileQuery } from '@/graphql/generated'
import { useEffect, useRef, useState } from 'react'

type AudioUploadAttachProps = {
  src: string
}
export default function AudioUploadAttach({ src }: AudioUploadAttachProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { data, loading } = useGetFileQuery({
    variables: {
      file_key: src
    }
  })
  const [error, setError] = useState('')
  const handleError = () => {
    setError('Audio bị lỗi')
  }
  useEffect(() => {
    if (data?.get_file?.url && !loading) {
      videoRef.current?.addEventListener('error', handleError)
      return () => {
        videoRef.current?.removeEventListener('error', handleError)
      }
    }
    return
  }, [data?.get_file?.url, loading])
  return (
    <div className="flex-1">
      {!error && !loading && data?.get_file?.url && (
        <AudioWaveform audioUrl={data.get_file.url} />
      )}
      {error && !loading && (
        <div className="text-center text-rose-500 py-4">{error}</div>
      )}
      {!error && loading && <Skeleton className="w-full h-40" />}
    </div>
  )
}
