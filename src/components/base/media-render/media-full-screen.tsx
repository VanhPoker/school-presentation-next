import { PlayIcon } from "lucide-react";
import Image from "next/image";
import ReactPlayer from "react-player";
import { usePreviewMediaStore } from "@/stores/use-preview-media-store";
import { forwardRef, useRef, useState } from "react";
// import { useMutation } from '@apollo/client'
// import {
//   InsertMaterialProgressesOneDocument,
//   InsertMaterialProgressesOneMutationVariables,
//   Material_Progresses_Constraint
// } from '@/graphql/generated'
import { useParams } from "next/navigation";
// import { useMaterialDetailStore } from '@/stores/use-material-detail-store'
// import { useAutoSaveProgress } from '@/hooks/use-auto-save-progress'
// import { getUserInfoFromCookie } from '@/server-action/auth'
interface MediaFullScreenProps {
  url: string;
  type: string;
  handleImageLoadDone?: (check: boolean) => void;
  isMini?: boolean;
  mediaProps?: Record<string, any>;
  ref?: any;
  materialId?: string;
}
const MediaFullScreen = forwardRef<HTMLImageElement, MediaFullScreenProps>(
  function MedialFullScreenWithRef(
    { url, type, handleImageLoadDone, isMini = false, mediaProps, materialId },
    ref,
  ) {
    const { setUrl, setType, toggleFullScreenInit } = usePreviewMediaStore();
    // const { id } = useParams()
    // const { materialProgress } = useMaterialDetailStore()
    const [duration, setDuration] = useState(0);
    // const [startTime, setStartTime] = useState(0)
    const playerRef = useRef<ReactPlayer>(null);
    // const hasSeekedRef = useRef(false)
    // const videoStateRef = useRef({
    //   currentTime: 0,
    //   lastSavedTime: 0,
    //   isPlaying: false,
    //   hasSeeked: false
    // })
    // const [insertMaterialProgress] = useMutation(
    //   InsertMaterialProgressesOneDocument
    // )

    // const updateMaterialProgress = async (currentTime: number) => {
    //   // Removed tracking logic
    // }
    // useAutoSaveProgress({...})

    // const handleProgress = (state: any) => {
    //   videoStateRef.current.currentTime = state.playedSeconds
    //   if (hasSeekedRef.current) {
    //     hasSeekedRef.current = false
    //   }
    // }
    // const handlePause = () => {
    //   videoStateRef.current.isPlaying = false
    //   updateMaterialProgress(videoStateRef.current.currentTime)
    // }

    // const handleEnded = () => {
    //   updateMaterialProgress(videoStateRef.current.currentTime)
    // }

    // useEffect(() => {
    //   // Removed restore progress logic
    // }, [materialProgress])

    const openPreviewMedia = () => {
      setUrl(url);
      setType(type);
      toggleFullScreenInit(true);
    };
    if (type.includes("image")) {
      return (
        <Image
          ref={ref}
          src={url}
          alt="Image"
          className="w-full h-full object-contain cursor-pointer"
          width={100}
          height={100}
          unoptimized
          onClick={openPreviewMedia}
          onLoad={() => {
            if (handleImageLoadDone) {
              handleImageLoadDone(true);
            }
          }}
          {...mediaProps}
        />
      );
    }
    if (type.includes("video") && !isMini) {
      return (
        <div className="w-full h-full aspect-video relative">
          <ReactPlayer
            ref={playerRef}
            url={url}
            controls={true}
            width="100%"
            height="100%"
            alt="video-link"
            onDuration={(d) => setDuration(d)}
            // onProgress={handleProgress}
            // onPause={handlePause}
            // onEnded={handleEnded}
            // onPlay={() => (videoStateRef.current.isPlaying = true)}
            // onReady={() => {
            //   if (!videoStateRef.current.hasSeeked && startTime > 0) {
            //     playerRef.current?.seekTo(startTime, 'seconds')
            //     videoStateRef.current.hasSeeked = true
            //   }
            // }}
            {...mediaProps}
          />
          {isMini && (
            <div
              className="absolute top-0 left-0 w-full h-full z-10 cursor-pointer"
              onClick={openPreviewMedia}
            ></div>
          )}
        </div>
      );
    }
    if (type.includes("video") && isMini) {
      return (
        <div
          className="w-full h-full flex flex-col items-center justify-center rounded-lg p-4 cursor-pointer"
          onClick={openPreviewMedia}
        >
          <div className="flex items-center justify-center w-11 h-11 bg-blue-800 text-white rounded-full mb-2 aspect-square ">
            <PlayIcon size={20} />
          </div>
        </div>
      );
    }
    return null;
  },
);
export default MediaFullScreen;
