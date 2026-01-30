import { CheckAuthNavigate } from '@/components/ui/check-auth-navigate'
import { NavLink } from '@/types/layout/types'
import Link from 'next/link'

interface SidebarItemProps {
  item: NavLink
  useCheckAuth?: boolean
  variant?: 'default' | 'plain'
}

export function SidebarItem({
  item,
  useCheckAuth = true,
  variant = 'default'
}: SidebarItemProps) {
  const baseClasses =
    variant === 'default'
      ? 'flex gap-2 px-3 py-2 hover:bg-[#20447E] group hover:text-white items-center rounded-md transition-colors'
      : 'py-2 flex items-center gap-2 cursor-pointer'

  const disabledClasses = item.disabled
    ? 'text-gray-400 pointer-events-none'
    : 'cursor-pointer'

  const className = `${baseClasses} ${disabledClasses}`

  const content = (
    <>
      {item.icon}
      <span className="font-semibold">{item.title}</span>
    </>
  )

  if (useCheckAuth) {
    return (
      <CheckAuthNavigate href={item.url || '#'} className={className}>
        {content}
      </CheckAuthNavigate>
    )
  }

  return (
    <Link href={item.url || '#'} className={className}>
      {content}
    </Link>
  )
}
