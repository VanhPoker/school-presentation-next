import { useMemo } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { Editor, Range } from '@tiptap/core'
import Image from 'next/image'
import { IMAGE_DOMAIN_URL } from '@/config'

export const EmojiPicker = ({
  editor,
  range,
  emojiOnly = false,
  onSelect,
  canReset = true,
  items = []
}: {
  items?: any[]
  range?: Range
  canReset?: boolean
  onSelect?: (value: string, type: string) => void
  editor?: Editor
  emojiOnly?: boolean
  command?: any
}) => {
  const content = useMemo(
    () => (
      <Tabs defaultValue={items[0]!.title} className="p-0">
        <TabsList className="flex justify-start bg-transparent h-auto gap-4 px-0 relative w-full">
          {items.map((item) => {
            return (
              <TabsTrigger
                key={item.title}
                value={item.title}
                className="text-sm p-0 justify-start pb-2 data-[state=active]:text-[#055BE6] data-[state=active]:border-[#055BE6]"
              >
                {item.title}
              </TabsTrigger>
            )
          })}
          {canReset && (
            <span
              className="ml-auto pb-2 text-sm text-gray-500 font-semibold cursor-pointer"
              onClick={() => onSelect?.('', 'image')}
            >
              Xoá
            </span>
          )}
          <div className="absolute bottom-1 left-0 -z-1 w-full h-0.5 border-b-2 border-b-gray-300 px-4" />
        </TabsList>
        {items.map((item, index) => {
          if (emojiOnly && item.type !== 'emoji') return null
          return (
            <TabsContent key={index} value={item.title} className="p-0">
              <div className="flex flex-wrap gap-1 max-h-80 overflow-y-auto">
                {item.data.map((emoji: any) => {
                  if (item.type === 'emoji') {
                    return (
                      <button
                        key={emoji}
                        className="hover:bg-gray-100 p-1 rounded-lg transition-colors"
                        onClick={() => {
                          if (onSelect) {
                            onSelect(emoji, item.type)
                          }
                          if (!editor || !range) return
                          editor
                            .chain()
                            .focus()
                            .deleteRange(range)
                            .insertContent(emoji)
                            .run()
                        }}
                      >
                        {emoji}
                      </button>
                    )
                  }
                  if (item.type === 'image') {
                    return (
                      <button
                        onClick={() => {
                          if (onSelect) {
                            onSelect(emoji, item.type)
                          }
                          if (!editor || !range) return
                          editor
                            .chain()
                            .focus()
                            .deleteRange(range)
                            .setImage({ src: emoji, alt: 'image' })
                            .run()
                        }}
                        className="hover:bg-gray-100 p-1 w-14 h-14 rounded-lg transition-colors"
                        key={emoji}
                      >
                        <Image
                          height={60}
                          className="object-contain"
                          style={{ width: 'auto' }}
                          width={60}
                          alt="emoji"
                          src={`${IMAGE_DOMAIN_URL}${emoji}`}
                        />
                      </button>
                    )
                  }
                  return null
                })}
                {item.data.length === 0 && <div>Chưa có dữ liệu đâu.</div>}
              </div>
            </TabsContent>
          )
        })}
      </Tabs>
    ),
    []
  )
  if (onSelect) return content
  return (
    <div className="dropdown-menu rounded-lg px-4 py-2 shadow-[0px_4px_3px_0px_rgba(0,0,0,0.1)] lg:shadow-[0px_10px_8px_0px_rgba(0,0,0,0.04)] bg-white custom-scrollbar">
      {content}
    </div>
  )
}
