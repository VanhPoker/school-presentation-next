"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Components
import LiveResultView from "@/components/quiz/LiveResultView";
import QuizPlayer from "@/components/quiz/QuizPlayer";
import PresenterQuizControl from "@/components/quiz/PresenterQuizControl";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Icons
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize,
  Minimize,
  Users,
  BarChart3,
  X,
  Timer,
  Zap,
  Eye,
  TrendingUp,
  CheckCircle,
  HelpCircle,
} from "lucide-react";

// Hooks
import { useSessionData } from "@/hooks/useSessionData";

// API Config
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// --- Mock Data (Fallback) ---
const mockSlides = Array.from({ length: 8 }, (_, i) => ({
  id: `slide-${i + 1}`,
  index: i,
  title: i === 0 ? "Tiêu đề bài giảng" : `Nội dung ${i}`,
  hasQuiz: i === 2 || i === 5,
  hasPoll: i === 4,
}));

const mockQuizResults = {
  question: "Trong hình học không gian, hai mặt phẳng song song là gì?",
  options: [
    {
      id: "A",
      text: "Hai mặt phẳng có chung một đường thẳng",
      votes: 2,
      isCorrect: false,
    },
    {
      id: "B",
      text: "Hai mặt phẳng không có điểm chung",
      votes: 18,
      isCorrect: true,
    },
    {
      id: "C",
      text: "Hai mặt phẳng vuông góc với nhau",
      votes: 3,
      isCorrect: false,
    },
    {
      id: "D",
      text: "Hai mặt phẳng có chung một điểm",
      votes: 2,
      isCorrect: false,
    },
  ],
  totalResponses: 25,
  avgTime: 12.5,
};

