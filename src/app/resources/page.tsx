"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  FolderOpen,
  Star,
  Download,
  Plus,
  Upload,
  Loader2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useMaterialCategories } from "@/hooks/useMaterials";
import { Material } from "@/graphql/materials";
import {
  getCategoryIcon,
  getMaterialThumbnail,
  getBorderColorByCode,
  getBgColorByCode,
} from "@/lib/material-utils";

const subjects = [
  "Toán học",
  "Vật lý",
  "Hóa học",
  "Sinh học",
  "Ngữ văn",
  "Lịch sử",
  "Địa lý",
  "Tiếng Anh",
  "Tin học",
];

export default function ResourceLibrary() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch material categories from API
  const { data, isLoading, error } = useMaterialCategories();

  // Get materials for selected category
  const materials = useMemo(() => {
    if (!data) return [];
    const category = data.categories.find((c) => c.code === selectedCategory);
    return category?.materials || [];
  }, [data, selectedCategory]);

  // Filter by search query
  const filteredMaterials = useMemo(() => {
    if (!searchQuery) return materials;
    return materials.filter((m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [materials, searchQuery]);

  // Get categories for sidebar
  const categories = data?.categories || [];

  return (
    <div className="h-full bg-background flex">
      {/* Left Sidebar - Categories */}
      <aside className="w-64 bg-card border-r border-border flex flex-col h-full">
        <div className="p-4 border-b border-border">
          <h2 className="font-display font-semibold text-foreground">
            Kho học liệu
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Tài nguyên giáo dục
          </p>
        </div>

        <ScrollArea className="flex-1 p-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive text-sm">
              Lỗi khi tải danh mục
            </div>
          ) : (
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.code)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                    selectedCategory === cat.code
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <div className="shrink-0">
                    {getCategoryIcon(cat.code, 16)}
                  </div>
                  <span className="flex-1 text-left line-clamp-1">
                    {cat.name}
                  </span>
                  <Badge
                    variant={
                      selectedCategory === cat.code ? "secondary" : "outline"
                    }
                    className="text-xs ml-auto shrink-0"
                  >
                    {cat.materials?.length || 0}
                  </Badge>
                </button>
              ))}
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
              Môn học
            </h3>
            <div className="space-y-1">
              {subjects.map((subject) => (
                <button
                  key={subject}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>{subject}</span>
                </button>
              ))}
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <Button className="w-full btn-primary-gradient gap-2">
            <Upload className="w-4 h-4" />
            Tải lên học liệu
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm học liệu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80 bg-secondary/50"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Bộ lọc
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center border border-border rounded-lg p-1 bg-card">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === "grid"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === "list"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-slate-50/50">
          <div className="mb-6">
            <h2 className="text-xl font-display font-semibold text-foreground">
              {categories.find((c) => c.code === selectedCategory)?.name ||
                "Tất cả"}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {filteredMaterials.length} tài nguyên
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              Không có tài nguyên nào
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
              {filteredMaterials.map((material, index) => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  index={index}
                  categoryCode={
                    selectedCategory === "all" ? undefined : selectedCategory
                  }
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3 pb-20">
              {filteredMaterials.map((material, index) => (
                <MaterialListItem
                  key={material.id}
                  material={material}
                  index={index}
                  categoryCode={
                    selectedCategory === "all" ? undefined : selectedCategory
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface MaterialCardProps {
  material: Material;
  index: number;
  categoryCode?: string;
}

function MaterialCard({ material, index, categoryCode }: MaterialCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Get thumbnail URL using utility function
  const thumbnailUrl = getMaterialThumbnail(material);

  // Get view count
  const viewCount = material.material_views_aggregate?.aggregate?.count || 0;

  // Get subject
  const subject = material.material_detail?.subject?.name || "Chưa phân loại";

  // Get grade
  const grade = material.material_detail?.grade?.name;

  // Get category code from material's category if not provided
  const materialCategoryCode = categoryCode;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card
        className="group overflow-hidden border-border/50 hover:shadow-xl transition-all duration-300 cursor-pointer bg-card h-full flex flex-col"
        style={{
          borderColor:
            isHovered && materialCategoryCode
              ? getBorderColorByCode(materialCategoryCode)
              : undefined,
        }}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted/30">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={material.title}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            // Fallback: show category icon when no thumbnail
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-muted-foreground opacity-50 scale-[2]">
                {getCategoryIcon(materialCategoryCode || "document", 48)}
              </div>
            </div>
          )}

          {/* Type Badge */}
          <div className="absolute top-3 left-3 p-2 rounded-lg bg-black/60 backdrop-blur text-white">
            {getCategoryIcon(materialCategoryCode || "document", 16)}
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-3 left-3 right-3 flex gap-2">
              <Button size="sm" className="flex-1 btn-accent">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Thêm vào Slide
              </Button>
              <Button size="sm" variant="secondary">
                <Download className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <div
          className="p-4 transition-colors flex-1 flex flex-col"
          style={{
            backgroundColor:
              isHovered && materialCategoryCode
                ? getBgColorByCode(materialCategoryCode)
                : undefined,
          }}
        >
          <div className="flex items-center gap-2 text-xs mb-2">
            <Badge variant="outline" className="text-xs shrink-0">
              {subject}
            </Badge>
            {grade && (
              <Badge variant="outline" className="text-xs shrink-0">
                {grade}
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-foreground line-clamp-2 mb-auto group-hover:text-primary transition-colors text-sm">
            {material.title}
          </h3>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground w-full">
              {material.materials_created_infors?.fullname && (
                <>
                  <div className="w-5 h-5 rounded-full bg-secondary overflow-hidden shrink-0">
                    {material.materials_created_infors.avatar ? (
                      <img
                        src={material.materials_created_infors.avatar}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">
                        {material.materials_created_infors.fullname.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="truncate flex-1">
                    {material.materials_created_infors.fullname}
                  </span>
                </>
              )}
            </div>
            <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0 ml-2">
              <Eye className="w-3 h-3" />
              {viewCount}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function MaterialListItem({
  material,
  index,
  categoryCode,
}: MaterialCardProps) {
  const thumbnailUrl = getMaterialThumbnail(material);
  const viewCount = material.material_views_aggregate?.aggregate?.count || 0;
  const subject = material.material_detail?.subject?.name || "Chưa phân loại";
  const grade = material.material_detail?.grade?.name;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="p-3 flex items-center gap-4 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer bg-card">
        <div className="w-20 h-14 rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center shrink-0 border border-border/50">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={material.title}
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="text-muted-foreground opacity-50">
              {getCategoryIcon(categoryCode || "document", 20)}
            </div>
          )}
        </div>

        <div className="p-2 rounded-lg bg-secondary shrink-0 text-muted-foreground">
          {getCategoryIcon(categoryCode || "document", 16)}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground text-sm truncate">
            {material.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
              {subject}
            </Badge>
            {grade && (
              <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                {grade}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground flex items-center gap-1 ml-2">
              <Eye className="w-3 h-3" />
              {viewCount}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" className="h-8 text-xs btn-accent">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Thêm
          </Button>
          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
            <Download className="w-3.5 h-3.5" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
