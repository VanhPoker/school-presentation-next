"use client";

import { use, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Users,
  Trophy,
  BadgeCheck,
  Clock,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SlideElementRenderer } from "@/components/slide/SlideElementRenderer";
import QuizPlayer from "@/components/quiz/QuizPlayer";

import { useLiveSession, SlideElement } from "@/hooks/use-live-session";

interface LivePlayerPageProps {
  params: Promise<{ joinCode: string }>;
}

export default function LivePlayerPage({ params }: LivePlayerPageProps) {
  const { joinCode } = use(params);
  const router = useRouter();

  const {
    viewState,
    isLoading,
    error,
    session,
    attendee,
    slides,
    currentSlideIndex,
    joinSession,
    leaderboard,
    quizState, // Need to expose this from hook
  } = useLiveSession(joinCode);

  // Local state for Join Form
  const [displayName, setDisplayName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("😊");
  const emojis = ["😊", "🎓", "🚀", "🌟", "💡", "🔥", "🎯", "🏆", "💪", "🎉"];

  // Helper to render slide elements (adapted from Studio)
  const renderSlideElement = (element: SlideElement) => {
    // Normalize coordinates
    const isNormalized = element.width <= 2 && element.height <= 2;
    const factor = isNormalized ? 100 : 1;

    const style: React.CSSProperties = {
      position: "absolute",
      left: `${element.x * factor}%`,
      top: `${element.y * factor}%`,
      width: `${element.width * factor}%`,
      height: `${element.height * factor}%`,
      ...element.style,
    };

    if (element.type === "interactive") {
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
    }

    // For other types, use the shared renderer or simple fallbacks to be safe
    return (
      <div key={element.id} style={{ ...style, zIndex: 10 }}>
        <SlideElementRenderer element={element as any} isPresenting={true} />
      </div>
    );
  };

  // 1. Join View
  if (viewState === "join") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              🎯 Tham gia phiên trình bày
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mã tham gia</label>
              <div className="text-center text-2xl tracking-widest font-mono font-bold bg-muted p-2 rounded">
                {joinCode}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tên hiển thị</label>
              <Input
                placeholder="Nhập tên của bạn..."
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={20}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Chọn avatar</label>
              <div className="flex flex-wrap gap-2 justify-center">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`text-3xl p-2 rounded-lg transition-all ${
                      selectedEmoji === emoji
                        ? "bg-purple-100 ring-2 ring-purple-500 scale-110"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <Button
              onClick={() => joinSession(displayName, selectedEmoji)}
              className="w-full h-12 text-lg"
              disabled={isLoading || !displayName.trim()}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                "Tham gia ngay 🚀"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 2. Waiting Room
  if (viewState === "waiting") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 via-teal-500 to-blue-600 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl mb-8">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">{attendee?.avatar_emoji}</div>
            <h2 className="text-2xl font-bold mb-2">
              {attendee?.display_name}
            </h2>
            <p className="text-gray-500 mb-6">Bạn đã tham gia phiên!</p>
            <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
              <Clock className="w-5 h-5 animate-pulse" />
              <span>Đang chờ giáo viên bắt đầu...</span>
            </div>

            {/* Session Code Info */}
            <div className="bg-gray-100 rounded-lg p-4 mt-4">
              <p className="text-sm text-gray-500">Mã phiên</p>
              <p className="text-2xl font-mono font-bold tracking-widest">
                {joinCode}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mini Leaderboard could go here similar to Studio */}

        <Button
          variant="ghost"
          className="text-white hover:bg-white/20"
          onClick={() => router.push("/")}
        >
          Rời phiên
        </Button>
      </div>
    );
  }

  // 3. Presenting View
  if (viewState === "presenting") {
    const currentSlide = slides[currentSlideIndex];

    // If this is a Quiz Slide and Quiz is ACTIVE, we override the content with the embedded player
    const isQuizActive = quizState?.status === "active" && quizState.elementId;
    const activeQuestion = isQuizActive
      ? quizState.currentQuestion ||
        (Array.isArray(quizState.questionData) &&
        quizState.questionData.length > 0
          ? quizState.questionData[quizState.currentQuestionIdx || 0]
          : quizState.questionData)
      : null;

    // Standard Slide View (with potential embedded quiz)

    // Otherwise render standard slide
    return (
      <div className="h-screen flex flex-col bg-slate-900">
        {/* Top Bar */}
        <header className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Badge className="bg-green-500 text-white">LIVE</Badge>
            <span className="text-white font-medium">
              {attendee?.avatar_emoji} {attendee?.display_name}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">
              Slide {currentSlideIndex + 1}/{slides.length}
            </Badge>
            <div className="flex items-center gap-2 text-slate-300">
              <Users className="w-4 h-4" />
              <span>{session?.participant_count || 0} online</span>
            </div>
          </div>
        </header>

        {/* Slide Display */}
        <div className="flex-1 p-4 md:p-8 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlideIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-5xl aspect-[16/9] bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              {currentSlide ? (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={
                    typeof currentSlide.style?.background === "string"
                      ? { background: currentSlide.style.background }
                      : currentSlide.style?.background || {}
                  }
                >
                  {/* Elements */}
                  {currentSlide.elements?.map((el) => renderSlideElement(el))}

                  {/* Embedded Quiz Player Overlay */}
                  {isQuizActive && activeQuestion && (
                    <div className="absolute inset-0 z-50 bg-white dark:bg-slate-900">
                      <QuizPlayer
                        deckId={session?.deck_id || ""}
                        slideId={currentSlide?.id || ""}
                        currentUser={{
                          name: attendee?.display_name || "Guest",
                          id: attendee?.id || "guest",
                        }}
                        initialQuestion={activeQuestion}
                        embedded={true}
                      />
                    </div>
                  )}

                  {/* Waiting Screen for Quiz (Idle) */}
                  {(() => {
                    const quizEl = currentSlide.elements?.find(
                      (e) => e.type === "quiz" || e.type === "exam",
                    );
                    if (quizEl && !isQuizActive) {
                      return (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white z-20">
                          <div className="text-center">
                            <Zap className="w-16 h-16 mx-auto mb-4 text-yellow-400 animate-pulse" />
                            <h2 className="text-3xl font-bold mb-2">
                              Quiz Time!
                            </h2>
                            <p className="text-xl opacity-80">
                              Waiting for teacher to start...
                            </p>
                          </div>
                        </div>
                      );
                    }
                  })()}
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Bar Indicators */}
        <div className="h-16 bg-slate-800 border-t border-slate-700 flex items-center justify-center gap-2 px-4">
          {slides.map((_, idx) => (
            <div
              key={idx}
              className={`w-3 h-3 rounded-full transition-all ${
                idx === currentSlideIndex
                  ? "bg-purple-500 scale-125"
                  : idx < currentSlideIndex
                    ? "bg-slate-500"
                    : "bg-slate-600"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  // 4. Leaderboard / Ended Logic (Simple Port)
  if (viewState === "leaderboard" || viewState === "ended") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold text-white mb-8">🏆 Bảng xếp hạng</h1>
        <Card className="w-full max-w-lg">
          <CardContent className="p-6">
            <p className="text-center text-gray-500">
              {viewState === "ended" ? "Phiên đã kết thúc" : "Kết quả"}
            </p>
            {/* Leaderboard Rendering */}
            {leaderboard.map((entry, idx) => (
              <div key={idx} className="flex justify-between py-2 border-b">
                <span>
                  #{entry.rank} {entry.display_name}
                </span>
                <span>{entry.total_score} pts</span>
              </div>
            ))}
            <Button className="w-full mt-4" onClick={() => router.push("/")}>
              Quay về trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
