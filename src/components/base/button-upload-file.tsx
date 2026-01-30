import React, { ReactNode, useCallback, useRef } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'

type IProps = {
  icon: ReactNode
  accept: any
  className?: string
  text?: string
  setFileUpload: (file: File) => void
  disable?: boolean
}

export default function ButtonUploadFile(props: IProps) {
  const { icon, accept, className, text, setFileUpload, disable } = props
  const inputRef = useRef<any>(null)

  const handleFileChange = async (e: any) => {
    const files = e.target.files
    setFileUpload(files[0])
  }

  const handleClick = useCallback(() => inputRef.current?.click(), [])

  return (
    <div>
      <div className="hidden">
        <Input
          id="file"
          type="file"
          className="sr-only"
          ref={inputRef}
          accept={accept}
          onChange={handleFileChange}
        />
      </div>
      <Button
        variant="default"
        className={cn('w-fit', className)}
        onClick={handleClick}
        disabled={disable}
      >
        {icon}
        {text}
      </Button>
    </div>
  )
}
