import { SimpleTooltip } from '@/components/base/tooltip'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import InputAutoSpan from '@/components/ui/input-auto-span'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Exam_Questions } from '@/graphql/generated'
import { cn } from '@/lib/utils'
import { NAV_LIST_LEVEL, NAV_LIST_POINT } from '@/mock-data/quiz-studio'
import { QUIZ_TYPE } from '@/types/quiz-studio'
import {
  CopyIcon,
  EllipsisVerticalIcon,
  GraduationCapIcon,
  PenLineIcon,
  StarIcon,
  TrashIcon
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { handleRenderCodeIcon, handleRenderCodeName } from '../../quiz-service'
import { useSearchParams } from 'next/navigation'

interface QuestionHeaderProps {
  code: string
  name: string
  editable?: boolean
  point: string
  time: string
  must_response: boolean
  isAuthor: boolean
  examId: string | string[]
  id: string
  data: Exam_Questions
  loading: boolean
  setShowConfirmDeleteModal: (value: any) => void
  handleDuplicate: (value: any) => void
  quizHeaderClassName?: string
}

export function QuizzHeader({
  code,
  editable,
  point,
  time,
  must_response,
  isAuthor,
  examId,
  id,
  data,
  loading,
  setShowConfirmDeleteModal,
  handleDuplicate,
  index,
  oversize = 0,
  quizHeaderClassName
}: QuestionHeaderProps & {
  index: number
  oversize?: number
}) {
  const searchParams = useSearchParams()
  const statusParams = searchParams.get('status')
  const codeParams = searchParams.get('codeType')
  const idBookParams = searchParams.get('idBook')
  const [formattedTime] = useState(() => {
    const timeInSeconds = isNaN(parseInt(time, 10)) ? 0 : parseInt(time, 10)
    return timeInSeconds >= 60
      ? `${Math.floor(timeInSeconds / 60)} phút`
      : `${timeInSeconds} giây`
  })

  const removeStyleFixedHeader = () => {
    const elHeader = document.getElementById('main-header')
    if (!elHeader) return
    setTimeout(() => {
      elHeader.classList.remove('!fixed')
    }, 1000)
  }

  const handleFunctionButtons = () => {
    return (
      <>
        {isAuthor && (
          <SimpleTooltip content={'Sửa'}>
            <Link
              href={`/quiz-form?code=${code}&examId=${examId}&quizId=${id}&idBook=${idBookParams}&status=${statusParams}&codeType=${codeParams}`}
              onClick={() => {
                removeStyleFixedHeader()
              }}
            >
              <Button
                className="rounded-lg h-9 w-9 p-0 flex items-center justify-center border cursor-pointer"
                disabled={loading}
              >
                <PenLineIcon size={20} />
              </Button>
            </Link>
          </SimpleTooltip>
        )}

        <SimpleTooltip content={'Tạo bản sao'}>
          <Button
            className="rounded-lg h-9 w-9 p-0 flex items-center justify-center border cursor-pointer"
            disabled={true}
            onClick={() => {
              handleDuplicate(data)
            }}
          >
            <CopyIcon size={20} />
          </Button>
        </SimpleTooltip>

        {isAuthor && (
          <SimpleTooltip content={'Xóa'}>
            <Button
              className="rounded-lg h-9 w-9 p-0 flex items-center justify-center border cursor-pointer border-red-300 text-red-500 hover:text-white hover:bg-red-500"
              onClick={() => {
                setShowConfirmDeleteModal(true)
              }}
            >
              <TrashIcon size={20} />
            </Button>
          </SimpleTooltip>
        )}
      </>
    )
  }

  const handleQuickEditButtons = () => {
    return (
      <div className="flex items-center gap-4">
        <div>
          <Select
            value={point ? JSON.stringify(point) : '0'}
            onValueChange={() => {}}
            disabled={true}
          >
            <SelectTrigger
              id="framework"
              className="rounded-lg flex gap-3 border-none shadow-none px-0 text-sm"
            >
              <GraduationCapIcon size={20} />
              <SelectValue placeholder="Chọn điểm" />
            </SelectTrigger>
            <SelectContent position="popper">
              {NAV_LIST_POINT.map((item, index) => {
                return (
                  <SelectItem key={index + 1} value={item.value}>
                    {item.name}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
        <div>
          <InputAutoSpan
            loadingApi={false}
            valueInputTime={time ? time : 15}
            handleExportValue={() => {}}
            readonly={true}
            classInput="text-sm"
          />
        </div>
        <div>
          <Select value={'1'} onValueChange={() => {}} disabled>
            <SelectTrigger
              id="framework"
              className="rounded-lg flex gap-2 border-none shadow-none px-0 text-sm"
            >
              <StarIcon size={20} />
              <SelectValue placeholder="Độ khó" />
            </SelectTrigger>
            <SelectContent position="popper">
              {NAV_LIST_LEVEL.map((item, index) => {
                return (
                  <SelectItem key={index + 1} value={item.value}>
                    {item.name}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col mb-4 pl-4 gap-2', quizHeaderClassName)}>
      <div
        className={cn(
          'flex flex-col md:flex-row gap-2 md:gap-0 justify-between text-sm text-gray-500'
        )}
      >
        {editable ? (
          <>
            <div className="flex items-center gap-3 justify-start font-semibold">
              <div className="flex items-center gap-2 text-sm">
                <span className="flex items-center justify-center w-5 h-5">
                  {handleRenderCodeIcon(code)}
                </span>
                <span className="whitespace-nowrap">
                  {code === QUIZ_TYPE.single_choice ||
                  code === QUIZ_TYPE.multiple_choice ||
                  code === QUIZ_TYPE.multiple_answers ? (
                    <span>Trắc nghiệm</span>
                  ) : (
                    <span>{handleRenderCodeName(code)}</span>
                  )}
                </span>
              </div>
              {oversize === 2 && (
                <>
                  <Separator
                    orientation="vertical"
                    className="bg-gray-300 h-[24px]"
                  />
                  {handleQuickEditButtons()}
                </>
              )}
            </div>
            <div className={cn('flex gap-3 items-center')}>
              <div className="flex items-center gap-2 pl-2 cursor-not-allowed opacity-50">
                <Switch
                  id="airplane-mode"
                  checked={must_response ?? false}
                  onCheckedChange={() => {}}
                  disabled={true}
                />

                <span className="font-medium text-sm">Bắt buộc trả lời</span>
              </div>

              {oversize === 2 && (
                <>
                  <Separator
                    orientation="vertical"
                    className="bg-gray-300 h-[24px]"
                  />
                  {handleFunctionButtons()}
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <span className="font-semibold text-[16px] text-[#414651]">
              {index}.{' '}
              {code === QUIZ_TYPE.single_choice ||
              code === QUIZ_TYPE.multiple_choice ||
              code === QUIZ_TYPE.multiple_answers ? (
                <span className="whitespace-nowrap">Trắc nghiệm</span>
              ) : (
                <span>{handleRenderCodeName(code)}</span>
              )}
            </span>
            <div className="flex items-center font-semibold text-sm gap-5 ">
              <span className="whitespace-nowrap">
                {handleRenderCodeName(code)}
              </span>
              {(code === QUIZ_TYPE.single_choice ||
                code === QUIZ_TYPE.multiple_choice ||
                code === QUIZ_TYPE.multiple_answers) && (
                <div className="">•</div>
              )}
              <span>{Number(time) > 0 ? formattedTime : '15 giây'}</span>
              <div className="">•</div>
              <span className="text-[#20447E]">{point ? point : 0} điểm</span>
            </div>
          </>
        )}
      </div>
      {oversize < 2 && editable && (
        <div className="flex gap-3 items-center w-full justify-between">
          {handleQuickEditButtons()}
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <EllipsisVerticalIcon className="cursor-pointer" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => {}}>
                    <Link
                      className="flex items-center gap-4"
                      href={`/quiz-form?code=${code}&examId=${examId}&quizId=${id}&idBook=${idBookParams}&status=${statusParams}&codeType=${codeParams}`}
                      onClick={() => {
                        removeStyleFixedHeader()
                      }}
                    >
                      <PenLineIcon className="!w-5 !h-5" />
                      <span className="font-regular text-sm">Chỉnh sửa</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="flex gap-4"
                    onClick={() => {
                      handleDuplicate(data)
                    }}
                  >
                    <CopyIcon className="!w-5 !h-5" />
                    <span className="font-regular text-sm">Tạo bản sao</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="flex gap-4"
                    onClick={() => {
                      setShowConfirmDeleteModal(true)
                    }}
                  >
                    <TrashIcon className="text-red-500 !w-5 !h-5" />
                    <span className="text-red-500 font-regular text-sm">
                      Xóa
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* {handleFunctionButtons()} */}
          </div>
        </div>
      )}
    </div>
  )
}
