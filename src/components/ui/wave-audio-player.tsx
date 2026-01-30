'use client'

import Loading from '@/components/base/loading'
import { cn } from '@/lib/utils'
import { PauseIcon, PlayIcon } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'

interface AudioWaveformProps {
  audioUrl: string
  size?: number
  className?: string
  isMini?: boolean
  autoPlay?: boolean
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({
  audioUrl,
  size = 30,
  className,
  isMini = false,
  autoPlay
}) => {
  const waveformRef = useRef<HTMLDivElement>(null)
  const wavesurfer = useRef<WaveSurfer | null>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [duration, setDuration] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [isReady, setIsReady] = useState<boolean>(false)

  const fetchAudio = async (url: string, signal?: AbortSignal) => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/audio-proxy?url=${encodeURIComponent(url)}`,
        { signal }
      )
      if (!response.ok) throw new Error('Failed to fetch audio file')

      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      return blobUrl
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return
      }
      return null
    } finally {
      setLoading(false)
    }
  }

  const handlePlayPause = (): void => {
    if (wavesurfer.current && isReady) {
      wavesurfer.current.playPause()
    }
  }

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  useEffect(() => {
    const abortController = new AbortController()
    const initWaveSurfer = async () => {
      if (!waveformRef.current) return

      if (wavesurfer.current) {
        wavesurfer.current.destroy()
      }

      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#A4A7AE',
        progressColor: '#20447E',
        cursorColor: '#1e3a8a',
        barWidth: 4,
        barRadius: 3,
        responsive: true,
        height: size,
        normalize: true,
        partialRender: true,
        barGap: 7
      })

      const blobUrl = await fetchAudio(audioUrl, abortController.signal)
      if (blobUrl && wavesurfer.current) {
        wavesurfer.current.load(blobUrl)
      }

      wavesurfer.current?.on('ready', () => {
        setDuration(wavesurfer.current?.getDuration() || 0)
        setIsReady(true)
        if (autoPlay) {
          wavesurfer.current?.play()
        }
      })

      wavesurfer.current?.on('audioprocess', () => {
        setCurrentTime(wavesurfer.current?.getCurrentTime() || 0)
      })

      wavesurfer.current?.on('seek', () => {
        setCurrentTime(wavesurfer.current?.getCurrentTime() || 0)
      })

      wavesurfer.current?.on('play', () => setIsPlaying(true))
      wavesurfer.current?.on('pause', () => setIsPlaying(false))
      wavesurfer.current?.on('finish', () => setIsPlaying(false))
    }
    if (audioUrl) initWaveSurfer()

    return () => {
      abortController.abort()
      wavesurfer.current?.destroy()
    }
  }, [audioUrl])

  return (
    <div
      className={cn(
        'w-full flex items-center gap-3 h-full ',
        isMini && 'flex-col items-start justify-center',
        className
      )}
    >
      <div
        onClick={handlePlayPause}
        className={cn(
          'cursor-pointer h-11 w-11 bg-blue-800 items-center justify-center flex rounded-full text-white aspect-square',
          isMini && 'h-5 w-5'
        )}
      >
        {isPlaying ? (
          <PauseIcon size={isMini ? 10 : 20} />
        ) : (
          <PlayIcon size={isMini ? 10 : 20} />
        )}
      </div>

      <div className="flex flex-col gap-2 w-full">
        <div
          ref={waveformRef}
          className={cn(
            'relative cursor-pointer hover:opacity-90 transition-opacity w-full'
          )}
          style={{ display: isMini ? 'none' : undefined }}
        >
          {loading && (
            <div className="absolute inset-0 bg-white text-black flex items-center">
              <Loading color="#000" />
            </div>
          )}
        </div>

        <div className="font-semibold text-xs whitespace-nowrap gray-900">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    </div>
  )
}

export default AudioWaveform
