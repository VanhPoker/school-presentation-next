import LoadMore from '@/components/base/load-more'
import NotificationItem from '@/components/base/notification-dropdown/notification-item'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useUserNotificationStore } from '@/stores/use-user-notification-store'
import { Bell, Info, Package, Smile, Sprout } from 'lucide-react'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/vi' // Import the Vietnamese locale
import dayjs from 'dayjs'
import { motion } from 'motion/react'
dayjs.locale('vi')
dayjs.extend(relativeTime)
type NotificationDropdownProps = {
  className?: string
}
export default function NotificationDropdown({
  className = ''
}: NotificationDropdownProps) {
  const data = useUserNotificationStore((state) => state.data)
  const hasMore = useUserNotificationStore((state) => state.hasMore)
  const notReadMessageCount = useUserNotificationStore(
    (state) => state.notReadMessageCount
  )
  const loaded = useUserNotificationStore((state) => state.loaded)
  const offset = useUserNotificationStore((state) => state.offset)
  const isFetchingMore = useUserNotificationStore(
    (state) => state.isFetchingMore
  )
  const setStatus = useUserNotificationStore((state) => state.setStatus)
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'classic'}
          aria-label="notification"
          className={cn(
            'size-9 md:size-[46px] rounded-lg border-2 grid place-content-center relative bg-white border-solid border-transparent p-0 data-[state=open]:border-blue-700 md:[&_svg]:size-6',
            className
          )}
          onClick={() => {
            setStatus({ notReadMessageCount: 0 })
          }}
        >
          <Bell className="!size-5" color="#000000" />
          {notReadMessageCount > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bg-red-600 text-black w-4 h-4 top-0 md:top-1.5 grid place-content-center right-0 md:right-2 rounded-full z-40"
            >
              <span className="text-white" style={{ fontSize: 10 }}>
                {Math.min(notReadMessageCount, 9)}
                {notReadMessageCount > 9 && '+'}
              </span>
            </motion.div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-full max-w-96 py-4 px-0">
        <h3 className="font-semibold mb-4 px-3">Thông báo</h3>
        <div
          className={cn(
            'max-h-80 relative space-y-4 px-3',
            isFetchingMore ? 'overflow-y-hidden' : 'overflow-y-auto'
          )}
        >
          {!loaded && (
            <>
              <Skeleton className="w-80 h-18" />
              <Skeleton className="w-80 h-18" />
              <Skeleton className="w-80 h-18" />
            </>
          )}
          {loaded && data.length === 0 && (
            <p className="text-center md:w-80 text-sm">Chưa có thông báo nào</p>
          )}
          {data.map((item) => {
            const validDate = item.created_at || new Date()
            if (!item?.title) return null
            if (item.type === 'ORDER') {
              return (
                <NotificationItem
                  key={item.id}
                  icon={
                    <span className="bg-[#DCFAE6] p-3 rounded-full">
                      <Package size={16} color="#079455" />
                    </span>
                  }
                  title={item.title || 'N/A'}
                  createdAt={validDate}
                  description={item.content}
                />
              )
            }
            if (item.type === 'SYSTEM') {
              return (
                <NotificationItem
                  key={item.id}
                  icon={
                    <span className="bg-[#F5F5F5] p-3 rounded-full">
                      <Info size={16} color="#717680" />
                    </span>
                  }
                  title={item.title || 'N/A'}
                  createdAt={validDate}
                  description={item.content}
                />
              )
            }
            if (item.type === 'USAGE') {
              return (
                <NotificationItem
                  key={item.id}
                  icon={
                    <span className="bg-[#FEF0C7] p-3 rounded-full">
                      <Sprout size={16} color="#D92D20" />
                    </span>
                  }
                  title={item.title || 'N/A'}
                  createdAt={validDate}
                  description={item.content}
                />
              )
            }
            if (item.type === 'USAGE_LIMIT') {
              return (
                <NotificationItem
                  key={item.id}
                  icon={
                    <span className="bg-[#FEE4E2] p-3 rounded-full">
                      <Sprout size={16} color="#D92D20" />
                    </span>
                  }
                  title={item.title || 'N/A'}
                  createdAt={item.created_at}
                  description={item.content}
                />
              )
            }
            return (
              <NotificationItem
                key={item.id}
                icon={
                  <span className="bg-[#D3E9FD] p-3 rounded-full">
                    <Smile size={16} color="#0D67F7" />
                  </span>
                }
                title={item.title || 'N/A'}
                createdAt={item.created_at}
                description={item.content}
              />
            )
          })}
          {hasMore && loaded && data.length >= 10 && (
            <LoadMore
              isLoading={isFetchingMore}
              callBack={() => {
                setStatus({ offset: offset + 10 })
              }}
            />
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
