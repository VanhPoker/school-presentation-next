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
import {
  CSSProperties,
  forwardRef,
  ReactNode,
  useEffect,
  useRef,
  useState
} from 'react'

interface IProps {
  isOpen?: boolean
  forceMount?: boolean
  onClose?: (item: boolean) => void
  children: ReactNode
  title?: string | React.ReactNode
  desc?: string | React.ReactNode
  closeAfter?: number
  styles?: CSSProperties
  className?: string
  showXIcon?: boolean
  descClassName?: string
  modal?: boolean
  titleClassname?: string
  triggerElement?: React.ReactNode
  closeButtonClassname?: string
  backDrop?: boolean
}

const DialogWrapper = forwardRef<HTMLDivElement, IProps>(
  (
    {
      isOpen,
      onClose,
      modal = true,
      showXIcon = true,
      children,
      styles,
      titleClassname,
      title = '',
      closeButtonClassname = '',
      descClassName,
      desc,
      className,
      triggerElement,
      closeAfter,
      forceMount,
      backDrop
    },
    ref
  ) => {
    const timeoutId = useRef<NodeJS.Timeout>(undefined)
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

        <DialogContent
          ref={ref}
          style={styles}
          closeButtonClassname={closeButtonClassname}
          className={className}
          showXIcon={showXIcon}
          forceMount={forceMount || true}
          onInteractOutside={(e) => {
            if (backDrop === undefined || backDrop) {
              e.preventDefault()
            }
          }}
        >
          {title ? (
            <DialogHeader className="bg-white">
              <DialogTitle
                className={cn('pr-4 py-4 text-center', titleClassname)}
              >
                {title}
              </DialogTitle>
            </DialogHeader>
          ) : (
            <VisuallyHidden.Root>
              <DialogTitle></DialogTitle>
            </VisuallyHidden.Root>
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
)
DialogWrapper.displayName = 'DialogWrapper'
export default DialogWrapper
