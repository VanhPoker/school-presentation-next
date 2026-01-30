import RenderTiptapContent from '@/components/base/render-tiptap-content'
import AudioWaveform from '@/components/ui/wave-audio-player'
import { Hotspots } from '@/graphql/generated'
import { cn } from '@/lib/utils'
import { isArray } from 'lodash-es'
import Image from 'next/image'
import { memo, useEffect, useState } from 'react'
import ReactPlayer from 'react-player'

type Payload = {
  hotspots_id: string
}

type Props = {
  hotspots: Hotspots[]
  isMultiple?: boolean
  onChange?: (payload: Payload[]) => void
  isCorrect?: boolean
  externalAnswers?: any[]
}

interface Choice {
  id: string
  content: string
  fileUrl?: string
  assetType?: string
  isSelected?: boolean
}

const Choice = ({
  hotspots,
  isMultiple = false,
  onChange,
  isCorrect,
  externalAnswers
}: Props) => {
  const [choices, setChoices] = useState<Choice[]>([])
  const [isAllCorrect, setIsAllCorrect] = useState<boolean | undefined>()
  const textOnlyChoices = choices.filter((item) => !item.fileUrl)
  const imageChoices = choices.filter((item) => item.fileUrl)
  const hasImageChoices = imageChoices.length > 0

  const renderMedia = (fileUrl?: string, assetType?: string) => {
    if (!fileUrl || !assetType) return null
    if (assetType === 'images') {
      return (
        <div className="aspect-[4/3] relative w-full">
          <Image
            src={fileUrl}
            alt="Choice item"
            fill
            className="object-contain"
          />
        </div>
      )
    }

    if (assetType === 'audios') {
      return (
        <div className="aspect-[4/3] w-full flex items-center">
          <AudioWaveform audioUrl={fileUrl} />
        </div>
      )
    }
    if (assetType === 'videos') {
      return (
        <div className="aspect-[4/3] w-full">
          <ReactPlayer
            url={fileUrl}
            controls={true}
            width="100%"
            height="100%"
            alt="video-link"
          />
        </div>
      )
    }
    return null
  }

  const renderItem = (item: Choice) => {
    return (
      <>
        {renderMedia(item.fileUrl, item.assetType)}
        <span
          className="text-[#181D27]"
          // dangerouslySetInnerHTML={{ __html: item?.content || '' }}
        >
          <RenderTiptapContent content={item?.content || ''} />
        </span>
      </>
    )
  }

  const handleClickChoice = (id: string) => () => {
    let newChoices = []
    if (isMultiple) {
      const currentIsSelected = choices?.find(
        (item) => item?.id === id
      )?.isSelected
      newChoices = choices?.map((item) =>
        item?.id === id
          ? {
              ...item,
              isSelected: !currentIsSelected
            }
          : item
      )
    } else {
      newChoices = choices?.map((item) =>
        item?.id === id
          ? {
              ...item,
              isSelected: true
            }
          : { ...item, isSelected: false }
      )
    }
    setChoices(newChoices)
    setIsAllCorrect(undefined)
    if (onChange) {
      const payload = newChoices
        ?.filter((item) => item?.isSelected)
        ?.map((item) => ({
          hotspots_id: item?.id
        }))
      onChange(payload)
    }
  }

  useEffect(() => {
    let newChoices = hotspots?.map((item) => ({
      id: item?.id,
      content: item?.content,
      fileUrl: item?.file_urls?.url,
      assetType: item?.asset_type,
      isSelected: false
    }))
    if (isArray(externalAnswers)) {
      newChoices = newChoices?.map((item) => {
        const isSelected = externalAnswers?.some(
          (answer) => answer?.hotspots_id === item?.id
        )
        return {
          ...item,
          isSelected
        }
      })
    }
    setChoices(newChoices as Choice[])
  }, [hotspots, externalAnswers])

  useEffect(() => setIsAllCorrect(isCorrect), [isCorrect])

  return (
    <div className="space-y-4 md:space-y-0 px-4 md:px-0">
      {/* Desktop & Tablet: Grid 2 columns */}
      <div className="hidden md:grid md:grid-cols-[1fr_1fr] gap-4">
        {choices?.map((item) => (
          <div
            key={item?.id}
            className={cn(
              'border-2 border-solid border-[#D5D7DA] aspect-[332/280] flex flex-col items-center justify-center p-3 rounded-xl text-center cursor-pointer gap-2 overflow-hidden',
              {
                'border-[#2D7CFB] bg-[#F0F6FE]': item?.isSelected,
                'border-[#F04438] bg-[#FEF3F2]':
                  item?.isSelected && isAllCorrect === false,
                'border-[#17B26A] bg-[#ECFDF3]':
                  item?.isSelected && isAllCorrect === true
              }
            )}
            onClick={handleClickChoice(item?.id)}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>

      {/* Mobile: Layout responsive */}
      <div className="md:hidden space-y-4">
        {/* Case 1: All text-only - 1 item/row */}
        {!hasImageChoices && textOnlyChoices.length > 0 && (
          <div className="space-y-4">
            {textOnlyChoices.map((item) => (
              <div
                key={item?.id}
                className={cn(
                  'border-2 border-solid border-[#D5D7DA] min-h-[80px] flex flex-col items-center justify-center p-3 rounded-xl text-center cursor-pointer gap-2 overflow-hidden',
                  {
                    'border-[#2D7CFB] bg-[#F0F6FE]': item?.isSelected,
                    'border-[#F04438] bg-[#FEF3F2]':
                      item?.isSelected && isAllCorrect === false,
                    'border-[#17B26A] bg-[#ECFDF3]':
                      item?.isSelected && isAllCorrect === true
                  }
                )}
                onClick={handleClickChoice(item?.id)}
              >
                {renderItem(item)}
              </div>
            ))}
          </div>
        )}

        {/* Case 2: At least 1 answer has image - display all 2 items/row */}
        {hasImageChoices && (
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            {choices.map((item) => (
              <div
                key={item?.id}
                className={cn(
                  'border-2 border-solid border-[#D5D7DA] flex flex-col items-center justify-center p-3 rounded-xl text-center cursor-pointer gap-2 overflow-hidden',
                  // Increase height for mobile to show both image and text
                  'min-h-[120px]',
                  {
                    'border-[#2D7CFB] bg-[#F0F6FE]': item?.isSelected,
                    'border-[#F04438] bg-[#FEF3F2]':
                      item?.isSelected && isAllCorrect === false,
                    'border-[#17B26A] bg-[#ECFDF3]':
                      item?.isSelected && isAllCorrect === true
                  }
                )}
                onClick={handleClickChoice(item?.id)}
              >
                {renderItem(item)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(Choice)
