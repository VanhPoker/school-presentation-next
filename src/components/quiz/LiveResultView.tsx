import React, { useState, useEffect, useMemo } from "react";
import { useQuizSocket } from "@/hooks/use-quiz-socket";
import { useSessionData } from "@/hooks/useSessionData";
import {
  Play,
  Pause,
  Plus,
  RotateCcw,
  StopCircle,
  Users,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// --- Components adapted from GameQuestionReport/TeacherControlPage ---

// Simple Donut Chart (SVG)
const DonutChart = ({
  correct,
  incorrect,
  total,
}: {
  correct: number;
  incorrect: number;
  total: number;
}) => {
  const radius = 15.5;
  const circumference = 2 * Math.PI * radius;
  const correctPercent = total > 0 ? correct / total : 0;
  const incorrectPercent = total > 0 ? incorrect / total : 0;

  const correctDash = correctPercent * circumference;
  const incorrectDash = incorrectPercent * circumference;

  return (
    <div className="relative w-32 h-32 mx-auto mb-4">
      <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="#374151"
          strokeWidth="3"
        />
        {/* Correct (green) */}
        {correct > 0 && (
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke="#22c55e"
            strokeWidth="3"
            strokeDasharray={`${correctDash} ${circumference}`}
            className="transition-all duration-500"
          />
        )}
        {/* Incorrect (red) */}
        {incorrect > 0 && (
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke="#ef4444"
            strokeWidth="3"
            strokeDasharray={`${incorrectDash} ${circumference}`}
            strokeDashoffset={-correctDash}
            className="transition-all duration-500"
          />
        )}
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-2xl font-bold text-white">
          {total > 0 ? Math.round(correctPercent * 100) : 0}%
        </div>
        <div className="text-xs text-gray-400">Accuracy</div>
      </div>
    </div>
  );
};

const LiveResultView = ({
  deckId,
  slideId,
  questionData,
}: {
  deckId: string;
  slideId: string;
  questionData?: any;
  onStop?: () => void;
}) => {
  const { quizState, attendees } = useSessionData({
    sessionId: deckId,
    enabled: false,
  });

  // We use useQuizSocket for controls
  const { startQuiz, nextQuestion } = useQuizSocket({
    deckId,
    slideId,
  });

  const [activeTab, setActiveTab] = useState<"question" | "responses">(
    "responses",
  );

  // Mock/Derived Stats from quizState
  // In a real implementation with rich stats, these would come from the socket/quizState.stats
  const submittedCount = quizState?.stats?.submitted_count || 0;
  // const totalParticipants = quizState?.stats?.total_participants || 0;
  // Use attendees list for more accurate "total players" if available
  const totalPlayers = attendees?.length || 0;
  const attemptingCount = Math.max(0, totalPlayers - submittedCount);

  // Mock answer distribution since backend doesn't send it yet
  // We'll show 0 for now or random for demo if strictly needed, but let's stick to 0 to be "honest" UI
  const answerStats = {
    correctCount: 0,
    incorrectCount: 0,
    distribution: {} as Record<string, number>,
  };

  // Timer Logic
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    // If quiz is active, we might want to countdown from duration
    // But we don't strictly know when it started unless we track it
    // For now, let's just show a static or simple elapsed time if we don't have deadline
    // If questionData has timeLimit, we could use that.
    if (questionData?.timeLimit) {
      setTimeRemaining(questionData.timeLimit);
    }
  }, [questionData]);

  // Handle local countdown for visual effect only
  useEffect(() => {
    if (quizState?.status !== "active" || timeRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [quizState?.status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex h-full w-full bg-[#1a1a2e] text-white overflow-hidden rounded-xl shadow-2xl border border-white/10">
      {/* Left Panel - Content (70%) */}
      <div className="w-[70%] p-6 flex flex-col border-r border-white/10 bg-black/20">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("question")}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-colors",
              activeTab === "question"
                ? "bg-indigo-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700",
            )}
          >
            Question
          </button>
          <button
            onClick={() => setActiveTab("responses")}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-colors",
              activeTab === "responses"
                ? "bg-indigo-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700",
            )}
          >
            Responses
          </button>
        </div>

        {activeTab === "question" ? (
          <div className="flex-1 bg-white rounded-xl p-8 text-gray-900 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {questionData?.title || "Quiz Question"}
            </h2>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{
                __html:
                  questionData?.question?.content ||
                  questionData?.content ||
                  "No content",
              }}
            />

            {/* Choices Preview */}
            <div className="mt-8 grid gap-4">
              {questionData?.question?.choices?.map(
                (choice: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 border rounded-lg bg-gray-50 flex gap-4 items-center"
                  >
                    <span className="font-bold text-gray-500">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <div dangerouslySetInnerHTML={{ __html: choice.content }} />
                  </div>
                ),
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-600/20 rounded-lg p-4 text-center border border-green-500/20">
                <div className="text-3xl font-bold text-green-500">
                  {submittedCount}
                </div>
                <div className="text-sm text-gray-400">Submitted</div>
              </div>
              <div className="bg-yellow-600/20 rounded-lg p-4 text-center border border-yellow-500/20">
                <div className="text-3xl font-bold text-yellow-500">
                  {attemptingCount}
                </div>
                <div className="text-sm text-gray-400">Answering</div>
              </div>
              <div className="bg-gray-600/20 rounded-lg p-4 text-center border border-gray-500/20">
                <div className="text-3xl font-bold text-gray-400">0</div>
                <div className="text-sm text-gray-400">Not Started</div>
              </div>
            </div>

            {/* Charts Area */}
            <div className="flex-1 bg-gray-800/50 rounded-xl p-6 flex gap-8 items-start">
              {/* Left: Donut */}
              <div className="w-1/3 flex flex-col items-center">
                <DonutChart
                  correct={answerStats.correctCount}
                  incorrect={answerStats.incorrectCount}
                  total={submittedCount} // Use submitted count as base
                />
                <div className="w-full space-y-2 text-sm mt-4">
                  <div className="flex justify-between">
                    <span className="flex items-center gap-2 text-green-400">
                      <CheckCircle2 size={16} /> Correct
                    </span>
                    <span className="font-bold">
                      {answerStats.correctCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-2 text-red-400">
                      <Users size={16} /> Incorrect
                    </span>
                    <span className="font-bold">
                      {answerStats.incorrectCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Answer Distribution List */}
              <div className="flex-1 space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {questionData?.question?.choices?.map(
                  (choice: any, idx: number) => {
                    const count = answerStats.distribution[choice.id] || 0;
                    const percent =
                      submittedCount > 0 ? (count / submittedCount) * 100 : 0;

                    return (
                      <div key={choice.id} className="relative group">
                        {/* Bar Background */}
                        <div className="absolute inset-0 bg-gray-700/30 rounded-lg overflow-hidden">
                          <div
                            className="h-full bg-indigo-500/20 transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        {/* Content */}
                        <div className="relative p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 flex items-center justify-center rounded bg-gray-800 font-bold border border-white/10">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span
                              className="text-sm text-gray-200 line-clamp-1"
                              dangerouslySetInnerHTML={{
                                __html: choice.content,
                              }}
                            />
                          </div>
                          <span className="font-bold text-white">{count}</span>
                        </div>
                      </div>
                    );
                  },
                )}
                {(!questionData?.question?.choices ||
                  questionData?.question?.choices.length === 0) && (
                  <div className="text-center text-gray-500 mt-10">
                    No choices data available
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Controls (30%) */}
      <div className="w-[30%] bg-gray-900/50 p-6 flex flex-col border-l border-white/5">
        {/* Timer */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6 text-center border border-white/5 shadow-inner">
          <div className="text-5xl font-mono font-bold text-white mb-2 tracking-wider">
            {formatTime(timeRemaining)}
          </div>
          <div className="text-sm text-gray-400">Remaining Time</div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <Button
              onClick={() => {}}
              variant="outline"
              className="bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
            >
              <Pause className="w-4 h-4 mr-2" /> Pause
            </Button>
            <Button
              onClick={() => {}}
              variant="outline"
              className="bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" /> +15s
            </Button>
            <Button
              onClick={() => onStop?.()}
              variant="outline"
              className="col-span-2 bg-red-900/50 border-red-800 text-red-200 hover:bg-red-900/70"
            >
              <StopCircle className="w-4 h-4 mr-2" /> End Quiz
            </Button>
          </div>
        </div>

        {/* Player List */}
        <div className="flex-1 bg-gray-800/50 rounded-xl p-4 flex flex-col overflow-hidden border border-white/5">
          <h3 className="font-bold text-gray-300 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" /> Players ({attendees?.length || 0})
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {attendees?.map((player: any) => (
              <div
                key={player.id}
                className="flex items-center justify-between bg-gray-700/30 p-2 rounded-lg border border-white/5"
              >
                <div className="flex items-center gap-2">
                  {/* Avatar placeholder */}
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs">
                    {player.name?.[0] || "?"}
                  </div>
                  <span className="text-sm font-medium">{player.name}</span>
                </div>
                <span className="text-xs text-gray-500">Joined</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveResultView;
