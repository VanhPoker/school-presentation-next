"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
// --- GraphQL Queries & Mutations ---

// API configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const GET_SESSION_BY_CODE = `
  query GetSessionByCode($code: String!) {
    getSlideSessionByCode(access_code: $code) {
      id
      deck_id
      access_code
      status
      quiz_mode
      participant_count
      max_participants
      current_slide_index
    }
  }
`;

const JOIN_SESSION = `
  mutation JoinSession($input: JoinSessionInput!) {
    joinSlideSession(input: $input) {
      id
      display_name
      avatar_emoji
      total_score
      correct_count
      wrong_count
    }
  }
`;

const GET_DECK = `
  query GetDeck($id: ID!) {
    getDeck(id: $id) {
      id
      slides {
        id
        page_order
        elements {
          id
          type
          position
          content
          style
        }
      }
    }
  }
`;

const GET_LEADERBOARD = `
  query GetLeaderboard($sessionId: ID!, $limit: Int) {
    getSessionLeaderboard(session_id: $sessionId, limit: $limit) {
      rank
      display_name
      avatar_emoji
      total_score
      correct_count
    }
  }
`;

// --- Types ---

export interface SessionInfo {
  id: string;
  deck_id: string;
  access_code: string;
  status: string;
  quiz_mode: boolean;
  participant_count: number;
  max_participants: number;
  current_slide_index: number;
}

export interface AttendeeInfo {
  id: string;
  display_name: string;
  avatar_emoji: string;
  total_score: number;
  correct_count: number;
  wrong_count: number;
}

export interface LeaderboardEntry {
  rank: number;
  display_name: string;
  avatar_emoji: string;
  total_score: number;
  correct_count: number;
}

export interface SlideElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string | any;
  src?: string;
  style?: any;
}

export interface Slide {
  id: string;
  index: number;
  elements: SlideElement[];
}

export type ViewState =
  | "join"
  | "waiting"
  | "presenting"
  | "leaderboard"
  | "ended";

// --- Hook Implementation ---

export const useLiveSession = (joinCode: string) => {
  const router = useRouter();

  // State
  const [viewState, setViewState] = useState<ViewState>("join");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Session state
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [attendee, setAttendee] = useState<AttendeeInfo | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Quiz State
  const [quizState, setQuizState] = useState<{
    status: "idle" | "active" | "ended";
    elementId?: string;
    questionData?: any; // All questions array
    currentQuestionIdx?: number;
    currentQuestion?: any;
    totalQuestions?: number;
    startTime?: string;
    timeLimit?: number;
    lastAnswerResult?: {
      question_id: string;
      is_correct: boolean;
      points: number;
      correct_ids: string[];
      submitted_ids: string[];
    } | null;
  } | null>(null);

  // Presentation state
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // WebSocket Ref
  const wsRef = useRef<WebSocket | null>(null);

  // --- WebSocket Logic ---
  useEffect(() => {
    if (!session?.id) return;

    // Correct WebSocket URL construction based on previous fixes
    const socketBase =
      process.env.NEXT_PUBLIC_SOCKET_URL || "ws://localhost:5000";
    const cleanBase = socketBase.replace(/\/$/, "").replace("http", "ws");
    const wsUrl = `${cleanBase}/ws/slides/${session.id}`;

    console.log("[useLiveSession] Connecting to WS:", wsUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[useLiveSession] Connected");
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log("[useLiveSession] WS Message:", msg);

        if (msg.event === "SYNC_SLIDE") {
          const newIndex = msg.data.slide_index;
          setCurrentSlideIndex(newIndex);
          // If we were waiting, switch to presenting
          if (viewState === "waiting") setViewState("presenting");
          // Reset quiz state on slide change
          setQuizState(null);
        } else if (msg.event === "SESSION_STATUS") {
          const newStatus = msg.data.status;
          if (newStatus === "ACTIVE") {
            setViewState("presenting");
          } else if (newStatus === "ENDED") {
            setViewState("ended");
          }
        } else if (msg.event === "PLAYER_JOINED") {
          setSession((prev) =>
            prev
              ? {
                  ...prev,
                  participant_count: (prev.participant_count || 0) + 1,
                }
              : null,
          );
        } else if (msg.event === "QUIZ_STARTED") {
          // Handle Quiz Start - backend sends 'questions' (plural)
          setQuizState({
            status: "active",
            elementId: msg.data.element_id,
            questionData: msg.data.questions, // Array of all questions
            startTime: msg.data.start_time,
            timeLimit: msg.data.time_limit,
          });
        } else if (msg.event === "SYNC_QUESTION") {
          // Handle question navigation from host
          setQuizState((prev) =>
            prev
              ? {
                  ...prev,
                  currentQuestionIdx: msg.data.index,
                  currentQuestion: msg.data.question,
                  totalQuestions: msg.data.total_questions,
                }
              : null,
          );
        } else if (msg.event === "ANSWER_ACCEPTED") {
          // Handle answer result
          setQuizState((prev) =>
            prev
              ? {
                  ...prev,
                  lastAnswerResult: msg.data,
                }
              : null,
          );
        } else if (msg.event === "QUIZ_ENDED") {
          setQuizState((prev) => (prev ? { ...prev, status: "ended" } : null));
        }
      } catch (e) {
        console.error("WS Parse Error", e);
      }
    };

    ws.onclose = () => {
      console.log("[useLiveSession] Disconnected");
    };

    return () => {
      ws.close();
    };
  }, [session?.id, viewState]);

  // --- Actions ---

  const joinSession = async (displayName: string, emoji: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Join Mutation
      const joinRes = await fetch(`${API_URL}/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: JOIN_SESSION,
          variables: {
            input: {
              access_code: joinCode,
              display_name: displayName,
              avatar_emoji: emoji,
            },
          },
        }),
      });
      const joinData = await joinRes.json();
      if (joinData.errors) throw new Error(joinData.errors[0].message);

      setAttendee(joinData.data.joinSlideSession);

      // 2. Fetch Session Info
      const sessionRes = await fetch(`${API_URL}/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: GET_SESSION_BY_CODE,
          variables: { code: joinCode },
        }),
      });
      const sessionResult = await sessionRes.json();
      if (sessionResult.errors)
        throw new Error(sessionResult.errors[0].message);

      const sessionInfo = sessionResult.data.getSlideSessionByCode;
      setSession(sessionInfo);

      // 3. Fetch Slides
      if (sessionInfo.deck_id) {
        const deckRes = await fetch(`${API_URL}/graphql`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: GET_DECK,
            variables: { id: sessionInfo.deck_id },
          }),
        });
        const deckResult = await deckRes.json();

        if (!deckResult.errors) {
          const rawSlides = deckResult.data.getDeck?.slides || [];
          const formattedSlides = rawSlides
            .map((s: any) => ({
              id: s.id,
              index: s.page_order,
              elements: s.elements.map((e: any) => {
                const pos =
                  typeof e.position === "string"
                    ? JSON.parse(e.position)
                    : e.position || {};
                const style =
                  typeof e.style === "string"
                    ? JSON.parse(e.style)
                    : e.style || {};
                return {
                  id: e.id,
                  type: e.type,
                  x: pos.x || 0,
                  y: pos.y || 0,
                  width: pos.width || 10,
                  height: pos.height || 10,
                  content: e.content,
                  style: style,
                };
              }),
            }))
            .sort((a: any, b: any) => a.index - b.index);
          setSlides(formattedSlides);
        }
      }

      // 4. Set Initial State
      if (sessionInfo.status === "ACTIVE") {
        setViewState("presenting");
        setCurrentSlideIndex(sessionInfo.current_slide_index || 0);
      } else {
        setViewState("waiting");
      }
    } catch (err: any) {
      console.error("Join Error:", err);
      setError(err.message || "Không thể tham gia phiên");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit quiz answer via the connected WebSocket
  const submitAnswer = useCallback(
    (payload: any) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        // Include attendee_id in payload so backend can identify the user
        const enrichedPayload = {
          ...payload,
          attendee_id: attendee?.id || "anonymous",
        };
        const message = {
          event: "SUBMIT_ANSWER",
          data: enrichedPayload,
        };
        console.log("[useLiveSession] Sending SUBMIT_ANSWER:", message);
        wsRef.current.send(JSON.stringify(message));
      } else {
        console.error(
          "[useLiveSession] WebSocket not connected, cannot submit answer",
        );
      }
    },
    [attendee?.id],
  );

  // Ensure quizState is exported correctly
  return {
    viewState,
    isLoading,
    error,
    session,
    attendee,
    slides,
    currentSlideIndex,
    joinSession,
    leaderboard,
    quizState,
    submitAnswer, // Add this for QuizPlayer
  };
};
