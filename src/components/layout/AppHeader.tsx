"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bell,
  MessageSquare,
  User,
  ChevronDown,
  LogOut,
  Settings,
  HelpCircle,
  Moon,
  Sun,
  Globe,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface AppHeaderProps {
  title?: string;
  showBreadcrumb?: boolean;
  actions?: React.ReactNode;
}

export function AppHeader({ title, actions }: AppHeaderProps) {
  const [notifications] = useState(5);
  const [isOnline] = useState(true);

  return (
    <header className="h-16 bg-card/80 backdrop-blur-lg border-b border-border flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Left: Title or Breadcrumb */}
      <div className="flex items-center gap-4">
        {title && (
          <h1 className="text-xl font-display font-semibold text-foreground">
            {title}
          </h1>
        )}
      </div>

      {/* Right: Actions & User */}
      <div className="flex items-center gap-3">
        {/* Custom Actions */}
        {actions}

        {/* Connection Status */}
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
            isOnline
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive",
          )}
        >
          <Wifi className="w-3.5 h-3.5" />
          <span>{isOnline ? "Online" : "Offline"}</span>
        </div>

        {/* Language */}
        <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
          <Globe className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 bg-card border-border shadow-xl"
          >
            <div className="px-4 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground">Thông báo</h3>
              <p className="text-xs text-muted-foreground">
                Bạn có {notifications} thông báo mới
              </p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {[1, 2, 3].map((i) => (
                <DropdownMenuItem
                  key={i}
                  className="px-4 py-3 cursor-pointer hover:bg-secondary"
                >
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">
                        Nguyễn Văn A đã chia sẻ bài thuyết trình với bạn
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        5 phút trước
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
            <div className="px-4 py-2 border-t border-border">
              <Link
                href="/notifications"
                className="text-sm text-primary hover:underline"
              >
                Xem tất cả
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-secondary transition-colors">
              <Avatar className="w-8 h-8">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=teacher" />
                <AvatarFallback>GV</AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-foreground">
                  Nguyễn Thị Mai
                </p>
                <p className="text-[10px] text-muted-foreground">Giáo viên</p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-card border-border shadow-xl"
          >
            <div className="px-3 py-2 border-b border-border">
              <p className="font-medium text-foreground">Nguyễn Thị Mai</p>
              <p className="text-xs text-muted-foreground">
                mai.nguyen@school.edu.vn
              </p>
              <Badge className="mt-2 bg-primary/10 text-primary border-0">
                Giáo viên
              </Badge>
            </div>
            <DropdownMenuItem className="cursor-pointer">
              <User className="w-4 h-4 mr-2" />
              Hồ sơ cá nhân
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="w-4 h-4 mr-2" />
              Cài đặt
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <HelpCircle className="w-4 h-4 mr-2" />
              Trợ giúp
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
