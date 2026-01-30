import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import {
  FileChartLine,
  Loader2,
  LogOutIcon,
  User,
  UserIcon
} from 'lucide-react'
import { useLocalStorage } from 'react-use'
import { useState } from 'react'
import { useUserProfileStore } from '@/stores/use-user-profile-store'
import { logoutDevice } from '@/services/auth'
import { getAccessTokenFromCookie } from '@/server-action/auth'
import { toasts } from '../ui/toast-color'
import UserChatbotQuota from '@/components/user/user-chatbot-quota'
import { UserRole } from '@/types/auth/account-permission'
import { ADMIN_ROLES } from '@/constants'
type ProfileDropdownProps = {
  isHidden?: boolean
}

export function ProfileDropdown({ isHidden = false }: ProfileDropdownProps) {
  const [isLogout, setIsLogout] = useState(false)
  const user = useUserProfileStore((state) => state.user)
  const loaded = useUserProfileStore((state) => state.loaded)
  const [, , removeConversationId] = useLocalStorage<string>('conversationId')
  const validRole = user?.role || UserRole.USER
  if (isHidden) return null
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          role="avatar-button"
          variant="ghost"
          className="relative p-0 sm:size-10 size-8 rounded-full"
        >
          {!loaded || isLogout ? (
            <span className="animate-spin relative z-10">
              <Loader2 color="#ffffff" />
            </span>
          ) : (
            <Avatar className=" sm:size-10 size-8 rounded-full relative z-10">
              <AvatarImage
                src={user?.avatar || ''}
                alt="userImage"
                className="object-contain"
              />
              <AvatarFallback>
                <UserIcon />
              </AvatarFallback>
            </Avatar>
          )}
          {user?.user_package?.name && (
            <>
              <span
                className="absolute -z-1 -inset-1.5 rounded-full"
                style={{
                  background: 'linear-gradient(to right, #FF7A00, #FFD439)'
                }}
              />
              <span className="absolute -z-1 -inset-1 rounded-full bg-white" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal flex gap-3 relative items-start">
          <div className="relative">
            <Avatar className="sm:size-10 size-8 relative z-10">
              <AvatarImage
                src={user?.avatar || ''}
                alt="user-image"
                className="object-contain"
              />
              <AvatarFallback>
                <UserIcon />
              </AvatarFallback>
            </Avatar>
            <span className="absolute border-2 border-white bottom-0 -right-1 z-10 inline-flex size-4 rounded-full bg-green-600" />
            {user?.user_package?.name && (
              <>
                <span
                  className="absolute -z-1 -inset-1.5 rounded-full"
                  style={{
                    background: 'linear-gradient(to right, #FF7A00, #FFD439)'
                  }}
                />
                <span className="absolute -z-1 -inset-1 rounded-full bg-white" />
              </>
            )}
          </div>
          <div className="flex items-center space-y-1 h-full my-auto">
            <p className="text-sm font-medium leading-none">{user?.fullname}</p>
            {/* <Badge variant={'tag'}>Học sinh</Badge> */}
          </div>
        </DropdownMenuLabel>
        {!ADMIN_ROLES.includes(validRole) && <UserChatbotQuota />}
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link
              prefetch={false}
              href="/ca-nhan/bao-cao-hoat-dong"
              className="font-medium"
            >
              <FileChartLine size={16} />
              Báo cáo hoạt động
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link prefetch={false} href="/ca-nhan" className="font-medium">
              <User size={16} />
              Thông tin cá nhân
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            if (isLogout) return
            setIsLogout(true)
            const accessToken = await getAccessTokenFromCookie()
            await logoutDevice(accessToken)
            await signOut({ callbackUrl: `/dang-nhap` })
            removeConversationId()
            const logoutChannel = new BroadcastChannel('auth')
            logoutChannel.postMessage('logout')
            setIsLogout(false)
            toasts.info('Đang đăng xuất..')
          }}
        >
          <LogOutIcon size={16} />
          {isLogout ? 'Đang đăng xuất...' : 'Đăng xuất'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
