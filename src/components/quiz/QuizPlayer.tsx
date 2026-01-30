import React, { useState, useEffect, useCallback, useRef } from "react";
import GameOneQuestionRenderer from "./game-ported/GameOneQuestionRenderer";
import { normalizeGameQuestion } from "@/lib/normalize-question";
import { useQuizSocket } from "@/hooks/use-quiz-socket";
import { cn } from "@/lib/utils";
import { GameQuestion } from "./game-ported/GameQuizRenderer";
import { List, X, Zap, Check, Trophy, ChevronLeft, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useConfetti } from "@/hooks/useConfetti";

type QuizPlayerProps = {
  deckId: string;
  slideId: string;
  initialQuestion?: GameQuestion | GameQuestion[];
  currentUser?: { id: string; name: string };
  timeLimit?: number;
  embedded?: boolean;
};

const QuizPlayer = ({
  deckId,
  slideId,
  initialQuestion,
  currentUser,
  embedded = false,
}: QuizPlayerProps) => {
  // Handle anonymous guest ID
  const [guestId] = useState(() => {
    if (typeof window !== "undefined") {
      let id = localStorage.getItem("quiz_guest_id");
      if (!id) {
        id = `guest_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem("quiz_guest_id", id);
      }
      return id;
    }
    return "guest_generic";
  });

  const attendeeId = currentUser?.id || guestId;

  // Determine initial question (single or array)
  const firstQuestion = Array.isArray(initialQuestion)
    ? initialQuestion[0]
    : initialQuestion;

  // IMPORTANT: Normalize initial question in case it comes from raw API/SSR data
  const [question, setQuestion] = useState<GameQuestion | null>(
    firstQuestion ? normalizeGameQuestion(firstQuestion) : null,
  );

  // If initialQuestion changes (e.g. from parent prop update), update local state
  useEffect(() => {
    const first = Array.isArray(initialQuestion)
      ? initialQuestion[0]
      : initialQuestion;
    if (first) {
      console.log("[QuizPlayer] New initialQuestion received:", first);
      setQuestion(normalizeGameQuestion(first));
    }
  }, [initialQuestion]);

  const [quizStatus, setQuizStatus] = useState<
    "IDLE" | "ACTIVE" | "STOPPED" | "REVIEW"
  >("IDLE");
  const [myAnswer, setMyAnswer] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isTocOpen, setIsTocOpen] = useState(true);
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // Gamification hooks
  const { play: playSound } = useSoundEffects();
  const { celebrate } = useConfetti();

  // Handle Socket Events
  const onQuizStarted = useCallback((data: any) => {
    console.log("Quiz Started", data);
    setQuizStatus("ACTIVE");
    setMyAnswer(null);
    setResults(null);
    if (data.questions && Array.isArray(data.questions)) {
      setTotalQuestions(data.questions.length);
      // Normalize question data
      setQuestion(normalizeGameQuestion(data.questions[0]));
      setQuestionIndex(0);
    }
  }, []);

  const onSyncQuestion = useCallback((data: any) => {
    console.log("Sync Question", data);
    // Normalize question data
    setQuestion(normalizeGameQuestion(data.question));
    setQuestionIndex(data.index);
    setTotalQuestions(data.total_questions || 0); // Update total if available
    setMyAnswer(null);
    setResults(null);
    setQuizStatus("ACTIVE");
  }, []);

  const onQuizStopped = useCallback((data: any) => {
    console.log("Quiz Stopped", data);
    setQuizStatus("STOPPED");
  }, []);

  const onStatsUpdate = useCallback((data: any) => {
    console.log("Stats Update", data);
  }, []);

  const onLeaderboardUpdate = useCallback((data: any) => {
    console.log("Leaderboard Update", data);
    if (data.leaderboard) {
      setLeaderboard(data.leaderboard);
    }
  }, []);

  const onAnswerAccepted = useCallback(
    (data: any) => {
      console.log("Answer Accepted", data);

      // Only process if this result belongs to me
      if (data.attendee_id && data.attendee_id !== attendeeId) {
        return;
      }

      setResults(data);

      // Play sounds and effects
      if (data.is_correct) {
        playSound("correct");
        if ((data.streak || 0) >= 3) {
          playSound("streak");
          celebrate("streak");
        } else {
          celebrate("correct");
        }
      } else {
        playSound("wrong");
      }
    },
    [playSound, celebrate, attendeeId],
  );

  const socket = useQuizSocket({
    deckId,
    slideId,
    attendeeId: attendeeId,
    onQuizStarted,
    onSyncQuestion,
    onQuizStopped,
    onStatsUpdate,
    onLeaderboardUpdate,
    onAnswerAccepted,
  });

  const [draftAnswer, setDraftAnswer] = useState<any>(null);

  // Reset draft answer when question changes
  useEffect(() => {
    setDraftAnswer(null);
  }, [question?.id]);

  const handleDraftContentChange = (answer: any[]) => {
    setDraftAnswer(answer);
  };

  const handleConfirmSubmit = () => {
    if (quizStatus !== "ACTIVE" || !draftAnswer) return;
    setMyAnswer(draftAnswer);

    // Construct payload matching backend expectation
    const payload = {
      element_id: slideId, // Use slideId as element context
      question_id: question?.id,
      choice_ids: draftAnswer,
      time_taken: 0, // TODO: Implement timer tracking
    };

    console.log("[QuizPlayer] Submitting answer:", payload);
    socket.submitAnswer(payload);
  };

  if (!question && quizStatus !== "STOPPED") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center h-full text-white",
          embedded && "text-slate-700 dark:text-slate-200",
        )}
      >
        <div className="text-xl">Waiting for quiz to start...</div>
      </div>
    );
  }

  // Quiz Stopped / Finished View
  if (quizStatus === "STOPPED") {
    return (
      <div /* ... existing stopped view ... */
        className={cn(
          "flex flex-col items-center justify-center gap-6 p-8",
          embedded
            ? "h-full w-full bg-slate-50 dark:bg-slate-900"
            : "min-h-screen bg-slate-900 text-white",
        )}
      >
        <Trophy
          className={cn(
            "w-20 h-20 animate-bounce",
            embedded ? "text-yellow-500" : "text-yellow-400",
          )}
        />
        <h2
          className={cn(
            "text-3xl font-bold",
            embedded && "text-slate-800 dark:text-white",
          )}
        >
          Quiz Finished!
        </h2>
        <div
          className={cn(
            "rounded-xl p-6 w-full max-w-md",
            embedded
              ? "bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700"
              : "bg-white/10 backdrop-blur-xl",
          )}
        >
          <h3
            className={cn(
              "text-lg font-semibold mb-4 text-center",
              embedded && "text-slate-700 dark:text-slate-200",
            )}
          >
            Leaderboard
          </h3>
          <div className="space-y-2">
            {leaderboard.slice(0, 5).map((entry, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center justify-between p-2 rounded",
                  embedded
                    ? "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white"
                    : "bg-white/5",
                )}
              >
                <span className="font-bold text-yellow-500">#{i + 1}</span>
                <span>{entry.name || "Player"}</span>
                <span>{Math.round(entry.score)} pts</span>
              </div>
            ))}
            {leaderboard.length === 0 && (
              <p className="text-center text-gray-400">
                Waiting for final results...
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Removed blocking result overlay to allow visual feedback on question

  const isBlocked = !!myAnswer;

  return (
    <div
      className={cn(
        "flex flex-col h-full",
        embedded
          ? "bg-white dark:bg-slate-950 rounded-2xl overflow-hidden"
          : "h-screen text-white bg-slate-900",
      )}
    >
      {/* Header - Only show if NOT embedded */}
      {!embedded && (
        <header className="flex-shrink-0 h-16 bg-black/20 backdrop-blur-xl border-b border-white/10 px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl">Quiz</span>
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs font-bold flex items-center gap-1">
                <Zap className="w-3 h-3" /> LIVE
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-blue-300">
            {/* Could put timer here */}
          </div>
        </header>
      )}

      {/* Embedded Header (Optional - Maybe just question count?) */}
      {embedded && (
        <div className="h-12 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-4 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-200">
              Question {questionIndex + 1} / {totalQuestions || 1}
            </span>
            <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs font-bold">
              LIVE
            </span>
          </div>
          {/* Score or other small info could go here */}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Desktop TOC - Only show if NOT embedded */}
        {!embedded && (
          <aside
            className={cn(
              "hidden lg:flex flex-col flex-shrink-0 bg-black/20 backdrop-blur-xl border-r border-white/10 transition-all duration-300",
              isTocOpen ? "w-64" : "w-16",
            )}
          >
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              {isTocOpen && <h3 className="font-semibold">Questions</h3>}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsTocOpen(!isTocOpen)}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <List className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <div className={cn("grid gap-2", isTocOpen ? "grid-cols-4" : "")}>
                {Array.from({ length: totalQuestions || 1 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "rounded-lg overflow-hidden transition-all relative border",
                      isTocOpen ? "h-10" : "h-10 w-10 mb-2 mx-auto",
                      idx === questionIndex
                        ? "bg-blue-600 border-blue-400 text-white"
                        : "bg-white/5 border-white/10 text-gray-400",
                      "flex items-center justify-center font-bold text-sm",
                    )}
                  >
                    {idx + 1}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 relative flex flex-col overflow-hidden",
            embedded
              ? "bg-slate-50 dark:bg-slate-950"
              : "bg-[url('/images/game-background.png')] bg-cover bg-center",
          )}
        >
          {!embedded && (
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
          )}

          {/* Question Counter (Mobile) - Only if not embedded (embedded has its own header) */}
          {!embedded && (
            <div className="lg:hidden absolute top-4 left-4 z-10">
              <Button
                variant="secondary"
                size="sm"
                className="bg-black/40 text-white border border-white/20 backdrop-blur"
                onClick={() => setIsMobileTocOpen(true)}
              >
                <List className="w-4 h-4 mr-2" />
                {questionIndex + 1} / {totalQuestions}
              </Button>
            </div>
          )}

          <div className="relative z-10 flex-1 flex flex-col p-4 md:p-8 justify-center overflow-y-auto">
            <GameOneQuestionRenderer
              question={question!}
              onAnswer={handleDraftContentChange}
              disabled={isBlocked}
              externalAnswers={isBlocked ? myAnswer : draftAnswer}
              isCorrect={results?.is_correct}
            />
          </div>

          {/* New Sticky Footer with Submit Button */}
          <div
            className={cn(
              "relative z-20 p-4 border-t flex justify-end items-center gap-4",
              embedded
                ? "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800"
                : "bg-black/40 backdrop-blur border-white/10",
            )}
          >
            <div
              className={cn(
                "mr-auto font-medium",
                embedded ? "text-slate-600 dark:text-slate-300" : "text-white",
              )}
            >
              {results ? (
                <div
                  className={cn(
                    "flex items-center gap-2",
                    results.is_correct ? "text-emerald-500" : "text-red-500",
                  )}
                >
                  {results.is_correct ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <X className="w-5 h-5" />
                  )}
                  {results.is_correct
                    ? "Correct! +" + Math.round(results.points)
                    : "Incorrect"}
                </div>
              ) : isBlocked ? (
                "Answer submitted..."
              ) : draftAnswer?.length > 0 ? (
                "Answer selected"
              ) : (
                "Please select an answer"
              )}
            </div>

            <Button
              size="lg"
              onClick={handleConfirmSubmit}
              disabled={isBlocked || !draftAnswer || draftAnswer.length === 0}
              className={cn(
                "min-w-[150px] font-bold text-lg transition-all",
                isBlocked ? "opacity-50 cursor-not-allowed" : "",
                embedded
                  ? "bg-primary hover:bg-primary/90"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white",
                results?.is_correct ? "bg-emerald-600 text-white" : "",
                results?.is_correct === false ? "bg-red-600 text-white" : "",
              )}
            >
              {results
                ? results.is_correct
                  ? "Awesome!"
                  : "Try Next"
                : isBlocked
                  ? "Submitted"
                  : "Submit Answer"}
            </Button>
          </div>

          {/* Mobile TOC Drawer - Only if not embedded */}
          {isMobileTocOpen && !embedded && (
            <div
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileTocOpen(false)}
            >
              <div className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 border-r border-white/10 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-white">Questions</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileTocOpen(false)}
                  >
                    <X className="w-5 h-5 text-white" />
                  </Button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: totalQuestions || 1 }).map((_, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "h-10 rounded flex items-center justify-center font-bold text-sm border",
                        idx === questionIndex
                          ? "bg-blue-600 border-blue-400 text-white"
                          : "bg-white/5 border-white/10 text-gray-400",
                      )}
                    >
                      {idx + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Answer Submitted Notification */}
      {myAnswer && !results && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 z-40">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Answer submitted! Waiting for results...
        </div>
      )}
    </div>
  );
};

export default QuizPlayer;
