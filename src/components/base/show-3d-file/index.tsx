"use client";
import { Canvas, CanvasProps } from "@react-three/fiber";
import {
  useGLTF,
  Stage,
  PresentationControls,
  OrbitControls,
  Loader as DreiLoader,
} from "@react-three/drei";
import { memo, Suspense } from "react";
import { Loader2 } from "lucide-react";

type Props = {
  url: string;
  canvasProps?: CanvasProps;
  colorProps?: any;
  presentationControlsProps?: any;
  stageProps?: any;
  orbitControlsProps?: any;
};

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function Show3dFile({
  url,
  canvasProps,
  colorProps,
  presentationControlsProps,
  stageProps,
  orbitControlsProps,
}: Props) {
  if (!url) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100">
        <Loader2 className="animate-spin text-gray-400 w-8 h-8" />
        <span className="ml-2 text-gray-500">Đang tải mô hình 3D...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Suspense
        fallback={
          <div className="absolute w-full h-full inset-0 flex items-center justify-center bg-gray-100/50 z-10">
            <Loader2 className="animate-spin text-gray-400 w-8 h-8" />
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
  );
}

export default memo(Show3dFile);
