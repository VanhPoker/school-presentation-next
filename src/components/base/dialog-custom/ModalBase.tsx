import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
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
  modal?: boolean
  triggerElement?: React.ReactNode
}

export function ModalBase({
  isOpen,
  onClose,
  modal = true,
  children,
  title = '',
  desc,
  className,
  triggerElement,
  closeAfter,
  forceMount
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
      <DialogContent className={className} forceMount={forceMount || true}>
        {title && (
          <DialogHeader className="bg-white lg:text-left p-0 rounded-lg">
            <DialogTitle className="lg:text-left sm:text-left text-left p-5">
              {title}
            </DialogTitle>
          </DialogHeader>
        )}
        {desc ? <DialogDescription>{desc || ''}</DialogDescription> : null}
        {children}
      </DialogContent>
    </Dialog>
  )
}
