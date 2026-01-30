"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface JoinSessionFormProps {
  joinCode: string;
  isLoading?: boolean;
  onJoin: (name: string, avatar: string) => void;
}

export function JoinSessionForm({
  joinCode,
  isLoading = false,
  onJoin,
}: JoinSessionFormProps) {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("🐱");

  const defaultAvatars = [
    "🐱",
    "🐶",
    "🦊",
    "🐼",
    "🐨",
    "🦁",
    "🐯",
    "🐸",
    "🐵",
    "🐰",
    "🦄",
    "🐲",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin(name, avatar);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 flex flex-col items-center justify-center bg-slate-900">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Quay lại
            </Button>
          </Link>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/10">
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Tham gia phiên trình bày
          </h1>
          <p className="text-center text-indigo-300 font-mono text-xl mb-6">
            {joinCode}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Tên hiển thị
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên của bạn..."
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-12 focus:ring-emerald-500 focus:border-emerald-500"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Chọn avatar
              </label>
              <div className="grid grid-cols-6 gap-2">
                {defaultAvatars.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatar(emoji)}
                    className={`aspect-square text-2xl rounded-lg transition-all flex items-center justify-center ${
                      avatar === emoji
                        ? "bg-emerald-600 ring-2 ring-emerald-400 scale-110"
                        : "bg-white/10 hover:bg-white/20"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={!name.trim() || isLoading}
              className="w-full h-12 text-lg bg-emerald-600 hover:bg-emerald-700 text-white border-none disabled:opacity-50 font-bold transition-all"
            >
              {isLoading ? "Đang vào..." : "Tham gia ngay 🚀"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
