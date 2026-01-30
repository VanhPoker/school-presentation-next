import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
type SimplePopoverProps = {
  children: React.ReactNode
  side?: 'bottom' | 'top' | 'left' | 'right'
  content: React.ReactNode
  open?: boolean
  asChild?: boolean
  handleToogle?: (status: boolean) => void
  className?: string
}
export function SimplePopover({
  children,
  side = 'bottom',
  className = '',
  open = undefined,
  handleToogle,
  content
}: SimplePopoverProps) {
  return (
    <Popover open={open} onOpenChange={handleToogle}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent side={side} className={cn('w-fit p-1', className)}>
        {content}
      </PopoverContent>
    </Popover>
  )
}
