import MediaFullScreen from "@/components/base/media-render/media-full-screen";
import AudioWaveform from "@/components/ui/wave-audio-player";
import { cn } from "@/lib/utils";
import { forwardRef, memo } from "react";
// import CSVUploadMaterial from '../attach-material/csv-upload-material'
// import ScromAttachMaterial from '../attach-material/scrom-attach-material'
import dynamic from "next/dynamic";
import { Material_Code } from "@/lib/material-utils";
import { Loader2 } from "lucide-react";
const Show3dFile = dynamic(() => import("@/components/show-3d-file"), {
  loading: () => (
    <div className="w-full h-full grid place-content-center">
      <span className="animate-spin">
        <Loader2 />
      </span>
    </div>
  ),
});
const DocViewerDisplay = dynamic(() => import("../doc-viewer-display"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full grid place-content-center">
      <span className="animate-spin">
        <Loader2 />
      </span>
    </div>
  ),
});
type MediaRenderProps = {
  type: Material_Code;
  url: string;
  fileType?: string;
  mediaProps?: Record<string, any>;
  containerClass?: string;
  handleImageLoadDone?: (check: boolean) => void;
  isMini?: boolean;
  audioSize?: number;
  materialId?: string;
};

const MediaRender = forwardRef<HTMLImageElement, MediaRenderProps>(
  function MediaRenderWithRef(
    {
      type,
      url,
      fileType,
      mediaProps,
      containerClass,
      handleImageLoadDone,
      isMini,
      audioSize,
      materialId,
    },
    ref,
  ) {
    const renderContent = () => {
      if (fileType?.includes("application/pdf")) {
        return (
          <iframe
            src={url}
            allowFullScreen
            width="100%"
            height="100%"
            {...mediaProps}
          />
        );
      }
      if (fileType?.includes("csv")) {
        return null; // <CSVUploadMaterial src={url} />
      }
      if (
        type?.includes(Material_Code.DOC) ||
        type?.includes(Material_Code.LECTURE)
      ) {
        return (
          <DocViewerDisplay
            url={url}
            fileType={fileType}
            mediaProps={mediaProps}
          />
        );
      }
      if (type?.includes(Material_Code.IMAGE)) {
        return (
          <MediaFullScreen
            url={url}
            type={type}
            handleImageLoadDone={handleImageLoadDone}
            ref={ref}
          />
        );
      }
      if (
        type?.includes(Material_Code.SCORM_XAPI) ||
        type?.includes(Material_Code.INTERACTIVE)
      ) {
        return null;
        /*
          <ScromAttachMaterial
            src={url}
            {...mediaProps}
            className="w-full h-full flex flex-col items-center justify-center"
          />
        */
      }
      if (type?.includes(Material_Code.AUDIO)) {
        return (
          <AudioWaveform
            audioUrl={url}
            isMini={isMini}
            size={audioSize && audioSize}
            {...mediaProps}
          />
        );
      }
      if (type?.includes(Material_Code.VIDEO)) {
        return (
          <MediaFullScreen
            url={url}
            type={type}
            isMini={isMini}
            mediaProps={mediaProps}
            materialId={materialId}
          />
        );
      }
      if (type?.includes(Material_Code.THREED_VR)) {
        return (
          <Show3dFile
            url={url}
            canvasProps={{
              dpr: [1, 2],
              shadows: true,
              camera: { fov: 45 },
            }}
            colorProps={{
              attach: "background",
              args: ["#101010"],
            }}
            presentationControlsProps={{
              speed: 3,
              global: true,
              zoom: 0.5,
              polar: [-0.1, Math.PI / 4],
            }}
            stageProps={{
              environment: "sunset",
            }}
            {...mediaProps}
          />
        );
      }
      return (
        <p className="text-center font-extrabold">
          Không hỗ trợ định dạng file hiện tại.
        </p>
      );
    };
    if (!url) return null;
    return (
      <div
        className={cn(
          containerClass,
          type?.includes(Material_Code.IMAGE) &&
            "flex items-center justify-center",
        )}
      >
        {renderContent()}
      </div>
    );
  },
);

export default memo(MediaRender);
