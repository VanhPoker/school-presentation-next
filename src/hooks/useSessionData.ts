import { useState, useEffect, useCallback, useRef } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface SessionData {
  id: string;
  deck_id: string;
  access_code: string;
  status: string;
  participant_count: number;
  max_participants: number;
  current_slide_id?: string;
  current_slide_index?: number;
  current_element_id?: string;
}

export interface Attendee {
  id: string;
  display_name: string;
  avatar_emoji: string;
  total_score: number;
  correct_count: number;
  wrong_count: number;
  is_anonymous: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  display_name: string;
  avatar_emoji: string;
  total_score: number;
  points_gained: number;
  correct_count: number;
}

interface UseSessionDataOptions {
  sessionId?: string | null;
  pollInterval?: number;
  enabled?: boolean;
}

export function useSessionData({
  sessionId,
  pollInterval = 3000,
  enabled = true,
}: UseSessionDataOptions) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [slides, setSlides] = useState<any[]>([]);

  // Quiz State
  const [quizState, setQuizState] = useState<{
    status: "idle" | "active" | "ended";
    elementId?: string;
    questionData?: any; // All questions array from QUIZ_STARTED
    currentQuestionIdx?: number; // Current question index for multi-question navigation
    currentQuestion?: any; // Current question data from SYNC_QUESTION
    totalQuestions?: number; // Total number of questions
    startTime?: string;
    timeLimit?: number;
    stats?: { submitted_count: number; total_participants: number } | null;
    lastAnswerResult?: {
      question_id: string;
      is_correct: boolean;
      points: number;
      correct_ids: string[];
      submitted_ids: string[];
    } | null;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const fetchSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(`${API_URL}/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query GetSession($id: ID!) {
              getSlideSession(id: $id) {
                id
                deck_id
                access_code
                status
                participant_count
                max_participants
                current_slide_id
                current_slide_index
                current_element_id
              }
            }
          `,
          variables: { id: sessionId },
        }),
      });
      const result = await response.json();
      if (!result.errors && result.data?.getSlideSession) {
        setSession(result.data.getSlideSession);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, [sessionId]);

  const fetchAttendees = useCallback(async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(`${API_URL}/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query GetAttendees($sessionId: ID!) {
              getSessionAttendees(session_id: $sessionId) {
                id
                display_name
                avatar_emoji
                total_score
                correct_count
                wrong_count
                is_anonymous
              }
            }
          `,
          variables: { sessionId },
        }),
      });
      const result = await response.json();
      if (!result.errors && result.data?.getSessionAttendees) {
        setAttendees(result.data.getSessionAttendees);
      }
    } catch (err: any) {
      console.error("Failed to fetch attendees:", err);
    }
  }, [sessionId]);

  const fetchLeaderboard = useCallback(
    async (limit: number = 10) => {
      if (!sessionId) return;

      try {
        const response = await fetch(`${API_URL}/graphql`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
            query GetLeaderboard($sessionId: ID!, $limit: Int) {
              getSessionLeaderboard(session_id: $sessionId, limit: $limit) {
                rank
                display_name
                avatar_emoji
                total_score
                points_gained
                correct_count
              }
            }
          `,
            variables: { sessionId, limit },
          }),
        });
        const result = await response.json();
        if (!result.errors && result.data?.getSessionLeaderboard) {
          setLeaderboard(result.data.getSessionLeaderboard);
        }
      } catch (err: any) {
        console.error("Failed to fetch leaderboard:", err);
      }
    },
    [sessionId],
  );

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchSession(), fetchAttendees(), fetchLeaderboard()]);
    setIsLoading(false);
  }, [fetchSession, fetchAttendees, fetchLeaderboard]);

  // Initial fetch
  useEffect(() => {
    if (sessionId && enabled) {
      refreshAll();
    }
  }, [sessionId, enabled]);

  // WebSocket Connection
  useEffect(() => {
    if (!sessionId || !enabled) return;

    // Determine WS URL
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = API_URL.replace(/^https?:\/\//, "");
    const wsUrl = `${protocol}//${host}/ws/slides/${sessionId}`;

    console.log("Connecting to Session WS:", wsUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to Session WS");
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data); // { event: string, data: any }

        switch (msg.event) {
          case "PLAYER_JOINED":
            // Add new attendee to list
            const newAttendee = msg.data as Attendee;
            setAttendees((prev) => {
              if (prev.some((a) => a.id === newAttendee.id)) return prev;
              return [...prev, newAttendee];
            });
            // Update participant count
            setSession((prev) =>
              prev
                ? {
                    ...prev,
                    participant_count: (prev.participant_count || 0) + 1,
                  }
                : null,
            );
            break;

          case "SYNC_SLIDE":
            setSession((prev) =>
              prev
                ? { ...prev, current_slide_index: msg.data.slide_index }
                : null,
            );
            break;

          case "SESSION_STATUS":
            setSession((prev) =>
              prev ? { ...prev, status: msg.data.status } : null,
            );
            break;

          case "SESSION_ENDED":
            setSession((prev) => (prev ? { ...prev, status: "ENDED" } : null));
            break;

          case "SESSION_STARTED":
            // Load session and slides
            if (msg.data.session) {
              setSession(msg.data.session);
            }
            if (msg.data.deck?.slides) {
              // Map backend slides to frontend format if needed
              // The backend now returns { SlideResponse, Elements: []ElementResponse }
              // Frontend expects { ...SlideResponse, elements: [] } (lowercase)
              // Go JSON tags for struct fields are usually snake_case or whatever defined in DTO.
              // My DTOs in Go:
              // SlideDetailResponse { SlideResponse, Elements } -> Elements `json:"elements"`
              // SlideResponse fields are `json:"page_order"`, etc.
              // So specific mapping might not be needed if casing matches?
              // Wait, UpdateCurrentSlide in PresenterView used manual mapping of elements.
              // Let's assume the raw data structure is close enough but we might need to handle 'content' if it's string vs object.
              // For now, let's just set it and let things break if types are off, then fix.
              // ACTUALLY, I should be careful.
              // The sorting by page_order happens here.
              const rawSlides = msg.data.deck.slides;
              const sorted = rawSlides.sort(
                (a: any, b: any) => a.page_order - b.page_order,
              );
              // Add index property which PresenterView seems to use
              const sensitiveSlides = sorted.map((s: any) => ({
                ...s,
                index: s.page_order,
                elements: (s.elements || []).map((e: any) => {
                  let pos = e.position || {};
                  let style = e.style || {};

                  try {
                    if (typeof e.position === "string") {
                      pos = JSON.parse(e.position);
                    }
                    if (typeof e.style === "string") {
                      // console.log("[FE-DEBUG] Parsing style string:", e.style);
                      style = JSON.parse(e.style);
                    }
                  } catch (err) {
                    console.error(
                      "[FE-DEBUG] JSON parse error for element",
                      e.id,
                      err,
                    );
                  }

                  // Config check: Ensure style is object
                  if (typeof style !== "object") {
                    console.warn(
                      "[FE-DEBUG] Style is still not object:",
                      style,
                    );
                    style = {};
                  }

                  return {
                    ...e,
                    x: pos.x || 0,
                    y: pos.y || 0,
                    width: pos.width || 10,
                    height: pos.height || 10,
                    content: e.content,
                    style: style,
                  };
                }),
              }));

              // Also ensure background is handled if it's string vs object?
              // Actually background in Go struct might be string e.g. "#hex" or object.
              // In PresenterView we did style={slide.background}.
              // If background is string "#fff", style="#fff" IS INVALID.
              // We should normalize it here.
              const normalizedSlides = sensitiveSlides.map((s: any) => ({
                ...s,
                background:
                  typeof s.background === "string"
                    ? { background: s.background } // Convert string color to style obj
                    : s.background || {},
              }));

              setSlides(normalizedSlides);
            }
            break;

          // Quiz Events
          case "QUIZ_STARTED":
            // msg.data = { questions, time_limit, start_time }
            // Note: Backend might not send element_id in response, so we might lose track of it if we rely solely on this event associated with a specific element.
            // But usually START_QUIZ (request) had it.
            // We set questions array to questionData.
            setQuizState({
              status: "active",
              elementId: msg.data.element_id, // Ensure Backend sends this or it will be undefined
              questionData: msg.data.questions, // Updated field name from backend
              startTime: msg.data.start_time,
              timeLimit: msg.data.time_limit,
              stats: null, // Reset stats
            });
            break;

          case "LIVE_STATS_UPDATE":
            // msg.data = { submitted_count, total_participants }
            setQuizState((prev) =>
              prev
                ? {
                    ...prev,
                    stats: msg.data,
                  }
                : null,
            );
            break;

          case "QUIZ_ENDED":
            setQuizState((prev) =>
              prev
                ? {
                    ...prev,
                    status: "ended",
                  }
                : null,
            );
            break;

          case "SYNC_QUESTION":
            // msg.data = { index, question, total_questions, stats }
            setQuizState((prev) =>
              prev
                ? {
                    ...prev,
                    currentQuestionIdx:
                      msg.data.index ?? prev.currentQuestionIdx,
                    currentQuestion: msg.data.question,
                    totalQuestions: msg.data.total_questions,
                    stats: msg.data.stats ?? prev.stats,
                  }
                : null,
            );
            break;

          case "ANSWER_ACCEPTED":
            // msg.data = { question_id, is_correct, points, correct_ids, submitted_ids }
            setQuizState((prev) =>
              prev
                ? {
                    ...prev,
                    lastAnswerResult: msg.data,
                  }
                : null,
            );
            break;
        }
      } catch (err) {
        console.error("WS Parse Error", err);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from Session WS");
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [sessionId, enabled]);

  const sendMessage = useCallback((event: string, data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log("[WS-SEND]", event, data);
      wsRef.current.send(JSON.stringify({ event, data }));
    } else {
      console.warn("WS not ready", wsRef.current?.readyState);
    }
  }, []);

  return {
    session,
    attendees,
    leaderboard,
    slides,
    quizState, // Expose quiz state
    isLoading,
    error,
    refreshAll,
    fetchSession,
    fetchAttendees,
    fetchLeaderboard,
    sendMessage,
  };
}

export default useSessionData;
