'use client'
import { Canvas, CanvasProps } from '@react-three/fiber'
import {
  useGLTF,
  Stage,
  PresentationControls,
  OrbitControls,
  Loader as DreiLoader,
  PresentationControlProps,
  OrbitControlsProps
} from '@react-three/drei'
import { memo, useEffect } from 'react'
import { LoaderCircleIcon } from 'lucide-react'
import { Suspense } from 'react'

type Props = {
  url: string
  canvasProps?: CanvasProps
  colorProps?: any
  presentationControlsProps?: PresentationControlProps
  stageProps?: any
  orbitControlsProps?: OrbitControlsProps
  onLoading?: (isLoading: boolean) => void // Optional callback
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} />
}

const Show3dFile = ({
  url,
  canvasProps,
  colorProps,
  presentationControlsProps,
  stageProps,
  orbitControlsProps,
  onLoading
}: Props) => {
  useEffect(() => {
    onLoading?.(false)
  }, [url, onLoading])

  if (!url) {
    return (
      <div className="flex items-center justify-center w-full h-[380px] bg-gray-100">
        <LoaderCircleIcon className="animate-spin text-gray-400 w-8 h-8" />
        <span className="ml-2 text-gray-500">Đang tải mô hình 3D...</span>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <Suspense
        fallback={
          <div className="absolute w-full h-[380px] inset-0 flex items-center justify-center bg-gray-100/50 z-10">
            <LoaderCircleIcon className="animate-spin text-gray-400 w-8 h-8" />
            <span className="ml-2 text-gray-500">Đang tải mô hình 3D...</span>
          </div>
        }
      >
        <Canvas {...canvasProps}>
          <color {...colorProps} />
          <PresentationControls {...presentationControlsProps}>
            <Stage {...stageProps}>
              <Model url={url} />
            </Stage>
          </PresentationControls>
          <OrbitControls {...orbitControlsProps} />
        </Canvas>
      </Suspense>
      <DreiLoader />
    </div>
  )
}

export default memo(Show3dFile)
