"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus,
  Upload,
  FolderOpen,
  Grid3X3,
  List,
  Search,
  Filter,
  MoreHorizontal,
  Play,
  Edit3,
  Copy,
  Trash2,
  Share2,
  Clock,
  Eye,
  Users,
  Presentation,
  Star,
  Loader2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { listDecks, createDeck, ApiSlideDeck } from "@/api/slideApi";

// Presentation type for UI
interface PresentationUI {
  id: string;
  title: string;
  thumbnail: string;
  slides: number;
  updatedAt: Date;
  viewCount: number;
  presentCount: number;
  status: "published" | "draft";
  tags: string[];
  isFavorite: boolean;
}

// Map API deck to UI format
function mapDeckToUI(deck: ApiSlideDeck): PresentationUI {
  return {
    id: deck.id,
    title: deck.title || "Untitled Presentation",
    thumbnail:
      deck.thumbnail_url ||
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=225&fit=crop",
    slides: 0, // TODO: fetch slide count
    updatedAt: new Date(deck.updated_at),
    viewCount: 0,
    presentCount: 0,
    status: deck.status === "published" ? "published" : "draft",
    tags: [],
    isFavorite: false,
  };
}

const stats = [
  {
    label: "Tổng presentations",
    value: "0",
    icon: Presentation,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    label: "Lượt xem",
    value: "0",
    icon: Eye,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    label: "Lượt present",
    value: "0",
    icon: Play,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    label: "Được chia sẻ",
    value: "0",
    icon: Users,
    color: "text-feature",
    bgColor: "bg-feature/10",
  },
];

