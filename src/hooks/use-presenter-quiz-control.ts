import { useState, useCallback, useEffect } from "react";
import useSessionData, { SessionData, Attendee } from "@/hooks/useSessionData";
import { normalizeGameQuestion } from "@/lib/normalize-question";

export type QuizViewMode = "overview" | "question" | "responses";

interface UsePresenterQuizControlProps {
  sessionId: string;
  deckId: string;
  slideId: string;
}

export function usePresenterQuizControl({
  sessionId,
  deckId,
  slideId,
}: UsePresenterQuizControlProps) {
  const {
    session,
    attendees,
    quizState,
    sendMessage,
    slides,
    isLoading,
    refreshAll,
  } = useSessionData({ sessionId, pollInterval: 3000 });

  const [viewMode, setViewMode] = useState<QuizViewMode>("overview");
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

  // Derived state
  const isActive = quizState?.status === "active";
  const isEnded = quizState?.status === "ended";
  const rawQuestion =
    quizState?.currentQuestion ||
    (Array.isArray(quizState?.questionData)
      ? quizState?.questionData[selectedQuestionIndex]
      : null);

  const currentQuestion = rawQuestion
    ? normalizeGameQuestion(rawQuestion)
    : null;

  const totalQuestions = quizState?.totalQuestions || 0;
  const currentQuestionIndex = quizState?.currentQuestionIdx || 0;

  // Actions
  const startQuiz = useCallback(() => {
    // Determine the element ID for the quiz on this slide
    // This requires finding the slide and then the quiz element
    const currentSlide = slides.find((s) => s.id === slideId);
    const quizElement = currentSlide?.elements?.find(
      (e: any) => e.type === "quiz" || e.type === "exam",
    );

    if (quizElement) {
      sendMessage("START_QUIZ", {
        slide_id: slideId,
        element_id: quizElement.id,
        question_data: quizElement.content, // Pass content if needed by BE
      });
    } else {
      console.error("No quiz element found on this slide");
    }
  }, [slides, slideId, sendMessage]);

  const stopQuiz = useCallback(() => {
    sendMessage("STOP_QUIZ", { slide_id: slideId });
  }, [slideId, sendMessage]);

  const nextQuestion = useCallback(() => {
    sendMessage("NEXT_QUESTION", { slide_id: slideId });
  }, [slideId, sendMessage]);

  const prevQuestion = useCallback(() => {
    sendMessage("PREVIOUS_QUESTION", { slide_id: slideId });
  }, [slideId, sendMessage]);

  const revealResults = useCallback(() => {
    sendMessage("REVEAL_RESULT", { slide_id: slideId });
  }, [slideId, sendMessage]);

  return {
    session,
    attendees,
    quizState,
    isActive,
    isEnded,
    viewMode,
    setViewMode,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    startQuiz,
    stopQuiz,
    nextQuestion,
    prevQuestion,
    revealResults,
    isLoading,
    slides,
  };
}
