import { SlideElement } from "@/types/slide";
import { Material_Code, getCategoryIcon } from "@/lib/material-utils";
import { cn } from "@/lib/utils";
import { QuizElement } from "./elements/QuizElement";
import MediaRender from "@/components/base/media-render";
import RenderTiptapContent from "@/components/base/render-tiptap-content";

interface SlideElementRendererProps {
  element: SlideElement;
  isSelected?: boolean;
  isPresenting?: boolean; // When true, enables interactive controls
}

export function SlideElementRenderer({
  element,
  isSelected,
  isPresenting = false,
}: SlideElementRendererProps) {
  const { type, content, style, layer } = element;

  // Debug log to see element type
  console.log("[SlideElement]", {
    type,
    title: content?.title,
    url: content?.url,
  });

  // Common styles
  const commonStyles: React.CSSProperties = {
    width: "100%",
    height: "100%",
    ...style,
    zIndex: layer,
  };

  switch (type) {
    case "text":
    case "heading":
    case "paragraph":
      return (
        <div
          style={{
            ...commonStyles,
            display: "flex",
            flexDirection: "column",
            justifyContent:
              style?.textAlign === "center" || style?.textAlign === "justify"
                ? undefined
                : "flex-start",
            // For Tiptap, alignment is often handled internally or via wrapper
          }}
          className="select-none"
        >
          {content.text ? (
            <RenderTiptapContent content={content.text} />
          ) : (
            <div className="p-2 text-gray-400">Empty Text</div>
          )}
        </div>
      );

    case "image":
    case Material_Code.IMAGE:
      return (
        <div style={commonStyles}>
          <MediaRender
            type={Material_Code.IMAGE}
            url={content.url || ""}
            containerClass="w-full h-full"
            mediaProps={{
              className: "w-full h-full object-contain",
            }}
          />
        </div>
      );

    case "video":
    case Material_Code.VIDEO:
      return (
        <div style={commonStyles}>
          <MediaRender
            type={Material_Code.VIDEO}
            url={content.url || ""}
            isMini={!isPresenting} // If not presenting, maybe show mini? Or just show full player?
            // Legacy MediaRender "isMini" shows a Play icon on click.
            // When presenting, we want full player.
            containerClass="w-full h-full"
            mediaProps={{
              width: "100%",
              height: "100%",
              controls: isPresenting,
            }}
          />
          {!isPresenting && !isSelected && (
            <div className="absolute inset-0 cursor-pointer" />
          )}
        </div>
      );

    case "audio":
    case Material_Code.AUDIO:
      return (
        <div style={commonStyles}>
          <MediaRender
            type={Material_Code.AUDIO}
            url={content.url || ""}
            isMini={false}
            containerClass="w-full h-full flex items-center justify-center"
          />
        </div>
      );

    case "document":
    case Material_Code.DOC:
    case "lecture":
    case Material_Code.LECTURE:
      return (
        <div style={commonStyles}>
          <MediaRender
            type={Material_Code.DOC}
            url={content.url || ""}
            fileType={content.fileType || "application/pdf"} // Default to PDF for DocViewer
            containerClass="w-full h-full"
          />
          {!isPresenting && !isSelected && (
            <div className="absolute inset-0 cursor-pointer" />
          )}
        </div>
      );

    case "3d":
    case "3d-vr":
    case Material_Code.THREED_VR:
      return (
        <div style={commonStyles}>
          <MediaRender
            type={Material_Code.THREED_VR}
            url={content.url || ""}
            containerClass="w-full h-full"
          />
          {!isPresenting && !isSelected && (
            <div className="absolute inset-0 cursor-pointer" />
          )}
        </div>
      );

    // Fallback for shapes or other types manually handled
    case "shape":
      return (
        <div
          style={commonStyles}
          className={cn(
            "transition-colors",
            content.shapeType === "rectangle" && "rounded-md",
            content.shapeType === "circle" && "rounded-full",
          )}
        />
      );

    case "exam":
    case Material_Code.EXAM:
      return (
        <div style={commonStyles}>
          <QuizElement element={element} />
          {!isPresenting && !isSelected && (
            <div className="absolute inset-0 cursor-pointer" />
          )}
        </div>
      );

    default:
      // Try to use MediaRender for unknown types if they match Material_Code
      if (Object.values(Material_Code).includes(type as Material_Code)) {
        return (
          <div style={commonStyles}>
            <MediaRender
              type={type as Material_Code}
              url={content.url || ""}
              containerClass="w-full h-full"
            />
          </div>
        );
      }

      return (
        <div
          style={commonStyles}
          className="border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 text-gray-400"
        >
          {type}
        </div>
      );
  }
}
