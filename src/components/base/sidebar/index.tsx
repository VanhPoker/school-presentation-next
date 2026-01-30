'use client'

import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useHideByRole } from '@/hooks/use-hide-role'
import { NAV_MAIN_DATA } from '@/mock-data/sidebar'
import { NavGroup } from '@/types/layout/types'
import { AlignJustify } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { SidebarGroup } from './sidebar-group'

export default function AppSidebar() {
  const [open, setOpen] = useState(false)
  const { hideItems } = useHideByRole()

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <AlignJustify size={20} />
      </SheetTrigger>
      <SheetContent side={'left'} showClose={false} className="py-2 px-0">
        <div className="flex gap-4 items-center px-6 mb-4">
          <AlignJustify
            color="#414651"
            size={20}
            onClick={() => setOpen(false)}
            className="cursor-pointer"
          />
          <Image
            src={'/assets/logo/Logomark.svg'}
            alt="logo"
            width={40}
            height={40}
          />
        </div>
        <div className="max-h-[calc(100vh-80px)] overflow-y-auto">
          <ul className="flex flex-col gap-1 font-bold text-[#414651] px-4">
            {NAV_MAIN_DATA.map((group: NavGroup, groupIndex: number) => (
              <div key={group.code || groupIndex}>
                <SidebarGroup
                  group={group}
                  index={groupIndex}
                  hideItems={hideItems}
                />

                {groupIndex < NAV_MAIN_DATA.length - 1 && (
                  <Separator className="my-2" />
                )}
              </div>
            ))}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  )
}
