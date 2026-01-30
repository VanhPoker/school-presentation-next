'use client'
import { Input } from '@/components/ui/input'
import { PropsWithChildren, useEffect, useRef, useState } from 'react'
type ColorPickerProps = {
  value?: string
  disable?: boolean
  onChangeColor?: (color: string) => void
}
export default function ColorPicker({
  children,
  value = '#000000',
  disable = false,
  onChangeColor
}: PropsWithChildren<ColorPickerProps>) {
  const colorInputRef = useRef<HTMLInputElement>(null)
  const [color, setColor] = useState(value)
  useEffect(() => {
    if (color !== value) {
      setColor(value)
    }
  }, [value])
  return (
    <div
      onClick={() => {
        colorInputRef.current?.click()
      }}
      className="relative"
    >
      {children}
      <Input
        value={color}
        onChange={(e) => {
          setColor(e.target.value)
          onChangeColor?.(e.target.value)
        }}
        type="color"
        disabled={disable}
        // ref={colorInputRef}
        className="absolute top-0 opacity-0 left-0 outline-none"
      />
    </div>
  )
}
