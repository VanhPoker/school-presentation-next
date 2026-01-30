import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { ReactNode, useEffect, useRef, useState } from 'react'

interface IProps {
  isOpen?: boolean
  forceMount?: boolean
  onClose?: (item: boolean) => void
  children: ReactNode
  title?: string | React.ReactNode
  desc?: string | React.ReactNode
  closeAfter?: number
  className?: string
  descClassName?: string
  modal?: boolean
  titleClassname?: string
  triggerElement?: React.ReactNode
  backDrop?: boolean
  hasX?: boolean
}

export function DialogCustom({
  isOpen,
  onClose,
  modal = true,
  children,
  hasX = true,
  titleClassname,
  title = '',
  descClassName,
  desc,
  className,
  triggerElement,
  closeAfter,
  forceMount,
  backDrop
}: IProps) {
  const timeoutId = useRef<NodeJS.Timeout | undefined>(undefined)
  const [openModal, setOpenModal] = useState(isOpen)

  useEffect(() => {
    if (closeAfter) {
      timeoutId.current = setTimeout(() => {
        setOpenModal(false)
      }, closeAfter)
    }
    return () => clearTimeout(timeoutId.current)
  }, [])

  useEffect(() => {
    setOpenModal(isOpen)
  }, [isOpen])

  return (
    <Dialog
      open={openModal}
      modal={modal}
      onOpenChange={onClose || setOpenModal}
    >
      {triggerElement && (
        <DialogTrigger asChild>{triggerElement}</DialogTrigger>
      )}
      <VisuallyHidden.Root>
        <DialogTitle></DialogTitle>
      </VisuallyHidden.Root>
      <DialogContent
        showXIcon={hasX}
        className={className}
        forceMount={forceMount || true}
        onInteractOutside={(e) => {
          if (backDrop === undefined || backDrop) {
            e.preventDefault()
          }
        }}
      >
        {title && (
          <DialogHeader className="bg-white">
            <DialogTitle
              className={cn('pr-4 py-4 text-center', titleClassname)}
            >
              {title}
            </DialogTitle>
          </DialogHeader>
        )}
        {desc ? (
          <DialogDescription className={descClassName}>
            {desc || ''}
          </DialogDescription>
        ) : (
          <VisuallyHidden.Root>
            <DialogDescription></DialogDescription>
          </VisuallyHidden.Root>
        )}
        {children}
      </DialogContent>
    </Dialog>
  )
}
