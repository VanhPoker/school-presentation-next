import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Plus, Download, Eye } from "lucide-react";
import { useMaterialCategories } from "@/hooks/useMaterials";
import { Material } from "@/graphql/materials";
import { getCategoryIcon, getMaterialThumbnail } from "@/lib/material-utils";
import { cn } from "@/lib/utils";

interface MaterialBrowserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (material: Material) => void;
}

export function MaterialBrowserModal({
  open,
  onOpenChange,
  onSelect,
}: MaterialBrowserModalProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useMaterialCategories();

  const categories = data?.categories || [];

  const materials = useMemo(() => {
    if (!data) return [];
    const category = data.categories.find((c) => c.code === selectedCategory);
    return category?.materials || [];
  }, [data, selectedCategory]);

  const filteredMaterials = useMemo(() => {
    if (!searchQuery) return materials;
    return materials.filter((m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [materials, searchQuery]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle>Thư viện học liệu</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <aside className="w-60 border-r border-border bg-muted/30 flex flex-col">
            <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.code)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                      selectedCategory === cat.code
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {getCategoryIcon(cat.code, 16)}
                    <span className="flex-1 text-left truncate">
                      {cat.name}
                    </span>
                    <span className="text-xs opacity-70">
                      {cat.materials.length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 flex flex-col bg-background">
            <div className="p-4 border-b border-border flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm học liệu..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredMaterials.map((material) => (
                    <MaterialItem
                      key={material.id}
                      material={material}
                      onSelect={() => {
                        onSelect(material);
                        onOpenChange(false);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MaterialItem({
  material,
  onSelect,
}: {
  material: Material;
  onSelect: () => void;
}) {
  const thumbnail = getMaterialThumbnail(material);

  return (
    <div className="group border border-border rounded-lg overflow-hidden hover:border-primary/50 hover:shadow-md transition-all bg-card">
      <div className="aspect-video bg-muted relative overflow-hidden">
        {thumbnail ? (
          <img src={thumbnail} className="w-full h-full object-cover" alt="" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            {getCategoryIcon(material.category_id || "document", 32)}
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button size="sm" onClick={onSelect} className="gap-2">
            <Plus className="w-4 h-4" /> Thêm
          </Button>
        </div>
      </div>

      <div className="p-3">
        <h4 className="font-medium text-sm line-clamp-1 mb-1">
          {material.title}
        </h4>
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <Badge
            variant="secondary"
            className="text-[10px] h-5 px-1.5 font-normal"
          >
            {material.material_detail?.subject?.name || "Chung"}
          </Badge>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />{" "}
            {material.material_views_aggregate?.aggregate?.count || 0}
          </span>
        </div>
      </div>
    </div>
  );
}
