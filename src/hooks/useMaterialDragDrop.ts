import { useState, useMemo, useCallback } from "react";
import { useMaterialCategories } from "./useMaterials";
import { Material } from "@/graphql/materials";
import { MaterialCardData } from "@/components/slide/DraggableMaterialCard";
import { CategoryData } from "@/components/slide/MaterialDragPanel";
import {
  getMaterialThumbnail,
  getCategoryIcon,
  getBgColorByCode,
  getBorderColorByCode,
  getCategoryName,
  Material_Code,
} from "@/lib/material-utils";

/**
 * Logic hook for material drag panel.
 * Handles data fetching, filtering, and transformations.
 * Returns data ready for pure UI components.
 */
export function useMaterialDragPanelLogic() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const { data, isLoading } = useMaterialCategories();

  // Transform categories for UI
  const categories: CategoryData[] = useMemo(() => {
    if (!data?.categories) return [];
    return data.categories.map((cat) => ({
      code: cat.code,
      name: getCategoryName(cat.code),
      count: cat.materials.length,
    }));
  }, [data]);

  // Transform materials for UI
  const materials: MaterialCardData[] = useMemo(() => {
    if (!data) return [];

    const category = data.categories.find((c) => c.code === activeCategory);
    const rawMaterials = category?.materials || [];

    // Filter by search
    const filtered = searchQuery
      ? rawMaterials.filter((m) =>
          m.title.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : rawMaterials;

    // Transform to UI format - use category.code (activeCategory) not category_id UUID
    return filtered.map((m) => ({
      id: m.id,
      title: m.title,
      categoryCode: activeCategory, // Use the active tab's code (e.g. "video", "image")
      subjectName: m.material_detail?.subject?.name,
      thumbnailUrl: getMaterialThumbnail(m),
    }));
  }, [data, activeCategory, searchQuery]);

  // Utility functions for rendering
  const renderCategoryIcon = useCallback(getCategoryIcon, []);
  const getBgColor = useCallback(getBgColorByCode, []);
  const getBorderColor = useCallback(getBorderColorByCode, []);

  return {
    // State
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,

    // Data
    categories,
    materials,
    isLoading,

    // Utilities
    renderCategoryIcon,
    getBgColor,
    getBorderColor,

    // Prop Aliases for MaterialDragPanel
    onCategoryChange: setActiveCategory,
    onSearchChange: setSearchQuery,
  };
}

/**
 * Logic hook for converting MaterialCardData back to slide element.
 * Used by SlideEditor when dropping material onto canvas.
 */
export function useMaterialToElementConverter() {
  const { data } = useMaterialCategories();

  const convertToElement = useCallback(
    (materialCard: MaterialCardData, position: { x: number; y: number }) => {
      // Find full material data
      const allMaterials = data?.categories.flatMap((c) => c.materials) || [];
      const fullMaterial = allMaterials.find((m) => m.id === materialCard.id);

      if (!fullMaterial) {
        // Fallback if material not found
        return {
          type: materialCard.categoryCode || "image",
          content: {
            url: materialCard.thumbnailUrl || "",
            title: materialCard.title,
          },
          x: position.x,
          y: position.y,
          width: 0.3,
          height: 0.3,
        };
      }

      // Use materialCard.categoryCode directly - it's already the correct code from the active tab
      return materialToElement(
        fullMaterial,
        materialCard.categoryCode,
        position,
      );
    },
    [data],
  );

  return { convertToElement };
}

/**
 * Helper function to convert Material to slide element data.
 */
function materialToElement(
  material: Material,
  categoryCode: string,
  position: { x: number; y: number },
) {
  let type = "image";

  // Map category code to element type
  // Default to using the categoryCode directly if it matches a known type
  const knownTypes = [
    "video",
    "3d-vr",
    "audio",
    "image",
    "document",
    "lecture",
    "interactive",
    "scorm/xapi",
    "book",
    "digitaldoc",
    "embedded",
    "exam",
  ];

  // Use direct mapping if category matches known types
  if (knownTypes.includes(categoryCode)) {
    type = categoryCode;
  } else if (categoryCode.includes("3d") || categoryCode.includes("vr")) {
    type = Material_Code.THREED_VR;
  } else if (categoryCode.includes("video")) {
    type = Material_Code.VIDEO;
  } else if (categoryCode.includes("audio")) {
    type = Material_Code.AUDIO;
  } else if (
    categoryCode.includes("interactive") ||
    categoryCode.includes("tuong-tac")
  ) {
    type = Material_Code.INTERACTIVE;
  } else if (
    categoryCode.includes("lecture") ||
    categoryCode.includes("bai-giang") ||
    categoryCode.includes("presentation") ||
    categoryCode.includes("trinh-bay")
  ) {
    type = Material_Code.LECTURE;
  } else if (
    categoryCode.includes("doc") ||
    categoryCode.includes("document") ||
    categoryCode.includes("tai-lieu") ||
    categoryCode.includes("file") ||
    categoryCode.includes("pdf") ||
    categoryCode.includes("word")
  ) {
    type = Material_Code.DOC;
  } else if (categoryCode.includes("embed")) {
    type = Material_Code.EMBEDDED;
  }
  // Default remains "image" for unknown types

  // Get primary file URL - fallback to first attachment if no primary
  const attachments = material.material_attachments || [];
  const primaryAttachment =
    attachments.find((a) => a.is_primary) || attachments[0];
  const primaryFileUrl = primaryAttachment?.file_upload?.file_urls?.url;

  const thumbnail = getMaterialThumbnail(material);

  // Handle S3 URL prefix
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"; // Corrected line
  const getFullUrl = (path?: string | null) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_URL}/${path}`; // Changed S3_BASE to API_URL
  };

  const url = getFullUrl(primaryFileUrl) || getFullUrl(thumbnail) || "";

  // Debug log for development
  console.log("[Material→Element]", {
    title: material.title,
    type,
    categoryCode,
    attachmentsCount: attachments.length,
    primaryFileUrl,
    thumbnail,
    finalUrl: url,
  });

  return {
    type,
    content: {
      url,
      thumbnail: getFullUrl(thumbnail),
      title: material.title,
      materialId: material.id,
    },
    x: position.x,
    y: position.y,
    width: 0.3,
    height: 0.3,
  };
}

/**
 * Type for material drop event data
 */
export interface MaterialDropData {
  material: MaterialCardData;
  position: { x: number; y: number };
}
