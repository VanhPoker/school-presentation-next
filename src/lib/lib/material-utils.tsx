import {
  BookOpenIcon,
  BoxIcon,
  FileTextIcon,
  HeadphonesIcon,
  ImageIcon,
  MousePointerClickIcon,
  PlayIcon,
  PresentationIcon,
  FileKeyIcon,
  Layers,
} from "lucide-react";
import { ReactElement } from "react";

// Material category codes
export enum Material_Code {
  AUDIO = "audio",
  DOC = "document",
  IMAGE = "image",
  VIDEO = "video",
  THREED_VR = "3d-vr",
  LECTURE = "lecture",
  INTERACTIVE = "interactive",
  SCORM_XAPI = "scorm/xapi",
  BOOK = "book",
  DIGITALDOC = "digitaldoc",
  EMBEDDED = "embedded",
  EXAM = "exam",
  ALL = "all",
}

// Render icon component by category code
export const getCategoryIcon = (code: string, size = 16): ReactElement => {
  switch (code) {
    case Material_Code.AUDIO:
      return <HeadphonesIcon size={size} />;
    case Material_Code.DOC:
      return <FileTextIcon size={size} />;
    case Material_Code.IMAGE:
      return <ImageIcon size={size} />;
    case Material_Code.LECTURE:
      return <PresentationIcon size={size} />;
    case Material_Code.SCORM_XAPI:
      return <FileKeyIcon size={size} />;
    case Material_Code.THREED_VR:
      return <BoxIcon size={size} />;
    case Material_Code.VIDEO:
      return <PlayIcon size={size} />;
    case Material_Code.BOOK:
      return <BookOpenIcon size={size} />;
    case Material_Code.INTERACTIVE:
      return <MousePointerClickIcon size={size} />;
    case Material_Code.EXAM:
      return <FileKeyIcon size={size} />; // Using FileKeyIcon or similar for Exam
    case Material_Code.ALL:
      return <Layers size={size} />;
    default:
      return <FileTextIcon size={size} />;
  }
};

// Get thumbnail URL from material data
// Handles both object and array formats for material_thumbnails
// Also handles relative paths by adding S3 base URL prefix
export const getMaterialThumbnail = (material: {
  material_thumbnails?: { url?: string } | Array<{ url?: string }>;
  thumbnail?: string;
}): string | null => {
  const S3_BASE_URL =
    import.meta.env.VITE_S3_BASE_URL || "https://s3-dev.gkebooks.click";

  // Priority: material_thumbnails.url (can be object or array)
  let thumbnailFromTable: string | undefined;

  if (material.material_thumbnails) {
    if (Array.isArray(material.material_thumbnails)) {
      thumbnailFromTable = material.material_thumbnails[0]?.url;
    } else {
      // It's an object with url property
      thumbnailFromTable = (material.material_thumbnails as { url?: string })
        .url;
    }
  }

  if (thumbnailFromTable) {
    // If it's already a full URL, return it
    if (
      thumbnailFromTable.startsWith("https://") ||
      thumbnailFromTable.startsWith("http://")
    ) {
      return thumbnailFromTable;
    }
    // Otherwise, prefix with S3 base URL
    return `${S3_BASE_URL}/${thumbnailFromTable}`;
  }

  // Fallback to thumbnail field
  if (material.thumbnail) {
    if (
      material.thumbnail.startsWith("https://") ||
      material.thumbnail.startsWith("http://")
    ) {
      return material.thumbnail;
    }
    // Add S3 prefix for relative paths
    return `${S3_BASE_URL}/${material.thumbnail}`;
  }

  return null;
};

// Get border color by category code (for hover effects)
export const getBorderColorByCode = (code: string): string => {
  const colorMap: Record<string, string> = {
    digitaldoc: "rgba(206, 234, 176, 1)",
    exam: "rgba(249, 219, 175, 1)",
    lecture: "rgba(171, 239, 198, 1)",
    document: "rgba(217, 214, 254, 1)",
    "3d-vr": "rgba(254, 205, 202, 1)",
    video: "rgba(254, 223, 137, 1)",
    image: "rgba(185, 230, 254, 1)",
    audio: "rgba(252, 206, 238, 1)",
    "scorm/xapi": "rgba(178, 221, 255, 1)",
    interactive: "rgba(200, 200, 255, 1)",
    book: "rgba(176, 234, 206, 1)",
  };
  return colorMap[code] || "rgba(185, 230, 254, 1)";
};

// Get background color by category code
export const getBgColorByCode = (code: string): string => {
  const colorMap: Record<string, string> = {
    digitaldoc: "rgba(206, 234, 176, 0.2)",
    lecture: "rgba(171, 239, 198, 0.2)",
    document: "rgba(217, 214, 254, 0.2)",
    "3d-vr": "rgba(254, 205, 202, 0.2)",
    video: "rgba(254, 223, 137, 0.2)",
    image: "rgba(185, 230, 254, 0.2)",
    audio: "rgba(252, 206, 238, 0.2)",
    "scorm/xapi": "rgba(178, 221, 255, 0.2)",
    interactive: "rgba(200, 200, 255, 0.2)",
    book: "rgba(176, 234, 206, 0.2)",
  };
  return colorMap[code] || "rgba(185, 230, 254, 0.2)";
};

// Get category name in Vietnamese
export const getCategoryName = (code: string): string => {
  const nameMap: Record<string, string> = {
    all: "Tất cả",
    image: "Hình ảnh",
    video: "Video",
    "3d-vr": "Mô hình 3D",
    audio: "Âm thanh",
    document: "Tài liệu",
    lecture: "Bài giảng",
    interactive: "Tương tác",
    "scorm/xapi": "SCORM",
    book: "Sách",
    digitaldoc: "Tài liệu số",
    exam: "Bộ đề (Exam)",
  };
  return nameMap[code] || code;
};
