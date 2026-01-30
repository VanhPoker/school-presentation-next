import { memo } from 'react'
import MediaRender from '../media-render'
import { Material_Code } from '@/types/material/type'

type VrUploadAttachProps = {
  src: string
}
function VrUploadAttach({ src }: VrUploadAttachProps) {
  return (
    <div className="flex-1 rounded-lg overflow-hidden h-[420px] mx-auto">
      {src && (
        <div className="h-[420px] overflow-auto w-full custom-scrollbar">
          <MediaRender
            type={Material_Code.THREED_VR}
            url={src}
            containerClass="w-full h-full border rounded-lg overflow-hidden relative"
          />
        </div>
      )}
    </div>
  )
}
export default memo(VrUploadAttach)
