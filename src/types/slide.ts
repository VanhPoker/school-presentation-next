import { Material_Code } from "@/lib/material-utils";

export type ElementType =
  | "text"
  | "image"
  | "video"
  | "shape"
  | "chart"
  | "3d"
  | "quiz"
  | "poll"
  | Material_Code;

export interface SlideElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  content: any; // Content specific to the element type (text details, image URL, material ID, etc.)
  style?: {
    backgroundColor?: string;
    border?: string;
    borderRadius?: number;
    opacity?: number;
    color?: string; // Text color
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    textAlign?: "left" | "center" | "right" | "justify";
    [key: string]: any;
  };
  materialId?: string; // If linked to a material from the library
  layer: number;
}

export interface Slide {
  id: string;
  elements: SlideElement[];
  thumbnail?: string;
  background?: string;
  notes?: string;
  transition?: {
    type: string;
    duration: number;
  };
}

export interface SlideDeck {
  id: string;
  title: string;
  slides: Slide[];
  lastModified: Date;
}
