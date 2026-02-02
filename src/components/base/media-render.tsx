"use client";
import Image from "next/image";
import { Material_Code } from "@/lib/material-utils";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Dynamic imports for heavy components
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });
const Show3dFile = dynamic(() => import("@/components/base/show-3d-file"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full grid place-content-center bg-gray-100">
      <Loader2 className="animate-spin" />
    </div>
  ),
});
const DocViewerDisplay = dynamic(
  () => import("@/components/base/doc-viewer-display"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full grid place-content-center bg-gray-100">
        <Loader2 className="animate-spin" />
      </div>
    ),
  },
);

interface MediaRenderProps {
  url: string;
  type: string;
  containerClass?: string;
  isMini?: boolean;
  handleImageLoadDone?: (loaded: boolean) => void;
  mediaProps?: any;
  fileType?: string;
}

export default function MediaRender({
  url,
  type,
  containerClass,
  isMini,
  handleImageLoadDone,
  mediaProps,
  fileType,
}: MediaRenderProps) {
  if (!url) return null;

  // Normalizing type to lowercase for easier matching
  const normalizedType = type?.toLowerCase() || "";

  // 1. IMAGE
  if (normalizedType.includes("image") || type === Material_Code.IMAGE) {
    return (
      <div className={cn(containerClass, "flex items-center justify-center")}>
        <div className="relative w-full h-full">
          <Image
            src={url}
            alt="media"
            fill
            className="object-contain"
            unoptimized
            onLoadingComplete={() =>
              handleImageLoadDone && handleImageLoadDone(true)
            }
            {...mediaProps}
          />
        </div>
      </div>
    );
  }

  // 2. VIDEO
  if (normalizedType.includes("video") || type === Material_Code.VIDEO) {
    if (isMini) {
      return (
        <div
          className={cn(
            containerClass,
            "bg-black flex items-center justify-center cursor-pointer",
          )}
        >
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white">
            ▶
          </div>
        </div>
      );
    }
    return (
      <div className={cn(containerClass, "bg-black aspect-video")}>
        <ReactPlayer
          url={url}
          width="100%"
          height="100%"
          controls={true}
          {...mediaProps}
        />
      </div>
    );
  }

  // 3. AUDIO
  if (normalizedType.includes("audio") || type === Material_Code.AUDIO) {
    return (
      <div
        className={cn(
          containerClass,
          "flex items-center justify-center bg-gray-100 rounded p-4",
        )}
      >
        <audio controls src={url} className="w-full max-w-md" {...mediaProps} />
      </div>
    );
  }

  // 4. DOCUMENT (PDF, Office) - Use appropriate viewer
  if (
    normalizedType.includes("doc") ||
    normalizedType.includes("lecture") ||
    type === Material_Code.DOC ||
    type === Material_Code.LECTURE
  ) {
    // Check if explicitly PDF - use iframe directly
    if (
      fileType?.includes("application/pdf") ||
      url.toLowerCase().endsWith(".pdf")
    ) {
      return (
        <div className={cn(containerClass, "bg-white h-full")}>
          <iframe
            src={url}
            allowFullScreen
            className="w-full h-full border-none"
            title="PDF Viewer"
            {...mediaProps}
          />
        </div>
      );
    }

    // For Office files (PPTX, DOCX, XLSX), use Google Docs Viewer with fallback
    const isOfficeFile =
      url.toLowerCase().endsWith(".pptx") ||
      url.toLowerCase().endsWith(".ppt") ||
      url.toLowerCase().endsWith(".docx") ||
      url.toLowerCase().endsWith(".doc") ||
      url.toLowerCase().endsWith(".xlsx") ||
      url.toLowerCase().endsWith(".xls") ||
      fileType?.includes("officedocument");

    if (isOfficeFile) {
      // Use Google Docs Viewer
      const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
      return (
        <div className={cn(containerClass, "bg-white h-full relative group")}>
          <iframe
            src={googleViewerUrl}
            className="w-full h-full border-none"
            title="Office Viewer"
            allowFullScreen
            {...mediaProps}
          />
          {/* Add a fallback link that appears on hover or if content fails */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded p-2 z-10">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white text-xs hover:underline flex items-center gap-1"
            >
              <span>Download / Open Original</span>
            </a>
          </div>
        </div>
      );
    }

    // Fallback to Google Docs Viewer for other document types
    const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    return (
      <div className={cn(containerClass, "bg-white h-full")}>
        <iframe
          src={googleViewerUrl}
          className="w-full h-full border-none"
          title="Document Viewer"
          loading="lazy"
          {...mediaProps}
        />
      </div>
    );
  }

  // 5. 3D / GLB - Use Show3dFile
  if (
    normalizedType.includes("3d") ||
    normalizedType.includes("glb") ||
    normalizedType.includes("gltf") ||
    type === Material_Code.THREED_VR
  ) {
    return (
      <div className={cn(containerClass, "relative")}>
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
      </div>
    );
  }

  // 6. SCORM / HTML / Interactive - Embedded Iframe
  if (
    normalizedType.includes("scorm") ||
    normalizedType.includes("html") ||
    normalizedType.includes("interactive") ||
    type === Material_Code.SCORM_XAPI ||
    type === Material_Code.INTERACTIVE
  ) {
    return (
      <div className={cn(containerClass, "bg-white h-full")}>
        <iframe
          src={url}
          className="w-full h-full border-none"
          title="Interactive Content"
          allowFullScreen
          {...mediaProps}
        />
      </div>
    );
  }

  // Fallback for unsupported types
  return (
    <div
      className={cn(
        containerClass,
        "flex items-center justify-center border bg-gray-50 text-gray-500 p-4",
      )}
    >
      <div className="text-center">
        <p className="font-semibold mb-1">Không hỗ trợ định dạng: {type}</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline text-sm"
        >
          Mở file
        </a>
      </div>
    </div>
  );
}
