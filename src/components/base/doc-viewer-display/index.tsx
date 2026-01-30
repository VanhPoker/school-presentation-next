import { cn } from '@/lib/utils'
import DocViewer, { DocViewerRenderers } from 'react-doc-viewer'

type DocViewerProps = {
  url: string
  fileType?: string
  mediaProps?: Record<string, any>
}
export default function DocViewerDisplay({
  url,
  fileType,
  mediaProps
}: DocViewerProps) {
  const docs = [
    {
      uri: url,
      fileType
    }
  ]
  return (
    <DocViewer
      documents={docs}
      pluginRenderers={DocViewerRenderers}
      config={{
        header: {
          disableHeader: true,
          disableFileName: true,
          retainURLParams: false
        }
      }}
      style={{ width: '100%', height: '100%', background: 'white' }}
      className={cn({
        'whitespace-pre-wrap': fileType === 'text/plain'
      })}
      {...mediaProps}
    />
  )
}
