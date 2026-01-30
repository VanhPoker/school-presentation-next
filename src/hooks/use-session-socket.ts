import { useEffect, useRef, useState, useCallback } from "react";

// Define events matching backend contracts
export const SESSION_EVENTS = {
  // Client -> Server
  JOIN_SESSION: "JOIN_SESSION",
  START_SESSION: "START_SESSION", // Host only
  GO_TO_SLIDE: "GO_TO_SLIDE", // Host only

  // Quiz Specific
  START_QUIZ: "START_QUIZ",
  SUBMIT_ANSWER: "SUBMIT_ANSWER",
  STOP_QUIZ: "STOP_QUIZ",

  // Server -> Client
  SESSION_STARTED: "SESSION_STARTED",
  SYNC_SLIDE: "SYNC_SLIDE",
  PLAYER_JOINED: "PLAYER_JOINED",

  // Quiz Broadcasts
  QUIZ_STARTED: "QUIZ_STARTED",
  QUIZ_ENDED: "QUIZ_ENDED",
  LIVE_STATS_UPDATE: "LIVE_STATS_UPDATE",
  LEADERBOARD_UPDATE: "LEADERBOARD_UPDATE",
};

type SessionSocketOptions = {
  sessionId: string; // The session ID (from URL joinCode or ID)
  onSessionStarted?: (data: any) => void;
  onSyncSlide?: (data: { slide_index: number }) => void;
  onQuizStarted?: (data: any) => void;
  onQuizStopped?: (data: any) => void;
  onStatsUpdate?: (data: any) => void;
};

export const useSessionSocket = ({
  sessionId,
  onSessionStarted,
  onSyncSlide,
  onQuizStarted,
  onQuizStopped,
  onStatsUpdate,
}: SessionSocketOptions) => {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "ws://localhost:5000";

    // Ensure we start with ws/wss
    const baseUrl = socketUrl.startsWith("http")
      ? socketUrl.replace("http", "ws")
      : socketUrl;

    // Remove any trailing slash from base to avoid double slashes
    const cleanBase = baseUrl.replace(/\/$/, "");

    // Construct WS URL: /ws/slides/:sessionId
    const wsUrl = `${cleanBase}/ws/slides/${sessionId}`;

    console.log("Connecting to Session WS:", wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to Session WS");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const { event: eventType, data } = msg;

        console.log("WS Received:", eventType, data);

        switch (eventType) {
          case SESSION_EVENTS.SESSION_STARTED:
            onSessionStarted?.(data);
            break;
          case SESSION_EVENTS.SYNC_SLIDE:
            onSyncSlide?.(data);
            break;
          case SESSION_EVENTS.QUIZ_STARTED:
            // Map backend 'element_id' if needed
            onQuizStarted?.(data);
            break;
          case SESSION_EVENTS.QUIZ_ENDED:
            onQuizStopped?.(data);
            break;
          case SESSION_EVENTS.LIVE_STATS_UPDATE:
            onStatsUpdate?.(data);
            break;
          default:
            break;
        }
      } catch (e) {
        console.error("WS Message Parse Error", e);
      }
    };

    ws.onclose = () => {
      console.log("Session WS Closed");
      setIsConnected(false);
    };

    // Store reference
    socketRef.current = ws;

    return () => {
      ws.close();
    };
  }, [sessionId]);

  const submitAnswer = useCallback((elementId: string, answer: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          event: SESSION_EVENTS.SUBMIT_ANSWER,
          data: {
            element_id: elementId,
            answer: answer,
          },
        }),
      );
    }
  }, []);

  return {
    isConnected,
    submitAnswer,
  };
};
