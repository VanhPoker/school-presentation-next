import { cn } from '@/lib/utils'
import { Textarea } from '../ui/textarea'
import { File02 } from '@untitled-ui/icons-react'
import { Button } from '../ui/button'
import { useState } from 'react'
const TAKE_NOTE_COLORS = ['#FEF7C3', '#FEE4E2', '#D3F8DF', '#D3E3FD']
type AddNoteFormProps = {
  onSave: (data: { color: string; content: string }) => Promise<void>
  onDelete: () => Promise<void>
  value?: { content: string; color: string }
}
export default function AddNoteForm({
  onSave,
  value,
  onDelete
}: AddNoteFormProps) {
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState(value?.content || '')
  const [currentColor, setCurrentColor] = useState(value?.color || '')
  const [error, setError] = useState('')
  const handleSave = async (data: { color: string; content: string }) => {
    setLoading(true)
    await onSave(data)
    setLoading(false)
  }
  const handleDelete = async () => {
    setLoading(true)
    await onDelete()
    setLoading(false)
  }
  return (
    <div className="p-5 lg:min-w-96">
      <Textarea
        value={content}
        onChange={(e) => {
          if (e.target.value.length > 300) {
            setError('Không thể vượt quá 300 ký tự')
            return
          }
          setContent(e.target.value)
          if (error) {
            setError('')
          }
        }}
        error=""
        maxLength={300}
        className="w-full mb-6 resize-none"
        rows={5}
      />
      <div className="flex gap-2 items-center mb-8">
        {TAKE_NOTE_COLORS.map((color) => {
          return (
            <span
              key={color}
              style={{ background: color }}
              onClick={() => {
                setCurrentColor(color)
                // onChange({ content: '', color })
                // if (color === selectedColor) return
                // setSelectedColor(color)
              }}
              className={cn(
                'h-5 w-5 rounded-full border cursor-pointer hover:border-blue-300',
                color === currentColor && 'border-blue-300'
              )}
            />
          )
        })}
      </div>
      <div className="flex justify-between items-center gap-4">
        <div className="flex gap-1">
          <File02 width={20} />
          <span>Xem trong danh sách</span>
        </div>
        <div className="flex gap-2">
          <Button
            disabled={loading}
            onClick={() => {
              handleDelete()
            }}
            type="button"
          >
            Xoá
          </Button>
          <Button
            loading={loading}
            onClick={() => {
              handleSave({ color: currentColor, content })
            }}
            type="button"
            variant={'signIn'}
          >
            Lưu
          </Button>
        </div>
      </div>
    </div>
  )
}
