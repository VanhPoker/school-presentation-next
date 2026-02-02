"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Radio, Users, Copy, Check, QrCode, Play, Loader2 } from "lucide-react";
// import { useToast } from "@/hooks/use-toast"; // Ensure this hook exists or use valid one
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface StartSessionButtonProps {
  deckId: string;
  deckTitle?: string;
}

import useSessionData from "@/hooks/useSessionData";

// Local interface no longer needed if we use the one from hook, or keep for simplicity but mapped
// We will rely on the hook's session state generally, but we need local state for the initial creation response
// before the hook picks it up.
interface LocalSessionData {
  id: string;
  access_code: string;
  status: string;
  participant_count: number;
  max_participants: number;
}

export const StartSessionButton = ({
  deckId,
  deckTitle = "Bài trình bày",
}: StartSessionButtonProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [createdSession, setCreatedSession] = useState<LocalSessionData | null>(
    null,
  );

  // Use hook for real-time data
  const { session: liveSession } = useSessionData({
    sessionId: createdSession?.id,
    enabled: showDialog && !!createdSession?.id,
  });

  // Merge created session with live updates
  const session = liveSession || createdSession;

  const [copied, setCopied] = useState(false);
  // const { toast } = useToast();
  const router = useRouter();

  // Polling removed in favor of WebSocket via useSessionData

  const createSession = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            mutation CreateSession($input: CreateSessionInput!) {
              createSlideSession(input: $input) {
                id
                access_code
                status
                participant_count
                max_participants
              }
            }
          `,
          variables: {
            input: {
              deck_id: deckId,
              quiz_mode: true,
              max_participants: 50,
            },
          },
        }),
      });

      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      setCreatedSession(result.data.createSlideSession);
      // toast({
      //   title: "Phiên đã được tạo!",
      //   description: `Mã tham gia: ${result.data.createSlideSession.access_code}`,
      // });
      console.log(
        "Session created:",
        result.data.createSlideSession.access_code,
      );
    } catch (err: any) {
      // toast({
      //   title: "Lỗi",
      //   description: err.message || "Không thể tạo phiên",
      //   variant: "destructive",
      // });
      console.error("Failed to create session:", err);
      alert("Lỗi: " + (err.message || "Không thể tạo phiên"));
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = () => {
    if (session?.access_code) {
      navigator.clipboard.writeText(session.access_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyLink = () => {
    if (session?.access_code) {
      const link = `${window.location.origin}/live/${session.access_code}`;
      navigator.clipboard.writeText(link);
      // toast({
      //   title: "Đã sao chép link!",
      //   description: link,
      // });
      alert("Đã sao chép link: " + link);
    }
  };

  const handleStart = () => {
    setShowDialog(true);
    if (!session) {
      createSession();
    }
  };

  return (
    <>
      <Button
        onClick={handleStart}
        className="gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
      >
        <Radio className="w-4 h-4" />
        Bắt đầu phiên
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-purple-500" />
              Phiên trực tiếp
            </DialogTitle>
            <DialogDescription>{deckTitle}</DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-4" />
              <p className="text-gray-500">Đang tạo phiên...</p>
            </div>
          ) : session ? (
            <div className="space-y-6">
              {/* Access Code */}
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Mã tham gia</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-mono font-bold tracking-widest text-purple-600">
                    {session.access_code}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={copyCode}
                    className="h-10 w-10"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Join URL */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-2 text-center">
                  Link tham gia
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-white p-2 rounded border truncate">
                    {session
                      ? `${window.location.origin}/live/${session.access_code}`
                      : ""}
                  </code>
                  <Button variant="outline" size="sm" onClick={copyLink}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Participant count */}
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Users className="w-5 h-5" />
                <span className="font-medium">
                  {session.participant_count} / {session.max_participants} người
                  tham gia
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    window.open(
                      `${window.location.origin}/live/${session.access_code}`,
                      "_blank",
                    )
                  }
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Mở link tham gia
                </Button>
                <Button
                  className="flex-1 bg-purple-500 hover:bg-purple-600"
                  onClick={() => {
                    // Navigate to presenter view
                    // In Next.js App Router we use router.push
                    router.push(`/present/${session.id}`);
                  }}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Bắt đầu
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-red-500">
              Không thể tạo phiên. Vui lòng thử lại.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
