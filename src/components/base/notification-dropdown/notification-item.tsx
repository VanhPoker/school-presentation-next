import dayjs from 'dayjs'
import { useMemo } from 'react'

type NotificationItemProps = {
  icon: React.ReactNode
  title: string
  createdAt: string
  description: string
}
export default function NotificationItem({
  icon,
  title,
  createdAt,
  description
}: NotificationItemProps) {
  const formatTime = useMemo(() => {
    const date = dayjs(createdAt).add(7, 'hour')
    if (!date.isValid()) return '-'
    return date.fromNow()
  }, [createdAt])
  return (
    <div className="flex gap-2 items-start md:min-w-80">
      {icon}
      <div className="">
        <h3 className="flex flex-wrap gap-x-2 items-center">
          <span className="font-semibold text-sm">{title}</span>
          <span className="text-xs text-[#A4A7AE]">{formatTime}</span>
        </h3>
        <p className="text-xs text-[#414651] mt-1">{description}</p>
      </div>
    </div>
  )
}
