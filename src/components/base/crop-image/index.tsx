import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import Cropper from 'react-easy-crop'
type CropImageProps = {
  src: string
  updateCroppedAreaPixel: (data: {
    width: number
    height: number
    x: number
    y: number
  }) => void
}
export default function CropImage({
  src,
  updateCroppedAreaPixel
}: CropImageProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  const onCropComplete = async (_croppedArea: any, croppedAreaPixels: any) => {
    updateCroppedAreaPixel(croppedAreaPixels)
  }
  return (
    <div className="w-full h-full relative">
      <Cropper
        image={src}
        crop={crop}
        zoom={zoom}
        cropShape="round"
        style={{
          cropAreaStyle: {
            border: 'none'
          }
        }}
        aspect={1}
        showGrid={false}
        onCropChange={setCrop}
        onCropComplete={onCropComplete}
        onZoomChange={setZoom}
      />
      <Slider
        defaultValue={[1]}
        max={2}
        min={1}
        step={0.01}
        onValueChange={(value) => {
          if (!value[0]) return
          setZoom(value[0])
        }}
        className={cn('w-full absolute -bottom-8 left-0')}
      />
    </div>
  )
}
