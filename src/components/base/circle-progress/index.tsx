import { cn } from '@/lib/utils'
import React from 'react'

type IProps = {
  percent: string
  className?: string
  customTitle?: string
  desc?: string
  titleClassname?: string
  strokeClassname?: string
  strokeWidth?: string
  hideInnerText?: boolean
}

export default function CircleProgress(props: IProps) {
  const {
    percent,
    className,
    desc,
    strokeClassname = '',
    strokeWidth = '2',
    hideInnerText = false
  } = props
  return (
    <div className={cn('relative', className)}>
      <svg
        className="size-full -rotate-90"
        viewBox="0 0 36 36"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          className="stroke-current text-gray-200 dark:text-neutral-700"
          strokeWidth={strokeWidth}
        />
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          className={cn(
            'stroke-current text-blue-600 dark:text-blue-500',
            strokeClassname
          )}
          strokeWidth={100 - Number(percent) === 100 ? 0 : strokeWidth}
          strokeDasharray="100"
          strokeDashoffset={(100 - Number(percent)).toString()}
          strokeLinecap="round"
        />
      </svg>

      <div className="absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2 flex flex-col text-center">
        {!hideInnerText && (
          <span
            className={cn('text-center font-semibold', props.titleClassname)}
          >
            {props.customTitle || `${percent}%`}
          </span>
        )}
        <p className="capitalize text-xs font-medium text-gray-400">{desc}</p>
      </div>
    </div>
  )
}