export default function Dashboard() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [presentations, setPresentations] = useState<PresentationUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch decks from backend
  useEffect(() => {
    async function fetchDecks() {
      setIsLoading(true);
      try {
        const decks = await listDecks();
        setPresentations(decks.map(mapDeckToUI));
      } catch (error) {
        console.error("Failed to fetch decks:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDecks();
  }, []);

  // Create new deck and navigate to editor
  const handleCreateNew = async () => {
    setIsCreating(true);
    try {
      const newDeck = await createDeck({
        title: "Untitled Presentation",
        owner_id: "00000000-0000-0000-0000-000000000000", // TODO: use real user ID
      });
      router.push(`/editor/${newDeck.id}`);
    } catch (error) {
      console.error("Failed to create deck:", error);
      setIsCreating(false);
    }
  };

  // Dynamic stats based on real data
  const dynamicStats = [
    { ...stats[0], value: String(presentations.length) },
    {
      ...stats[1],
      value: String(presentations.reduce((sum, p) => sum + p.viewCount, 0)),
    },
    {
      ...stats[2],
      value: String(presentations.reduce((sum, p) => sum + p.presentCount, 0)),
    },
    stats[3],
  ];

  return (
    <div className="min-h-full bg-background">
      {/* Stats Section */}
      <div className="px-6 py-6 border-b border-border bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Xin chào, Thầy/Cô Mai! 👋
              </h1>
              <p className="text-muted-foreground mt-1">
                Quản lý và tạo bài thuyết trình của bạn
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2">
                <Upload className="w-4 h-4" />
                Upload
              </Button>
              <Button variant="outline" className="gap-2">
                <FolderOpen className="w-4 h-4" />
                Từ kho học liệu
              </Button>
              <Button
                onClick={handleCreateNew}
                disabled={isCreating}
                className="btn-primary-gradient gap-2"
              >
                {isCreating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Tạo mới
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dynamicStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4 border-border/50 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-xl", stat.bgColor)}>
                      <stat.icon className={cn("w-5 h-5", stat.color)} />
                    </div>
                    <div>
                      <p className="text-2xl font-display font-bold text-foreground">
                        {stat.value}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Tabs & Filters */}
          <Tabs defaultValue="all" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="bg-secondary/50">
                <TabsTrigger value="all">Tất cả</TabsTrigger>
                <TabsTrigger value="recent">Gần đây</TabsTrigger>
                <TabsTrigger value="favorites">Yêu thích</TabsTrigger>
                <TabsTrigger value="shared">Được chia sẻ</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64 bg-card"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
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
            </div>

            <TabsContent value="all" className="mt-6">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {/* Create New Card */}
                  <Link href="/editor/new">
                    <motion.div
                      whileHover={{ scale: 1.02, y: -4 }}
                      className="aspect-[16/10] rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary hover:bg-primary/10 transition-all"
                    >
                      <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                        <Plus className="w-7 h-7 text-primary" />
                      </div>
                      <p className="font-medium text-primary">
                        Tạo presentation mới
                      </p>
                    </motion.div>
                  </Link>

                  {/* Presentation Cards */}
                  {presentations.map((pres, index) => (
                    <PresentationCard
                      key={pres.id}
                      presentation={pres}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {presentations.map((pres, index) => (
                    <PresentationListItem
                      key={pres.id}
                      presentation={pres}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="recent">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {presentations.slice(0, 4).map((pres, index) => (
                  <PresentationCard
                    key={pres.id}
                    presentation={pres}
                    index={index}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="favorites">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {presentations
                  .filter((p) => p.isFavorite)
                  .map((pres, index) => (
                    <PresentationCard
                      key={pres.id}
                      presentation={pres}
                      index={index}
                    />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="shared">
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Chưa có bài thuyết trình nào được chia sẻ với bạn</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

interface PresentationCardProps {
  presentation: PresentationUI;
  index: number;
}

function PresentationCard({ presentation, index }: PresentationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="group overflow-hidden border-border/50 hover:shadow-xl hover:border-primary/30 transition-all duration-300">
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={presentation.thumbnail}
            alt={presentation.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
              <Link href={`/present/${presentation.id}`} className="flex-1">
                <Button size="sm" className="w-full btn-accent gap-1.5">
                  <Play className="w-3.5 h-3.5" />
                  Present
                </Button>
              </Link>
              <Link href={`/editor/${presentation.id}`}>
                <Button size="sm" variant="secondary" className="gap-1.5">
                  <Edit3 className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Status badge */}
          <Badge
            className={cn(
              "absolute top-3 left-3",
              presentation.status === "published"
                ? "bg-success/90 text-success-foreground"
                : "bg-warning/90 text-warning-foreground",
            )}
          >
            {presentation.status === "published" ? "Đã xuất bản" : "Bản nháp"}
          </Badge>

          {/* Favorite */}
          {presentation.isFavorite && (
            <Star className="absolute top-3 right-3 w-5 h-5 text-warning fill-warning" />
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {presentation.title}
          </h3>

          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              {presentation.slides} slides
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {presentation.viewCount}
            </span>
            <span className="flex items-center gap-1">
              <Play className="w-3.5 h-3.5" />
              {presentation.presentCount}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {presentation.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded-md hover:bg-secondary text-muted-foreground">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-card border-border"
              >
                <DropdownMenuItem className="cursor-pointer">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Share2 className="w-4 h-4 mr-2" />
                  Chia sẻ
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Copy className="w-4 h-4 mr-2" />
                  Nhân bản
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
            <Clock className="w-3.5 h-3.5" />
            <span>Cập nhật {formatDate(presentation.updatedAt)}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function PresentationListItem({ presentation, index }: PresentationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="p-4 flex items-center gap-4 hover:shadow-md hover:border-primary/30 transition-all">
        <img
          src={presentation.thumbnail}
          alt={presentation.title}
          className="w-32 h-18 object-cover rounded-lg"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-foreground line-clamp-1">
                {presentation.title}
              </h3>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                <span>{presentation.slides} slides</span>
                <span>•</span>
                <span>{presentation.viewCount} lượt xem</span>
                <span>•</span>
                <span>Cập nhật {formatDate(presentation.updatedAt)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                className={cn(
                  presentation.status === "published"
                    ? "bg-success/10 text-success border-0"
                    : "bg-warning/10 text-warning border-0",
                )}
              >
                {presentation.status === "published"
                  ? "Đã xuất bản"
                  : "Bản nháp"}
              </Badge>
              {presentation.isFavorite && (
                <Star className="w-4 h-4 text-warning fill-warning" />
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/present/${presentation.id}`}>
            <Button size="sm" className="btn-accent gap-1.5">
              <Play className="w-3.5 h-3.5" />
              Present
            </Button>
          </Link>
          <Link href={`/editor/${presentation.id}`}>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Edit3 className="w-3.5 h-3.5" />
              Sửa
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border">
              <DropdownMenuItem>
                <Share2 className="w-4 h-4 mr-2" />
                Chia sẻ
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="w-4 h-4 mr-2" />
                Nhân bản
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    </motion.div>
  );
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Hôm nay";
  if (days === 1) return "Hôm qua";
  if (days < 7) return `${days} ngày trước`;

  return date.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "short",
  });
}
