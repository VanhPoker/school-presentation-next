import './style.scss'
import { useGetFileLazyQuery } from '@/graphql/generated'
import useInteractionObserver from '@/hooks/use-interaction-observer'
import { cn } from '@/lib/utils'
import { useMemo, useRef, useState } from 'react'
import RenderMarkdown from '../render-markdown'
import dynamic from 'next/dynamic'
import { Material_Code } from '@/types/material/type'
import { useDebounceEffect } from '@/hooks/use-debounce-effect'
const MediaRender = dynamic(() => import('@/components/base/media-render'), {
  ssr: false
})
type EmbeddedUploadAttachProps = {
  src: string
  type: string
  isPreview?: boolean
  width?: number
  onResize?: (data: number) => void
}
export default function EmbeddedUploadAttach({
  src,
  type
}: EmbeddedUploadAttachProps) {
  const [getFile] = useGetFileLazyQuery()
  const [embeddedUrl, setEmbeddedUrl] = useState('')
  const [content, setContent] = useState<string>()
  const [loading, setLoading] = useState(true)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [isInView, observerRef] = useInteractionObserver(wrapperRef, {
    threshold: 0.1
  })
  const renderMaterialByType = useMemo(() => {
    if (!embeddedUrl || content === undefined) return null
    switch (type) {
      case 'txt':
        return (
          <textarea
            className="w-full h-[420px] p-2 resize-none"
            disabled
            defaultValue={content}
          />
        )
      case 'csv':
        return (
          <div className="max-h-[420px] overflow-auto w-full custom-scrollbar">
            <MediaRender
              type={Material_Code.EMBEDDED}
              url={embeddedUrl}
              fileType="csv"
              containerClass="w-full border rounded-lg overflow-hidden relative"
            />
          </div>
        )
      // case 'image':
      //   return (
      //     <div className="max-h-[420px] overflow-auto w-full custom-scrollbar">
      //       <ImageAttachMaterial
      //         isPreview={isPreview}
      //         onResize={onResize}
      //         src={embeddedUrl}
      //         width={width}
      //       />
      //     </div>
      //   )
      // case 'audio':
      //   return (
      //     <div className="max-h-[420px] overflow-auto w-full custom-scrollbar">
      //       <AudioAttachMaterial src={embeddedUrl} />
      //     </div>
      //   )
      // case 'video':
      //   return (
      //     <div className="max-h-[420px] overflow-auto w-full custom-scrollbar">
      //       <VideoAttachMaterial src={embeddedUrl} />
      //     </div>
      //   )
      // case 'scrom':
      //   return (
      //     <div className="max-h-[420px] overflow-auto w-full custom-scrollbar">
      //       <ScromAttachMaterial src={embeddedUrl} />
      //     </div>
      //   )
      case 'vr':
        return (
          <div className="h-[420px] overflow-auto w-full custom-scrollbar">
            <MediaRender
              type={Material_Code.THREED_VR}
              url={embeddedUrl}
              // fileType="csv"
              containerClass="w-full h-full border rounded-lg overflow-hidden relative"
            />
          </div>
        )
      case 'markdown':
        return (
          <div className="max-h-[420px] w-full overflow-auto">
            <RenderMarkdown>{content}</RenderMarkdown>
          </div>
        )
      case 'code': {
        const extensionFile = src.split('.')
        if (!extensionFile[1])
          return <div>Không xác định được loại học liệu</div>
        return (
          <div className="max-h-[420px] overflow-auto w-full custom-scrollbar">
            <RenderMarkdown>
              {'```' + `${extensionFile[1]}\n` + `${content}` + '\n```'}
            </RenderMarkdown>
          </div>
        )
      }

      case 'docx':
        return (
          <MediaRender
            type={Material_Code.DOC}
            url={embeddedUrl}
            containerClass="w-full h-[420px] border rounded-lg overflow-hidden relative"
          />
        )
      case 'xlsx':
        return (
          <MediaRender
            type={Material_Code.DOC}
            url={embeddedUrl}
            fileType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            containerClass="w-full h-[420px] border rounded-lg overflow-hidden relative"
          />
        )
      case 'pptx':
        return (
          <MediaRender
            type={Material_Code.DOC}
            url={embeddedUrl}
            fileType="application/vnd.openxmlformats-officedocument.presentationml.presentation"
            containerClass="w-full h-96 border rounded-lg overflow-hidden relative"
          />
        )
      case 'pdf':
        return (
          <iframe
            allowFullScreen
            src={embeddedUrl}
            className="w-full"
            height={600}
          />
        )
      default:
        return <div>Không xác định được loại học liệu</div>
    }
  }, [embeddedUrl, content])
  const handleFetchMaterialContent = async (url: string) => {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const textData = await response.text()
      setContent(textData)
    } catch (e) {
      console.error('error', e)
      // setError(e)
    }
  }
  const handleFetchEmbeddedUrl = async () => {
    setLoading(true)
    try {
      const { data } = await getFile({ variables: { file_key: src } })
      if (data?.get_file?.url) {
        setEmbeddedUrl(data.get_file.url)
        handleFetchMaterialContent(data.get_file.url)
      }
    } catch (error) {
      console.error('error', error)
    }
    setLoading(false)
  }
  useDebounceEffect(
    () => {
      if (!src || !isInView) return
      if (isInView) {
        observerRef.current?.disconnect()
      }
      if (src.startsWith('image-node')) {
        handleFetchEmbeddedUrl()
      }
    },
    200,
    [isInView]
  )

  return (
    <div
      ref={wrapperRef}
      contentEditable={false}
      className={cn('group z-10 relative w-full', loading ? 'min-h-52' : '')}
    >
      {!loading && embeddedUrl && renderMaterialByType}
    </div>
  )
}
