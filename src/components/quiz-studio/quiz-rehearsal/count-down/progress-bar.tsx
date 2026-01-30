import { cn } from '@/lib/utils'
import { memo, useMemo } from 'react'
import { isNumber } from 'lodash-es'

type Props = {
  time: number
  elapsedTime: number
}

function ProgressBar({ time, elapsedTime }: Props) {
  const progressPercentage = useMemo(
    () => (elapsedTime / time) * 100,
    [time, elapsedTime]
  )

  const remainingTime = useMemo(
    () => Number(time) - Number(elapsedTime),
    [time, elapsedTime]
  )

  const getProgressColor = () => {
    if (progressPercentage < 33) return 'bg-green-400'
    if (progressPercentage < 66) return 'bg-yellow-400'
    return 'bg-red-500'
  }

  const formatTime = (s: number) => {
    if (!isNumber(s)) return
    const time = Math.ceil(s)
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = time % 60
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`
  }

  return (
    <div className="relative h-2 bg-gray-300 rounded-full min-w-[220px] md:min-w-[359px] lg:min-w-[462px]">
      <div style={{ width: `${progressPercentage}%` }} className="relative">
        <span
          className="absolute border-[1px]
            top-0 right-0 -translate-y-10 translate-x-1/2
            rounded-lg px-3 py-2 font-semibold text-xs text-[#414651] whitespace-nowrap bg-white shadow-lg"
        >
          {formatTime(remainingTime)}
        </span>
      </div>
      <div
        className={cn(
          'absolute top-0 left-0 duration-500 ease-in-out w-full h-full rounded-full transition-colors',
          getProgressColor()
        )}
        style={{
          width: `${progressPercentage}%`
        }}
      />
    </div>
  )
}

export default memo(ProgressBar)
