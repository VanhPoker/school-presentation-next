import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { NavGroup, NavItem, NavLink } from '@/types/layout/types'
import { SidebarItem } from './sidebar-item'

interface SidebarGroupProps {
  group: NavGroup
  index: number
  hideItems: string[]
}

export function SidebarGroup({ group, index, hideItems }: SidebarGroupProps) {
  if (group.code === 'myLibrary') {
    return (
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={`group-${index}`} className="border-none">
          <AccordionTrigger className="px-3 text-base py-2 hover:no-underline hover:bg-[#20447E] group hover:text-white rounded-md transition-colors">
            <div className="flex gap-2 items-center">
              {group.icon}
              <span className="font-semibold">{group.title}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="border-none pl-9 text-base text-[#414651] font-semibold">
            {group.items
              .filter((item: NavItem) => !hideItems.includes(item.title))
              .map((item: NavItem, itemIndex: number) => {
                if (item.items) return null
                return (
                  <SidebarItem
                    key={itemIndex}
                    item={item}
                    useCheckAuth={false}
                    variant="plain"
                  />
                )
              })}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    )
  }

  // Logic for standard groups
  return (
    <>
      {group.items.map((item, itemIndex) => {
        return (
          <li key={itemIndex}>
            <SidebarItem item={item as NavLink} />
          </li>
        )
      })}
    </>
  )
}
