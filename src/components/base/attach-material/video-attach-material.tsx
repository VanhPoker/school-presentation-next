import VideoUploadAttach from './video-upload-attach'

type VideoAttachMaterialProps = {
  src: string
}

const regexYoutubeUrl =
  /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(?:-nocookie)?\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|live\/|v\/)?)([\w-]+)(\S+)?$/
const regexUrl =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/
export default function VideoAttachMaterial({ src }: VideoAttachMaterialProps) {
  const isYoutubeVideo = regexYoutubeUrl.test(src)
  if (isYoutubeVideo) {
    return (
      <iframe
        src={src}
        frameBorder={'0'}
        allowFullScreen
        height={300}
        className="w-full rounded-lg"
      />
    )
  }
  const isWebUrl = regexUrl.test(src)
  if (isWebUrl) {
    return (
      <div className="flex-1 rounded-lg overflow-hidden">
        <video src={src} controls className="w-auto mx-auto h-[420px]" />
      </div>
    )
  }
  if (src.startsWith('image-node')) {
    return <VideoUploadAttach src={src} />
  }
  return (
    <div className="text-center w-full px-2 py-1 text-sm">
      Video không đúng định dạng
    </div>
  )
}
