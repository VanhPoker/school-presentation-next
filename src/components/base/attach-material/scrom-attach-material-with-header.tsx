import { Textarea } from '@/components/ui/textarea'
import { IMAGE_DOMAIN_URL } from '@/config'
import { useDebounceEffect } from '@/hooks/use-debounce-effect'
import useInteractionObserver from '@/hooks/use-interaction-observer'
import { cn } from '@/lib/utils'
import { Minus, Plus } from 'lucide-react'
import Image from 'next/image'
import { useMemo, useRef, useState } from 'react'
import InputSearch from '../input-search'
import { debounce } from 'lodash-es'
import { startsWith } from 'lodash-es'

type ScromAttachMaterialProps = {
  src: string
  className?: string
  isPreview?: boolean
  defaultMaterialName?: string
  defaultMaterialContent?: string
  handleUpdateContent?: (data: {
    materialName?: string
    materialContent?: string
  }) => void
}
export default function ScromAttachMaterialWithHeader({
  src,
  className,
  defaultMaterialContent,
  defaultMaterialName,
  handleUpdateContent = () => {},
  isPreview = true,
  ...rest
}: ScromAttachMaterialProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [scromUrl, setScromUrl] = useState('')
  const [iframeConfig] = useState<{
    width: number
    height: number
  }>()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isExpandTextArea, setIsExpandTextArea] = useState(false)
  const [materialName] = useState(defaultMaterialName || '')
  const [materialContent] = useState(defaultMaterialContent || '')
  const [isInView, observerRef] = useInteractionObserver(containerRef, {
    threshold: 0.1
  })

  const textAreaRows = useMemo(() => {
    const rows = materialContent.split('\n').length || 1
    if (materialContent.split('\n').length === 0) return rows
    return rows
  }, [materialContent])

  const handleFetchScromUrl = async () => {
    if (startsWith(src, 'http')) {
      setScromUrl(`${src}`)
    } else {
      setScromUrl(`${IMAGE_DOMAIN_URL}/${src}`)
    }
  }
  // const handleUpdateIframeConfig = (event: MessageEvent<any>) => {
  //   if (!event.origin.startsWith('https://s3-dev.gkebooks.click')) return
  //   const width = event.data.width
  //   const height = event.data.height
  //   setIframeConfig({ width, height })
  // }

  useDebounceEffect(
    () => {
      if (!isInView) return
      observerRef.current?.disconnect()
      handleFetchScromUrl()
    },
    200,
    [isInView]
  )
  // useEffect(() => {
  //   if (!iframeConfig) {
  //     window.addEventListener('message', handleUpdateIframeConfig)
  //   }
  //   return () => window.removeEventListener('message', handleUpdateIframeConfig)
  // }, [iframeConfig])
  return (
    <div ref={containerRef} className={className}>
      <div className="pb-6 px-3 bg-[#20447E] flex items-start gap-1 w-full">
        <Image
          height={48}
          width={48}
          src={'/editor/scrom-type.svg'}
          style={{ height: 'auto' }}
          alt="scrom-type"
          className="pt-2.5"
        />
        <div className="space-y-1 flex-1 pt-6">
          <div className="text-sm text-white">Học liệu nâng cao</div>
          {isPreview ? (
            <div className="font-semibold text-white text-lg">
              {materialName || 'Không có tiêu đề'}
            </div>
          ) : (
            <div className="relative bg-white rounded-md overflow-hidden">
              <InputSearch
                value={materialName}
                disable={isPreview}
                onChange={debounce((value) => {
                  // setMaterialName(value)
                  handleUpdateContent({
                    materialName: value
                  })
                }, 500)}
                hasPrefixIcon={false}
                hasSearchButton={false}
                placeholder="Nhập tên học liệu"
              />
            </div>
          )}
        </div>
      </div>
      <div className="px-4 py-2.5 bg-gray-300 flex items-end w-full gap-1">
        <div className="flex-1">
          <Textarea
            onChange={debounce((e) => {
              // setMaterialContent(e.target.value)
              handleUpdateContent({
                materialContent: e.target.value
              })
            }, 500)}
            disabled={isPreview}
            defaultValue={
              materialContent || 'Không có hướng dẫn cho học liệu này'
            }
            // value={materialContent}
            placeholder="Nhập thông tin mô tả hướng dẫn sử dụng học liệu"
            rows={isExpandTextArea ? textAreaRows : 1}
            className={cn(
              'resize-none !leading-6 min-h-14',
              !isPreview ? 'bg-white' : 'border-transparent shadow-none',
              !isExpandTextArea && 'overflow-hidden'
            )}
          />
        </div>
        {isPreview && materialContent && (
          <span
            onClick={() => {
              setIsExpandTextArea((prev) => !prev)
            }}
            className="p-1 rounded-md bg-white"
          >
            {isExpandTextArea ? (
              <Minus size={18} color="#A4A7AE" />
            ) : (
              <Plus size={18} color="#A4A7AE" />
            )}
          </span>
        )}
      </div>
      <div className="min-h-500 w-full relative">
        <iframe
          src={scromUrl}
          ref={iframeRef}
          onError={() => {
            console.error('errr')
          }}
          allowFullScreen
          className="grow w-full mx-auto"
          {...rest}
          style={{
            maxHeight: iframeConfig?.height
              ? `${iframeConfig.height}px`
              : undefined,
            maxWidth: iframeConfig?.width
              ? `${iframeConfig.width}px`
              : undefined
          }}
        />
      </div>
    </div>
  )
}
