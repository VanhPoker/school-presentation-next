import { useEffect, useRef, useState, useCallback } from "react";

// Define events matching Backend constants
export const SOCKET_EVENTS = {
  QUIZ: {
    JOIN_ROOM: "JOIN_SESSION",
    START: "START_QUIZ",
    STOP: "STOP_QUIZ",
    SUBMIT: "SUBMIT_ANSWER",
    NEXT_QUESTION: "NEXT_QUESTION", // If backend supports it
    BROADCAST_START: "QUIZ_STARTED",
    BROADCAST_NEXT: "SYNC_QUESTION", // or SYNC_SLIDE if that's what moves it
    BROADCAST_STOP: "QUIZ_ENDED",
    BROADCAST_STATS: "LIVE_STATS_UPDATE",
    BROADCAST_LEADERBOARD: "LEADERBOARD_UPDATE",
  },
};

type QuizSocketOptions = {
  url?: string;
  slideId: string;
  deckId: string;
  attendeeId?: string; // Add attendeeId for identification
  onQuizStarted?: (data: any) => void;
  onSyncQuestion?: (data: any) => void;
  onQuizStopped?: (data: any) => void;
  onStatsUpdate?: (data: any) => void;
  onLeaderboardUpdate?: (data: any) => void;
  onAnswerAccepted?: (data: any) => void; // New handler for immediate feedback
};

export const useQuizSocket = ({
  slideId,
  deckId,
  attendeeId,
  onQuizStarted,
  onSyncQuestion,
  onQuizStopped,
  onStatsUpdate,
  onLeaderboardUpdate,
  onAnswerAccepted,
}: QuizSocketOptions) => {
  const socketRef = useRef<{ emit: (event: string, data: any) => void } | null>(
    null,
  );
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only connect if we have essential data
    if (!slideId || !deckId) return;

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080/ws";

    // Append attendeeId to query params for identification
    const wsUrl = `${socketUrl.replace("http", "ws")}/slides?deck_id=${deckId}&slide_id=${slideId}&attendee_id=${attendeeId || "anonymous"}`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to Quiz WS");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        // Backend sends { event: "EVENT_NAME", data: {} }
        const { event: eventName, data } = msg;

        switch (eventName) {
          case SOCKET_EVENTS.QUIZ.BROADCAST_START:
            onQuizStarted?.(data);
            break;
          case SOCKET_EVENTS.QUIZ.BROADCAST_NEXT:
            onSyncQuestion?.(data);
            break;
          case SOCKET_EVENTS.QUIZ.BROADCAST_STOP:
            onQuizStopped?.(data);
            break;
          case SOCKET_EVENTS.QUIZ.BROADCAST_STATS:
            onStatsUpdate?.(data);
            break;
          case SOCKET_EVENTS.QUIZ.BROADCAST_LEADERBOARD:
            onLeaderboardUpdate?.(data);
            break;
          case "ANSWER_ACCEPTED":
            onAnswerAccepted?.(data);
            break;
          default:
            // console.log("Unhandled WS event:", eventName, data);
            break;
        }
      } catch (e) {
        console.error("WS Message Parse Error", e);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = (e) => {
      console.error("WS Error", e);
    };

    // Store standard interface for "emit"
    socketRef.current = {
      emit: (event: string, data: any) => {
        if (ws.readyState === WebSocket.OPEN) {
          // Backend expects { event: "...", data: ... }
          ws.send(JSON.stringify({ event: event, data: data }));
        }
      },
    };

    return () => {
      ws.close();
    };
  }, [slideId, deckId, attendeeId]); // Re-connect if these change

  const startQuiz = useCallback((payload: any = {}) => {
    socketRef.current?.emit(SOCKET_EVENTS.QUIZ.START, payload);
  }, []);

  const nextQuestion = useCallback(() => {
    socketRef.current?.emit(SOCKET_EVENTS.QUIZ.NEXT_QUESTION, {});
  }, []);

  const submitAnswer = useCallback((answer: any) => {
    socketRef.current?.emit(SOCKET_EVENTS.QUIZ.SUBMIT, answer);
  }, []);

  return {
    isConnected,
    startQuiz,
    nextQuestion,
    submitAnswer,
  };
};
