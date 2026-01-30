import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
const AdvanceInput = dynamic(() => import('../advance-input'), {
  loading: () => <Skeleton className="h-10  w-full" />,
  ssr: false
})
type InputSearchProps = {
  className?: string
  placeholder?: string
  value?: string
  type?: string
  disable?: boolean
  loadingImage?: boolean
  imageUploadUrl?: string | null
  inputClassname?: string
  isSticky?: boolean
  hasPrefixIcon?: boolean
  hasSearchButton?: boolean
  isResizable?: boolean
  onPressEnter?: (message: string) => void
  onRemoveImage?: VoidFunction
  onChange?: (value: string) => void
  onClick?: VoidFunction
  onKeydown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}
export default function InputSearch({
  className,
  disable = false,
  isSticky = true,
  loadingImage = false,
  isResizable = false,
  placeholder = 'Nhập từ khoá cần tìm kiếm',
  inputClassname = '',
  value = '',
  type,
  hasPrefixIcon = false,
  hasSearchButton = true,
  imageUploadUrl = '',
  onKeydown,
  onRemoveImage,
  onPressEnter,
  onClick,
  onChange
}: InputSearchProps) {
  const [inputValue, setInputValue] = useState(value)
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value)
    }
  }, [value])
  return (
    <div
      className={cn(
        'h-11 w-full gap-2 flex',
        className,
        disable && 'opacity-45'
      )}
    >
      <div className="relative flex-1">
        {hasPrefixIcon && (
          <Search
            size={16}
            color="#717680"
            className="top-1/2 -translate-y-1/2 left-3 absolute"
          />
        )}
        {isResizable ? (
          <AdvanceInput
            value={value}
            isSticky={isSticky}
            loadingImage={loadingImage}
            imageUploadUrl={imageUploadUrl}
            onChange={onChange}
            disable={disable}
            onRemoveImage={onRemoveImage}
            className={inputClassname}
            placeholder={placeholder}
            onPressEnter={onPressEnter}
          />
        ) : (
          <Input
            value={inputValue}
            placeholder={placeholder}
            onKeyDown={onKeydown}
            onChange={(e) => {
              e.stopPropagation()
              if (disable) return
              setInputValue(e.target.value)
              onChange?.(e.target.value)
            }}
            type={type ?? 'text'}
            className={cn(
              'w-full rounded-lg h-full shadow-sm border',
              hasPrefixIcon && 'pl-10',
              inputClassname
            )}
          />
        )}
      </div>
      {hasSearchButton && (
        <Button
          onClick={onClick}
          variant={'signIn'}
          type="button"
          className="h-full p-0 rounded-lg flex justify-center items-center aspect-square"
        >
          <Search />
        </Button>
      )}
    </div>
  )
}
