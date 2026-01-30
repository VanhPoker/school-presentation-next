"use client";

import { useState, useMemo } from "react";
import {
  Play,
  Square,
  ChevronRight,
  ChevronLeft,
  Users,
  BarChart,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import GameOneQuestionRenderer from "./game-ported/GameOneQuestionRenderer";
import { usePresenterQuizControl } from "@/hooks/use-presenter-quiz-control";

interface PresenterQuizControlProps {
  sessionId: string;
  deckId: string;
  slideId: string;
}

export default function PresenterQuizControl({
  sessionId,
  deckId,
  slideId,
}: PresenterQuizControlProps) {
  const {
    session,
    attendees,
    quizState,
    isActive,
    isEnded,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    startQuiz,
    stopQuiz,
    nextQuestion,
    prevQuestion,
    // revealResults,
  } = usePresenterQuizControl({ sessionId, deckId, slideId });

  // Mock stats for now or derive from quizState.stats
  const stats = quizState?.stats || {
    submitted_count: 0,
    total_participants: attendees.length,
  };

  const submissionRate =
    stats.total_participants > 0
      ? Math.round((stats.submitted_count / stats.total_participants) * 100)
      : 0;

  // Render
  if (!quizState || (!isActive && !isEnded)) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 backdrop-blur z-50">
        <div className="text-center text-white space-y-4">
          <h2 className="text-3xl font-bold">Ready to Start Quiz?</h2>
          <p className="text-slate-300">
            {attendees.length} participants waiting
          </p>
          <Button
            size="lg"
            onClick={startQuiz}
            className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-6 rounded-xl shadow-xl shadow-indigo-600/30"
          >
            <Play className="w-6 h-6 mr-2" /> Start Quiz
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-slate-100 dark:bg-slate-900 z-40 flex overflow-hidden">
      {/* LEFT: Question Preview / Results */}
      <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-slate-800">
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-200">
              Question {currentQuestionIndex + 1} / {totalQuestions || 1}
            </span>
            {isActive && (
              <Badge
                variant="outline"
                className="bg-red-50 text-red-600 border-red-200 animate-pulse"
              >
                LIVE
              </Badge>
            )}
            {isEnded && (
              <Badge variant="outline" className="bg-slate-100 text-slate-600">
                ENDED
              </Badge>
            )}
          </div>
          <Tabs defaultValue="question">
            <TabsList className="h-8">
              <TabsTrigger value="question" className="text-xs">
                Question
              </TabsTrigger>
              <TabsTrigger value="responses" className="text-xs">
                Responses
              </TabsTrigger>
            </TabsList>
            {/* TabsContent must be outside header if we want it to take full height below */}
          </Tabs>
        </div>

        <div className="flex-1 bg-slate-50 dark:bg-slate-950 overflow-hidden relative p-4">
          <Tabs defaultValue="question" className="h-full">
            <TabsContent
              value="question"
              className="h-full m-0 data-[state=active]:flex flex-col"
            >
              {currentQuestion && (
                <div className="flex-1 flex flex-col justify-center items-center scale-90 origin-top">
                  <GameOneQuestionRenderer
                    question={currentQuestion}
                    onAnswer={() => {}} // Read-only
                    disabled={true}
                  />
                </div>
              )}
            </TabsContent>
            <TabsContent value="responses" className="h-full m-0">
              <div className="h-full flex flex-col items-center justify-center p-8">
                <div className="w-64 h-64 relative flex items-center justify-center">
                  {/* Mock Donut Chart CSS */}
                  <div
                    className="absolute inset-0 rounded-full border-[20px] border-slate-200 dark:border-slate-800"
                    style={{
                      background: `conic-gradient(#4ade80 ${submissionRate}%, transparent 0)`,
                      borderRadius: "50%",
                      maskImage: "radial-gradient(transparent 55%, black 56%)",
                      WebkitMaskImage:
                        "radial-gradient(transparent 55%, black 56%)",
                    }}
                  />
                  <div className="text-center z-10">
                    <div className="text-4xl font-bold dark:text-white">
                      {submissionRate}%
                    </div>
                    <div className="text-sm text-slate-500">Submitted</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-8 w-full max-w-md">
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="text-2xl font-bold text-indigo-600">
                      {stats.submitted_count}
                    </div>
                    <div className="text-sm text-slate-500">Total Answers</div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="text-2xl font-bold text-slate-600 dark:text-slate-300">
                      {stats.total_participants}
                    </div>
                    <div className="text-sm text-slate-500">Participants</div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* RIGHT: Controls & Leaderboard/Attendees */}
      <div className="w-96 flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
        {/* Timer Control */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 text-center">
          <div className="text-sm text-slate-500 mb-2 uppercase tracking-wider font-bold">
            Time Remaining
          </div>
          <div className="text-6xl font-mono font-bold text-slate-800 dark:text-slate-100 mb-6">
            {/* Need timer hook here. For now static or from quizState if synced */}
            --:--
          </div>
          <div className="grid grid-cols-2 gap-3">
            {isActive ? (
              <Button
                variant="destructive" // Stop
                onClick={stopQuiz}
                className="w-full"
              >
                <Square className="w-4 h-4 mr-2" /> Stop
              </Button>
            ) : (
              <Button
                variant="default" // Restart/Resume?
                onClick={startQuiz}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Play className="w-4 h-4 mr-2" /> Resume
              </Button>
            )}
            <Button
              variant="secondary" // +15s (Not implemented yet to BE)
              className="w-full"
              disabled
            >
              +15s
            </Button>
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="flex-1"
              onClick={prevQuestion}
              disabled={currentQuestionIndex <= 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className="flex-[3]"
              onClick={nextQuestion}
              disabled={
                !isActive && currentQuestionIndex >= (totalQuestions || 1) - 1
              }
            >
              Next Question <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Player List */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Users className="w-4 h-4" /> Participants
            </h3>
            <span className="text-xs bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-full text-slate-600 dark:text-slate-400">
              {attendees.length}
            </span>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {attendees.map((attendee) => (
                <div
                  key={attendee.id}
                  className="flex items-center justify-between p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{attendee.avatar_emoji}</span>
                    <span className="text-sm font-medium">
                      {attendee.display_name}
                    </span>
                  </div>
                  {/* Status Indicator (Mock Logic for now) */}
                  {/* We need `playerStatuses` from BE to know real status */}
                  <div className="flex items-center gap-2">
                    {/* Placeholder status */}
                    <span className="w-2 h-2 rounded-full bg-slate-300" />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
