'use client'
import { Button } from '@/components/ui/button'
import {
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  SubscriptIcon,
  SuperscriptIcon,
  UnderlineIcon
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Calculator } from '@untitled-ui/icons-react'
import { SimpleTooltip } from '@/components/base/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/stores/use-editor-state-store'
import { useEditorFormat } from '@/hooks/use-editor-format'
import { useState } from 'react'
import ModalActionsQuiz from './modal-actions-quiz'
import { useEditorInstanceStore } from '@/stores/use-editor-instance-store'

interface ActionsProps {
  isGetDetailDone?: boolean
  quizdUrl?: string
  codeUrl?: string
}

export default function Actions({
  isGetDetailDone = true,
  quizdUrl
}: ActionsProps) {
  const {
    isBold,
    isItalic,
    isUnderline,
    isStrike,
    isSubscript,
    isSuperscript
  } = useEditorStore()

  const {
    toggleBold,
    toggleItalic,
    toggleUnderline,
    toggleStrike,
    toggleSubscript,
    toggleSuperscript
  } = useEditorFormat()

  const { activeEditorId } = useEditorInstanceStore()

  const [isOpenModal, setIsOpenModal] = useState(false)
  return (
    <>
      {isGetDetailDone && quizdUrl ? (
        <div className="flex flex-wrap items-center gap-1 px-6 py-2 bg-gray-50 sticky w-full top-0 left-0 overflow-hidden z-[4]">
          <div className="flex items-center gap-1">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>

          <Separator
            orientation="vertical"
            className="bg-gray-300 h-9 hidden md:block"
          />
          <Skeleton className="h-8 w-48 rounded-md" />
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-1 px-6 py-2.5 bg-gray-50 sticky w-full top-0 left-0 overflow-hidden z-[4]">
          <div className="flex items-center">
            <SimpleTooltip content={'Đậm'}>
              <Button
                onClick={toggleBold}
                className={cn(
                  '!shadow-none border-transparent aspect-square h-8 w-8 bg-gray-50 text-slate-600 transition-all',
                  isBold && 'bg-blue-900 text-white mr-1'
                )}
                disabled={activeEditorId === null}
              >
                <BoldIcon size={20} />
              </Button>
            </SimpleTooltip>

            <SimpleTooltip content={'Nghiêng'}>
              <Button
                onClick={toggleItalic}
                className={cn(
                  '!shadow-none border-transparent aspect-square h-8 w-8 bg-gray-50 text-slate-600 transition-all',
                  isItalic && 'bg-blue-900 text-white mr-1'
                )}
                disabled={activeEditorId === null}
              >
                <ItalicIcon size={20} />
              </Button>
            </SimpleTooltip>

            <SimpleTooltip content={'Gạch chân'}>
              <Button
                onClick={toggleUnderline}
                className={cn(
                  '!shadow-none border-transparent aspect-square h-8 w-8 bg-gray-50 text-slate-600 transition-all',
                  isUnderline && 'bg-blue-900 text-white mr-1'
                )}
                disabled={activeEditorId === null}
              >
                <UnderlineIcon size={20} />
              </Button>
            </SimpleTooltip>

            <SimpleTooltip content={'Gạch ngang'}>
              <Button
                onClick={toggleStrike}
                className={cn(
                  '!shadow-none border-transparent aspect-square h-8 w-8 bg-gray-50 text-slate-600 transition-all',
                  isStrike && 'bg-blue-900 text-white mr-1'
                )}
                disabled={activeEditorId === null}
              >
                <StrikethroughIcon size={20} />
              </Button>
            </SimpleTooltip>

            <SimpleTooltip content={'Subscript'}>
              <Button
                onClick={toggleSubscript}
                className={cn(
                  '!shadow-none border-transparent aspect-square h-8 w-8 bg-gray-50 text-slate-600 transition-all',
                  isSubscript && 'bg-blue-900 text-white mr-1'
                )}
                disabled={activeEditorId === null}
              >
                <SubscriptIcon size={20} />
              </Button>
            </SimpleTooltip>

            <SimpleTooltip content={'Superscript'}>
              <Button
                onClick={toggleSuperscript}
                className={cn(
                  '!shadow-none border-transparent aspect-square h-8 w-8 bg-gray-50 text-slate-600 transition-all',
                  isSuperscript && 'bg-blue-900 text-white mr-1'
                )}
                disabled={activeEditorId === null}
              >
                <SuperscriptIcon size={20} />
              </Button>
            </SimpleTooltip>

            {/* <SimpleTooltip content={'Sigma'}>
              <Button
                disabled
                className='!shadow-none border-transparent aspect-square h-8 w-8 bg-gray-50 text-slate-600 hover:bg-blue-900 hover:text-white transition-all'
              >
                <SigmaIcon size={20} />
              </Button>
            </SimpleTooltip> */}
          </div>

          <Separator
            orientation="vertical"
            className="bg-gray-300 h-9 hidden md:block"
          />
          <Button
            className="flex items-center gap-1 px-2 py-1 text-sm font-semibold rounded-md border-transparent bg-gray-50 text-slate-600 hover:bg-blue-900 hover:text-white transition-all !shadow-none sm:w-auto sm:mt-0 mt-2"
            onClick={() => {
              setIsOpenModal(true)
            }}
            disabled={activeEditorId === null}
          >
            <Calculator />
            <span>Thêm công thức toán học</span>
          </Button>
        </div>
      )}
      {isOpenModal && (
        <ModalActionsQuiz
          isOpen={isOpenModal}
          onClose={() => setIsOpenModal(false)}
        />
      )}
    </>
  )
}
