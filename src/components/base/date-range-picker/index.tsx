import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { useState } from 'react'
import { DateRange } from 'react-day-picker'
type DateRangePickerProps = {
  onValueChange?: (value?: DateRange) => void
  onCancel?: VoidFunction
  value?: DateRange
}
export default function DateRangePicker({
  value,
  onCancel,
  onValueChange
}: DateRangePickerProps) {
  const [date, setDate] = useState<DateRange | undefined>(value)
  return (
    <div className="flex">
      <ul className="px-4 border-r text-sm flex flex-col py-4 opacity-45">
        <li className="py-2.5 px-4 whitespace-nowrap rounded-md transition-colors cursor-pointer hover:bg-gray-100">
          Hôm nay
        </li>
        <li className="py-2.5 px-4 whitespace-nowrap rounded-md transition-colors cursor-pointer hover:bg-gray-100">
          Tuần này
        </li>
        <li className="py-2.5 px-4 whitespace-nowrap rounded-md transition-colors cursor-pointer hover:bg-gray-100">
          Tuần trước
        </li>
        <li className="py-2.5 px-4 whitespace-nowrap rounded-md transition-colors cursor-pointer hover:bg-gray-100">
          Tuần trước
        </li>
        <li className="py-2.5 px-4 whitespace-nowrap rounded-md transition-colors cursor-pointer hover:bg-gray-100">
          Tháng này
        </li>
        <li className="py-2.5 px-4 whitespace-nowrap rounded-md transition-colors cursor-pointer hover:bg-gray-100">
          Tháng trước
        </li>
        <li className="py-2.5 px-4 whitespace-nowrap rounded-md transition-colors cursor-pointer hover:bg-gray-100">
          Năm nay
        </li>
        <li className="py-2.5 px-4 whitespace-nowrap rounded-md transition-colors cursor-pointer hover:bg-gray-100">
          Năm ngoái
        </li>
      </ul>
      <div>
        <Calendar
          autoFocus
          mode="range"
          selected={date}
          onSelect={setDate}
          disabled={{ after: new Date() }}
          numberOfMonths={2}
        />
        <div className="border-t p-4 flex justify-end gap-2">
          <Button onClick={onCancel} type="button">
            Huỷ
          </Button>
          <Button
            onClick={() => {
              onValueChange?.(date)
            }}
            variant={'signIn'}
            type="button"
          >
            Áp dụng
          </Button>
        </div>
      </div>
    </div>
  )
}