export default function PresenterPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Handle ID param from Next.js (could be 'id' or 'joinCode' depending on route, assuming 'id' from file path)
  const routeId = params?.id as string;
  // If ?session=... is used (Studio style), fallback to it
  const sessionId = searchParams.get("session") || routeId;

  // Real session data from API
  const {
    attendees,
    session,
    leaderboard,
    isLoading: sessionLoading,
    sendMessage,
    slides,
    quizState,
  } = useSessionData({
    sessionId,
    pollInterval: 3000,
    enabled: !!sessionId,
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer
  useEffect(() => {
    if (!isPaused) {
      const timer = setInterval(() => setElapsedTime((t) => t + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [isPaused]);

  // Sync slide change to BE
  const updateCurrentSlide = async (newIndex: number) => {
    if (!session?.id) return;

    // Optimistic update
    setCurrentSlide(newIndex);

    // Send WS Action
    sendMessage("GO_TO_SLIDE", { slide_index: newIndex });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const nextSlide = () => {
    const max = slides.length > 0 ? slides.length - 1 : mockSlides.length - 1;
    if (currentSlide < max) {
      updateCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      updateCurrentSlide(currentSlide - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide, slides]); // Added deps

  // Helper to render elements (Inline from Studio)
  const renderElement = (element: any) => {
    const isNormalized = element.width <= 2 && element.height <= 2;
    const factor = isNormalized ? 100 : 1;

    const style: React.CSSProperties = {
      position: "absolute",
      left: `${element.x * factor}%`,
      top: `${element.y * factor}%`,
      width: `${element.width * factor}%`,
      height: `${element.height * factor}%`,
      ...element.style,
      zIndex: element.layer_order,
    };

    switch (element.type) {
      case "text":
        return (
          <div
            key={element.id}
            style={style}
            className="flex items-center justify-center p-2 overflow-hidden"
            dangerouslySetInnerHTML={{ __html: element.content || "" }}
          />
        );
      case "image":
        const imgSrc =
          typeof element.content === "object" && element.content !== null
            ? (element.content as any).url || (element.content as any).src
            : element.content;
        return (
          <img
            key={element.id}
            src={imgSrc}
            alt="Slide element"
            style={{ ...style, objectFit: "contain" }}
          />
        );
      case "video":
        const videoSrc =
          typeof element.content === "object" && element.content !== null
            ? (element.content as any).url || (element.content as any).src
            : element.content;
        return (
          <video
            key={element.id}
            src={videoSrc}
            style={{ ...style, objectFit: "contain" }}
            controls
          />
        );
      case "interactive":
        const interactiveUrl =
          typeof element.content === "object" && element.content !== null
            ? (element.content as any).url
            : element.content;
        return (
          <iframe
            key={element.id}
            src={interactiveUrl}
            style={{ ...style, border: "none" }}
            title="Interactive Content"
            allowFullScreen
          />
        );
      case "shape":
        return <div key={element.id} style={{ ...style }} />;
      default:
        return null;
    }
  };

  const activeSlides = slides.length > 0 ? slides : mockSlides;
  const currentSlideData = activeSlides[currentSlide];

  return (
    <div className="h-screen flex bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100">
      {/* Main Presentation Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Control Bar */}
        <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
                Thoát
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <div className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded animate-pulse">
              LIVE
            </div>
            <span className="text-slate-500 dark:text-slate-400 text-sm">
              <Timer className="w-4 h-4 inline mr-1" />
              {formatTime(elapsedTime)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
              <Users className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {sessionId ? attendees.length : 0} /{" "}
                {session?.max_participants || 50} online
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={cn(
                "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
                showAnalytics && "bg-slate-100 dark:bg-slate-800",
              )}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPaused(!isPaused)}
              className="text-slate-600 dark:text-slate-300"
            >
              {isPaused ? (
                <Play className="w-4 h-4" />
              ) : (
                <Pause className="w-4 h-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-slate-600 dark:text-slate-300"
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </Button>
          </div>
        </header>

        {/* Slide Display */}
        <div className="flex-1 p-6 flex items-center justify-center bg-slate-100 dark:bg-slate-950">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="relative w-full max-w-5xl aspect-[16/9] bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Slide Content */}
            {activeSlides.length > 0 && currentSlideData ? (
              <div
                className="absolute inset-0 overflow-hidden"
                style={
                  typeof currentSlideData.background === "string"
                    ? { background: currentSlideData.background }
                    : (currentSlideData.background as any) || {}
                }
              >
                {currentSlideData.elements?.map((el: any) => renderElement(el))}
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                Loading...
              </div>
            )}

            {/* Teacher Quiz Control Panel - Only show if slide has a quiz */}
            {(() => {
              const quizElement = currentSlideData?.elements?.find((e: any) => {
                return e.type === "quiz" || e.type === "exam";
              });

              if (quizElement) {
                return (
                  <PresenterQuizControl
                    sessionId={sessionId}
                    deckId={session?.deck_id || ""}
                    slideId={activeSlides[currentSlide]?.id || ""}
                  />
                );
              }
              return null;
            })()}
          </motion.div>
        </div>

        {/* Bottom Navigation */}
        <div className="h-24 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevSlide}
              disabled={currentSlide === 0}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="flex gap-2 overflow-x-auto max-w-[calc(100vw-600px)] py-2">
              {activeSlides.map((s, i) => (
                <button
                  key={s.id || i}
                  onClick={() => updateCurrentSlide(i)}
                  className={cn(
                    "w-16 h-9 flex-shrink-0 rounded-lg border-2 transition-all relative overflow-hidden bg-white",
                    i === currentSlide
                      ? "border-purple-500 shadow-md ring-1 ring-purple-500"
                      : "border-slate-200 hover:border-slate-400",
                    i !== currentSlide && "opacity-70",
                  )}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
                    {i + 1}
                  </div>
                  {/* Indicators */}
                  {((s as any).hasQuiz || (s as any).hasPoll) && (
                    <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-orange-500 z-20" />
                  )}
                </button>
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={nextSlide}
              disabled={currentSlide === activeSlides.length - 1}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <Progress
              value={((currentSlide + 1) / (activeSlides.length || 1)) * 100}
              className="w-48 h-2"
            />
            <span className="text-sm text-slate-500">
              {currentSlide + 1} / {activeSlides.length}
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Sidebar */}
      <AnimatePresence>
        {showAnalytics && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 380, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col"
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Live Analytics
              </h2>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900/50">
                    <div className="flex items-center gap-2 text-green-600 mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-xs font-medium">Tham gia</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {sessionId ? attendees.length : 0}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/50">
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                      <Eye className="w-4 h-4" />
                      <span className="text-xs font-medium">Đang xem</span>
                    </div>
                    <p className="text-2xl font-bold">92%</p>
                  </div>
                </div>

                <Separator />

                {/* Mock Quiz Stats in Sidebar */}
                {activeSlides[currentSlide] &&
                  (activeSlides[currentSlide] as any).hasQuiz && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-orange-500" />
                        Kết quả Quiz
                      </h3>
                      <div className="space-y-2">
                        {mockQuizResults.options.map((opt) => (
                          <div
                            key={opt.id}
                            className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-3"
                          >
                            <span
                              className={cn(
                                "w-6 h-6 rounded flex items-center justify-center text-xs font-bold",
                                opt.isCorrect
                                  ? "bg-green-100 text-green-700"
                                  : "bg-slate-100 text-slate-700",
                              )}
                            >
                              {opt.id}
                            </span>
                            <div className="flex-1">
                              <p className="text-sm">{opt.text}</p>
                              <Progress
                                value={(opt.votes / 25) * 100}
                                className="h-1.5 mt-2"
                              />
                            </div>
                            <span className="text-xs font-bold">
                              {opt.votes}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </ScrollArea>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
