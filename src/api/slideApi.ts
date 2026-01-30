/**
 * Slide API Client
 * REST client for slide deck, slide, and element CRUD operations.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Get auth token from localStorage
function getAuthToken(): string | null {
  try {
    // Try common token storage locations
    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("access_token");
    return token;
  } catch {
    return null;
  }
}

// ============ Types ============

export interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

export interface ApiSlideElement {
  id: string;
  slide_id: string;
  type: string;
  content: Record<string, unknown>;
  style: Record<string, unknown>;
  position: Position;
  animation: Record<string, unknown>;
  layer_order: number;
  material_id?: string | null;
}

export interface ApiSlide {
  id: string;
  deck_id: string;
  page_order: number;
  thumbnail_url: string;
  speaker_notes: string;
  layout_type: string;
  background: Record<string, unknown> | string;
  created_at: string;
  updated_at: string;
}

export interface ApiSlideDeck {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  owner_id: string;
  status: string;
  is_public: boolean;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ============ API Functions ============

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers,
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error ${response.status}: ${error}`);
  }

  // Handle empty response (204 No Content)
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// ---- Deck ----

export async function listDecks(ownerId?: string): Promise<ApiSlideDeck[]> {
  const params = ownerId ? `?owner_id=${ownerId}` : "";
  return apiRequest(`/api/slides/decks${params}`);
}

export async function getDeck(deckId: string): Promise<ApiSlideDeck> {
  return apiRequest(`/api/slides/decks/${deckId}`);
}

export async function createDeck(data: {
  title: string;
  description?: string;
  owner_id: string;
  is_public?: boolean;
}): Promise<ApiSlideDeck> {
  return apiRequest("/api/slides/decks", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateDeck(
  deckId: string,
  data: Partial<{
    title: string;
    description: string;
    status: string;
    is_public: boolean;
    settings: Record<string, unknown>;
  }>,
): Promise<ApiSlideDeck> {
  return apiRequest(`/api/slides/decks/${deckId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ---- Slides ----

export async function getSlides(deckId: string): Promise<ApiSlide[]> {
  return apiRequest(`/api/slides/decks/${deckId}/slides`);
}

export async function createSlide(data: {
  deck_id: string;
  page_order: number;
  layout_type?: string;
  background?: Record<string, unknown> | string;
  speaker_notes?: string;
}): Promise<ApiSlide> {
  return apiRequest("/api/slides/slides", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSlide(
  slideId: string,
  data: Partial<{
    page_order: number;
    layout_type: string;
    background: Record<string, unknown> | string;
    speaker_notes: string;
    thumbnail_url: string;
  }>,
): Promise<ApiSlide> {
  return apiRequest(`/api/slides/slides/${slideId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteSlide(slideId: string): Promise<void> {
  await apiRequest(`/api/slides/slides/${slideId}`, {
    method: "DELETE",
  });
}

// ---- Elements ----

export async function getElements(slideId: string): Promise<ApiSlideElement[]> {
  return apiRequest(`/api/slides/slides/${slideId}/elements`);
}

export async function createElement(data: {
  slide_id: string;
  type: string;
  content: Record<string, unknown>;
  style?: Record<string, unknown>;
  position: Position;
  animation?: Record<string, unknown>;
  layer_order: number;
  material_id?: string;
}): Promise<ApiSlideElement> {
  return apiRequest("/api/slides/elements", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateElement(
  elementId: string,
  data: Partial<{
    content: Record<string, unknown>;
    style: Record<string, unknown>;
    position: Position;
    animation: Record<string, unknown>;
    layer_order: number;
    material_id: string | null;
  }>,
): Promise<ApiSlideElement> {
  return apiRequest(`/api/slides/elements/${elementId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteElement(elementId: string): Promise<void> {
  await apiRequest(`/api/slides/elements/${elementId}`, {
    method: "DELETE",
  });
}

/**
 * Delete all elements from a slide (useful for cleanup)
 */
export async function deleteAllElementsFromSlide(
  slideId: string,
): Promise<number> {
  const elements = await getElements(slideId);
  let deleted = 0;
  for (const el of elements) {
    try {
      await deleteElement(el.id);
      deleted++;
    } catch (e) {
      console.error(`Failed to delete element ${el.id}:`, e);
    }
  }
  return deleted;
}

// ============ Mappers ============

import { Slide, SlideElement } from "@/types/slide";

/**
 * Convert API element to frontend SlideElement
 */
export function mapApiElementToFrontend(api: ApiSlideElement): SlideElement {
  return {
    id: api.id,
    type: api.type as SlideElement["type"],
    x: api.position.x,
    y: api.position.y,
    width: api.position.width,
    height: api.position.height,
    rotation: api.position.rotation,
    content: api.content,
    style: api.style as SlideElement["style"],
    materialId: api.material_id ?? undefined,
    layer: api.layer_order,
  };
}

/**
 * Convert frontend SlideElement to API format
 */
export function mapFrontendElementToApi(
  el: SlideElement,
  slideId: string,
): Omit<ApiSlideElement, "id"> {
  return {
    slide_id: slideId,
    type: el.type,
    content: el.content,
    style: el.style ?? {},
    position: {
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height,
      rotation: el.rotation,
    },
    animation: {},
    layer_order: el.layer,
    material_id: el.materialId ?? null,
  };
}

/**
 * Convert API slide + elements to frontend Slide
 */
export function mapApiSlideToFrontend(
  apiSlide: ApiSlide,
  apiElements: ApiSlideElement[],
): Slide {
  return {
    id: apiSlide.id,
    elements: apiElements.map(mapApiElementToFrontend),
    thumbnail: apiSlide.thumbnail_url,
    background:
      typeof apiSlide.background === "string"
        ? apiSlide.background
        : ((apiSlide.background as { color?: string })?.color ?? "#ffffff"),
    notes: apiSlide.speaker_notes,
  };
}
