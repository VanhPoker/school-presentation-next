'use client'
import { Slider } from '@/components/ui/slider'
import { useEffect, useState } from 'react'

type SlideProps = {
  value: number[]
  disabled: boolean
  max: number
  min: number
  step: number
  onValueChange: (data: number[]) => void
}
export default function CustomSlider({
  value,
  disabled,
  onValueChange
}: SlideProps) {
  const [currentValue, setCurrentValue] = useState(value)
  useEffect(() => {
    if (value[0] !== undefined && value[0] !== currentValue[0]) {
      setCurrentValue([value[0]])
    }
  }, [value])
  return (
    <Slider
      value={currentValue}
      max={1}
      disabled={disabled}
      min={0}
      step={0.01}
      onValueChange={(val) => {
        setCurrentValue([val[0]!])
        onValueChange([val[0]!])
      }}
      //   className={cn('w-full absolute -bottom-8 left-0')}
    />
  )
}
