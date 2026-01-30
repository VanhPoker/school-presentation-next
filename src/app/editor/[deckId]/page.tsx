"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Rnd } from "react-rnd";
import {
  ChevronLeft,
  Play,
  Save,
  ZoomIn,
  ZoomOut,
  Settings,
  Plus,
  Copy,
  Trash2,
  Move,
  Type,
  Image,
  Square,
  Video,
  Music,
  Box,
  BarChart3,
  HelpCircle,
  ListChecks,
  Timer,
  MessageCircle,
  PanelLeftClose,
  Grid3X3,
  Layers,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  MousePointerClickIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { createDeck } from "@/api/slideApi";
import { StartSessionButton } from "@/components/session/StartSessionButton";

// Store & Components
import { useSlideStore } from "@/stores/useSlideStore";
import { SlideElementRenderer } from "@/components/slide/SlideElementRenderer";
import { MaterialBrowserModal } from "@/components/slide/MaterialBrowserModal";
import { MaterialDragPanel } from "@/components/slide/MaterialDragPanel";
import { DroppableSlideCanvas } from "@/components/slide/DroppableSlideCanvas";
import {
  Material_Code,
  getMaterialThumbnail,
  getCategoryIcon,
  getBgColorByCode,
  getBorderColorByCode,
} from "@/lib/material-utils";
import { Material } from "@/graphql/materials";
import { useDropTarget, useDragSourceFactory } from "@/hooks/useDragDrop";
import {
  useMaterialDragPanelLogic,
  useMaterialToElementConverter,
} from "@/hooks/useMaterialDragDrop";
import { MaterialCardData } from "@/components/slide/DraggableMaterialCard";
import { useSlidePersistence } from "@/hooks/useSlidePersistence";

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;

const toolbarItems = [
  { id: "select", icon: Move, label: "Chọn (V)" },
  { id: "text", icon: Type, label: "Văn bản (T)" },
  { id: "image", icon: Image, label: "Hình ảnh (I)" },
  { id: "shape", icon: Square, label: "Hình dạng (S)" },
  { id: "video", icon: Video, label: "Video" },
  { id: "audio", icon: Music, label: "Âm thanh" },
];

export default function SlideEditor() {
  const params = useParams();
  const deckId = params?.deckId as string;
  const router = useRouter();

  // Local state
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [isMaterialBrowserOpen, setIsMaterialBrowserOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("elements");

  // Store
  const {
    slides,
    activeSlideId,
    selectedElementIds,
    activeTool,
    scale,
    setActiveSlide,
    updateSlide,
    addElement,
    updateElement,
    removeElements,
    setActiveTool,
    setZoom,
    selectElement,
    deselectAll,
    setDeckId,
    addSlide, // Added this
  } = useSlideStore();

  // Persistence hook with auto-save
  const {
    saveStatus,
    isLoading: isPersistenceLoading,
    loadDeck,
    triggerAutoSave,
    removeElement: removeElementFromBackend,
  } = useSlidePersistence({
    deckId: deckId || "",
    autoSaveDelayMs: 1500,
    onError: (error) => console.error("Save error:", error),
  });

  // Load deck on mount if deckId exists
  useEffect(() => {
    if (deckId === "new") {
      const initNewDeck = async () => {
        try {
          const deck = await createDeck({
            title: "Untitled Presentation",
            description: "Created via Sidebar",
            owner_id: "00000000-0000-0000-0000-000000000000",
          });
          router.replace(`/editor/${deck.id}`);
        } catch (error) {
          console.error("Failed to create new deck:", error);
        }
      };
      initNewDeck();
      return;
    }

    if (deckId) {
      setDeckId(deckId);
      loadDeck();
    }
  }, [deckId, setDeckId, loadDeck, router]);

  const activeSlide = slides.find((s) => s.id === activeSlideId);
  const selectedElement = activeSlide?.elements.find((e) =>
    selectedElementIds.includes(e.id),
  );

  // Drag-drop hooks
  const materialPanelLogic = useMaterialDragPanelLogic();
  const { convertToElement } = useMaterialToElementConverter();
  const { createDragHandlers, isDragging: isMaterialDragging } =
    useDragSourceFactory();

  // Handle drop on canvas
  const handleMaterialDrop = useCallback(
    (material: MaterialCardData, position: { x: number; y: number }) => {
      const elementData = convertToElement(material, position);
      addElement({
        type: elementData.type as any,
        content: elementData.content,
        width: elementData.width,
        height: elementData.height,
        x: elementData.x,
        y: elementData.y,
      });
    },
    [convertToElement, addElement],
  );

  const { isOver, canDrop, dropRef, dropHandlers } = useDropTarget({
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    onDrop: handleMaterialDrop,
  });

  // Wrapper to auto-save after element updates
  const updateElementWithAutoSave = useCallback(
    (id: string, updates: Parameters<typeof updateElement>[1]) => {
      updateElement(id, updates);
      triggerAutoSave();
    },
    [updateElement, triggerAutoSave],
  );

  // Switch to style tab when element selected
  useEffect(() => {
    if (selectedElementIds.length > 0) {
      setActiveTab("style");
    } else {
      setActiveTab("elements");
    }
  }, [selectedElementIds]);

  // Handlers
  const handleAddMaterial = (material: Material) => {
    let type = "image";
    const categoryCode = material.category_id || ""; // Ideally map to code

    // Simplistic mapping
    if (
      material.title.toLowerCase().includes("3d") ||
      categoryCode.includes("3d")
    ) {
      type = Material_Code.THREED_VR;
    } else if (
      material.title.toLowerCase().includes("video") ||
      categoryCode.includes("video")
    ) {
      type = Material_Code.VIDEO;
    } else if (categoryCode.includes("audio")) {
      type = Material_Code.AUDIO;
    }

    const primaryFile = material.material_attachments?.find((a) => a.is_primary)
      ?.file_upload?.file_urls?.url;
    const thumbnail = getMaterialThumbnail(material);

    // S3 prefix handling
    const S3_BASE =
      process.env.NEXT_PUBLIC_API_URL || "https://s3-dev.gkebooks.click";
    const getFullUrl = (path?: string) => {
      if (!path) return "";
      if (path.startsWith("http")) return path;
      return `${S3_BASE}/${path}`;
    };

    const url = getFullUrl(primaryFile) || getFullUrl(thumbnail) || "";

    const content = {
      url: url,
      thumbnail: getFullUrl(thumbnail),
      title: material.title,
      materialId: material.id,
    };

    addElement({
      type: type as any,
      content,
      width: 0.3,
      height: 0.3,
      x: 0.35,
      y: 0.35,
    });
  };

  const handleQuickAdd = (type: string) => {
    switch (type) {
      case "text":
        addElement({
          type: "text",
          content: {
            text: "Double click to edit",
            fontSize: 40,
            fontFamily: "Inter",
            fontWeight: "bold",
            textAlign: "center",
          },
          width: 0.4,
          height: 0.1,
          x: 0.3,
          y: 0.4,
          style: { color: "#000000" },
        });
        break;
      case "shape":
        addElement({
          type: "shape",
          content: { shapeType: "rectangle" },
          width: 0.2,
          height: 0.2,
          x: 0.4,
          y: 0.4,
          style: { backgroundColor: "#3b82f6", borderRadius: 8 },
        });
        break;
      default:
        addElement({
          type: type as any,
          content: { url: "" },
          width: 0.3,
          height: 0.3,
          x: 0.35,
          y: 0.35,
        });
    }
  };

  const handleDelete = async () => {
    if (selectedElementIds.length > 0) {
      // Remove from backend first, then from UI
      for (const id of selectedElementIds) {
        await removeElementFromBackend(id);
      }
      removeElements(selectedElementIds);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        // Only delete if not editing text (simple check)
        if (
          document.activeElement?.tagName !== "INPUT" &&
          document.activeElement?.tagName !== "TEXTAREA"
        ) {
          handleDelete();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedElementIds]);

  // Add Slide Handler
  const handleAddSlide = () => {
    addSlide();
    // Scroll to bottom logic could be added here if we had a ref to the list
    setTimeout(() => {
      triggerAutoSave();
    }, 100);
  };

  return (
    <div className="h-screen flex flex-col bg-canvas-bg overflow-hidden text-foreground">
      {/* Top Header Bar */}
      <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <input
            type="text"
            defaultValue="Bài giảng Toán học - Hình học không gian"
            className="bg-transparent border-none text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 rounded px-2 py-1"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Save status indicator */}
          <span className="text-xs text-muted-foreground">
            {saveStatus === "saving" && "Đang lưu..."}
            {saveStatus === "saved" && "✓ Đã lưu"}
            {saveStatus === "error" && "⚠ Lỗi lưu"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={triggerAutoSave}
            disabled={saveStatus === "saving"}
          >
            <Save className="w-4 h-4" />
            Lưu
          </Button>
          <Link href={`/present/${deckId || "new"}`}>
            <Button size="sm" className="btn-accent gap-2">
              <Play className="w-4 h-4" />
              Present
            </Button>
          </Link>
          {deckId && deckId !== "new" && <StartSessionButton deckId={deckId} />}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Slides */}
        <AnimatePresence mode="wait">
          {showLeftPanel && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="h-full bg-card border-r border-border flex flex-col"
            >
              <div className="p-3 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-sm">Slides</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7"
                  onClick={handleAddSlide}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
                <div className="space-y-3">
                  {slides.map((slide, index) => (
                    <div
                      key={slide.id}
                      onClick={() => setActiveSlide(slide.id)}
                      className={cn(
                        "relative aspect-video rounded-lg border-2 cursor-pointer transition-all overflow-hidden",
                        activeSlideId === slide.id
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-transparent bg-muted hover:bg-muted/80",
                      )}
                    >
                      <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded z-10">
                        {index + 1}
                      </div>
                      <div className="w-full h-full p-2 flex items-center justify-center bg-white text-[8px] text-muted-foreground">
                        {slide.elements.length > 0 ? "Content..." : "Empty"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Toggle Left Panel */}
        <button
          onClick={() => setShowLeftPanel(!showLeftPanel)}
          className="absolute left-0 top-1/2 z-10 w-4 h-12 bg-card border rounded-r-md flex items-center justify-center p-0"
          style={{ left: showLeftPanel ? 240 : 0 }}
        >
          {showLeftPanel ? (
            <ChevronLeft size={12} />
          ) : (
            <PanelLeftClose size={12} />
          )}
        </button>

        {/* Main Canvas */}
        <div
          className="flex-1 flex flex-col overflow-hidden relative"
          onClick={deselectAll}
        >
          {/* Toolbar */}
          <div className="h-12 bg-card/80 backdrop-blur border-b border-border flex items-center justify-center gap-2 px-4 z-40">
            {toolbarItems.map((tool) => (
              <Button
                key={tool.id}
                variant={activeTool === tool.id ? "default" : "ghost"}
                size="icon"
                className="w-8 h-8"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTool(tool.id);
                }}
              >
                <tool.icon className="w-4 h-4" />
              </Button>
            ))}

            <Separator orientation="vertical" className="h-6 mx-2" />

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8"
                onClick={() => setZoom(Math.max(25, scale * 100 - 25))}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-xs w-8 text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8"
                onClick={() => setZoom(Math.min(200, scale * 100 + 25))}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>

            {selectedElementIds.length > 0 && (
              <>
                <Separator orientation="vertical" className="h-6 mx-2" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          {/* Canvas Area */}
          <div className="flex-1 overflow-auto p-12 bg-canvas-bg flex items-center justify-center">
            <DroppableSlideCanvas
              isOver={isOver}
              canDrop={canDrop}
              dropRef={dropRef}
              className="relative bg-white shadow-2xl transition-transform origin-center"
              style={{
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                transform: `scale(${scale})`,
                backgroundColor: activeSlide?.background || "#fff",
              }}
              {...dropHandlers}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Grid */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage:
                    "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                  opacity: 0.05,
                }}
              />

              {/* Elements */}
              {activeSlide?.elements.map((el) => {
                const isSelected = selectedElementIds.includes(el.id);

                return (
                  <Rnd
                    key={el.id}
                    size={{
                      width: el.width * CANVAS_WIDTH,
                      height: el.height * CANVAS_HEIGHT,
                    }}
                    position={{
                      x: el.x * CANVAS_WIDTH,
                      y: el.y * CANVAS_HEIGHT,
                    }}
                    // When selected, only allow dragging from the drag handle
                    // This allows interaction with video/3D controls
                    dragHandleClassName={isSelected ? "drag-handle" : undefined}
                    // Cancel drag on content area when selected
                    cancel={isSelected ? ".element-content" : undefined}
                    onDragStart={(e) => {
                      e.stopPropagation();
                      selectElement(el.id, false);
                    }}
                    onDragStop={(e, d) => {
                      updateElementWithAutoSave(el.id, {
                        x: d.x / CANVAS_WIDTH,
                        y: d.y / CANVAS_HEIGHT,
                      });
                    }}
                    onResizeStop={(e, direction, ref, delta, position) => {
                      updateElementWithAutoSave(el.id, {
                        width: parseFloat(ref.style.width) / CANVAS_WIDTH,
                        height: parseFloat(ref.style.height) / CANVAS_HEIGHT,
                        x: position.x / CANVAS_WIDTH,
                        y: position.y / CANVAS_HEIGHT,
                      });
                    }}
                    bounds="parent"
                    className={cn(
                      isSelected && "outline outline-2 outline-primary z-50",
                      "group",
                    )}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      selectElement(el.id, e.shiftKey);
                    }}
                  >
                    <div className="w-full h-full relative">
                      {/* Drag handle - always available */}
                      <div className="drag-handle absolute -top-6 left-0 right-0 h-6 bg-primary/80 text-white text-xs flex items-center justify-center cursor-move rounded-t z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="select-none">⋮⋮ Kéo di chuyển</span>
                      </div>
                      {/* Content area - when selected, clicking here won't trigger drag */}
                      <div
                        className={cn(
                          "element-content w-full h-full",
                          !isSelected && "cursor-move",
                        )}
                      >
                        <SlideElementRenderer
                          element={el}
                          isSelected={isSelected}
                        />
                      </div>
                    </div>
                  </Rnd>
                );
              })}
            </DroppableSlideCanvas>
          </div>
        </div>

        {/* Right Sidebar - Properties & Add */}
        <AnimatePresence mode="wait">
          {showRightPanel && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="h-full bg-card border-l border-border flex flex-col"
            >
              <Tabs
                defaultValue="elements"
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex-1 flex flex-col h-full"
              >
                <div className="px-4 pt-3 flex items-center justify-between border-b border-border bg-muted/20">
                  <TabsList className="bg-transparent border-b border-transparent w-full justify-start h-auto p-0 gap-4">
                    <TabsTrigger
                      value="elements"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-2"
                    >
                      Thêm
                    </TabsTrigger>
                    <TabsTrigger
                      value="style"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-2"
                    >
                      Thiết kế
                    </TabsTrigger>
                    <TabsTrigger
                      value="animation"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-2"
                    >
                      Hiệu ứng
                    </TabsTrigger>
                  </TabsList>

                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <PanelLeftClose className="w-4 h-4 rotate-180" />
                  </Button>
                </div>

                <div className="flex-1 overflow-hidden relative">
                  <TabsContent
                    value="elements"
                    className="h-full m-0 data-[state=inactive]:hidden"
                  >
                    <div className="h-full flex flex-col">
                      {/* Basic Elements Quick Add */}
                      <div className="p-4 grid grid-cols-4 gap-2">
                        <Button
                          variant="outline"
                          className="flex flex-col h-auto py-3 gap-1"
                          onClick={() => handleQuickAdd("text")}
                        >
                          <Type className="w-5 h-5 text-primary" />
                          <span className="text-[10px]">Văn bản</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="flex flex-col h-auto py-3 gap-1"
                          onClick={() => handleQuickAdd("image")}
                        >
                          <Image className="w-5 h-5 text-blue-500" />
                          <span className="text-[10px]">Ảnh</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="flex flex-col h-auto py-3 gap-1"
                          onClick={() => handleQuickAdd("shape")}
                        >
                          <Square className="w-5 h-5 text-orange-500" />
                          <span className="text-[10px]">Hình</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="flex flex-col h-auto py-3 gap-1"
                          onClick={() => handleQuickAdd("video")}
                        >
                          <Video className="w-5 h-5 text-red-500" />
                          <span className="text-[10px]">Video</span>
                        </Button>
                      </div>

                      <Separator />

                      {/* Material Panel */}
                      <div className="flex-1 overflow-hidden">
                        <MaterialDragPanel
                          onDragStart={createDragHandlers}
                          isDragging={isMaterialDragging}
                          onMaterialDoubleClick={(material) =>
                            handleMaterialDrop(material, { x: 0.35, y: 0.35 })
                          }
                          {...materialPanelLogic}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="style"
                    className="h-full m-0 p-4 overflow-y-auto custom-scrollbar data-[state=inactive]:hidden"
                  >
                    {selectedElement ? (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">
                            {selectedElement.type === "text" && "Văn bản"}
                            {selectedElement.type === "image" && "Hình ảnh"}
                            {selectedElement.type === "shape" && "Hình dạng"}
                          </h3>
                        </div>

                        {/* Common properties */}
                        <div className="space-y-3">
                          <Label>Vị trí & Kích thước</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs text-muted-foreground">
                                X
                              </Label>
                              <Input
                                type="number"
                                value={Math.round(selectedElement.x * 100)}
                                onChange={(e) =>
                                  updateElementWithAutoSave(
                                    selectedElement.id,
                                    { x: parseInt(e.target.value) / 100 },
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">
                                Y
                              </Label>
                              <Input
                                type="number"
                                value={Math.round(selectedElement.y * 100)}
                                onChange={(e) =>
                                  updateElementWithAutoSave(
                                    selectedElement.id,
                                    { y: parseInt(e.target.value) / 100 },
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {selectedElement.type === "text" && (
                          <div className="space-y-3">
                            <Label>Định dạng văn bản</Label>
                            <div className="flex items-center gap-1 border rounded-md p-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <Bold className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <Italic className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <Underline className="w-4 h-4" />
                              </Button>
                              <Separator
                                orientation="vertical"
                                className="h-6 mx-1"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <AlignLeft className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <AlignCenter className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <AlignRight className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}

                        <div className="pt-4">
                          <Button
                            variant="destructive"
                            className="w-full gap-2"
                            onClick={handleDelete}
                          >
                            <Trash2 className="w-4 h-4" />
                            Xóa phần tử
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-4">
                        <MousePointerClickIcon
                          size={48}
                          className="mb-4 opacity-20"
                        />
                        <p>
                          Chọn một phần tử trên slide để chỉnh sửa thuộc tính
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
