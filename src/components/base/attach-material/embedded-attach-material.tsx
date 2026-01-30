import EmbeddedUploadAttach from './embedded-upload-attach'

type EmbeddedAttachMaterialProps = {
  src: string
}
export default function EmbeddedAttachMaterial({
  src
}: EmbeddedAttachMaterialProps) {
  if (src.startsWith('image-node')) {
    if (src.endsWith('.txt')) {
      return <EmbeddedUploadAttach type="txt" src={src} />
    }
    if (src.endsWith('.md')) {
      return <EmbeddedUploadAttach type="markdown" src={src} />
    }
    if (src.endsWith('.docx')) {
      return <EmbeddedUploadAttach type="docx" src={src} />
    }
    if (src.endsWith('.pdf')) {
      return <EmbeddedUploadAttach type="pdf" src={src} />
    }
    if (src.endsWith('.xlsx')) {
      return <EmbeddedUploadAttach type="xlsx" src={src} />
    }
    if (src.endsWith('.csv')) {
      return <EmbeddedUploadAttach type="csv" src={src} />
    }
    if (src.endsWith('.pptx')) {
      return <EmbeddedUploadAttach type="pptx" src={src} />
    }
    if (
      src.endsWith('.jpg') ||
      src.endsWith('.jpeg') ||
      src.endsWith('.png') ||
      src.endsWith('.gif')
    ) {
      return <EmbeddedUploadAttach type="image" src={src} />
    }
    if (src.endsWith('.mp3') || src.endsWith('.wma')) {
      return <EmbeddedUploadAttach type="audio" src={src} />
    }
    if (
      src.endsWith('.mp4') ||
      src.endsWith('.wmv') ||
      src.endsWith('.mkv') ||
      src.endsWith('.avi')
    ) {
      return <EmbeddedUploadAttach type="video" src={src} />
    }
    // if (src.endsWith('.glb')) {
    //   return <EmbeddedUploadAttach type="vr" src={src} />
    // }
    if (
      src.endsWith('.js') ||
      src.endsWith('.ts') ||
      src.endsWith('.py') ||
      src.endsWith('.js') ||
      src.endsWith('.html') ||
      src.endsWith('.css') ||
      src.endsWith('.java') ||
      src.endsWith('.c') ||
      src.endsWith('.cpp') ||
      src.endsWith('.swift') ||
      src.endsWith('.rb') ||
      src.endsWith('.php')
    ) {
      return <EmbeddedUploadAttach type="code" src={src} />
    }
    return <div>Không xác định được học liệu</div>
  }
  return (
    <iframe
      src={src}
      frameBorder={'0'}
      allowFullScreen
      height={420}
      className="w-full rounded-lg"
    />
  )
}
