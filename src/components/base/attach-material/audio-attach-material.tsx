import AudioWaveform from '@/components/ui/wave-audio-player'
import AudioUploadAttach from './audio-upload-attach'

type AudioAttachMaterialProps = {
  src: string
}
const googleDriveRegex = /^(https:\/\/drive\.google\.com\/)file\/d\/([^/]+)\.*$/
const regexUrl =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/
export default function AudioAttachMaterial({ src }: AudioAttachMaterialProps) {
  const isGoogleDriveLink = googleDriveRegex.test(src)
  if (isGoogleDriveLink) {
    return (
      <iframe
        src={src}
        frameBorder={'0'}
        allowFullScreen
        height={100}
        className="w-full rounded-lg"
      />
    )
  }
  const isWebUrl = regexUrl.test(src)
  if (isWebUrl) {
    return (
      <div className="flex-1">
        <AudioWaveform audioUrl={src} />
      </div>
    )
  }
  if (src.startsWith('image-node')) {
    return <AudioUploadAttach src={src} />
  }
  return (
    <div className="text-center w-full px-2 py-1 text-sm">
      Audio không đúng định dạng
    </div>
  )
}
