"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Presentation,
  FolderOpen,
  BarChart3,
  Settings,
  Users,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: number;
}

const mainNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },

  { icon: FolderOpen, label: "Kho học liệu", path: "/resources" },
];

const secondaryNavItems: NavItem[] = [
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Users, label: "Shared with me", path: "/shared", badge: 3 },
  { icon: BookOpen, label: "LMS Sync", path: "/lms" },
];

const bottomNavItems: NavItem[] = [
  { icon: Settings, label: "Settings", path: "/settings" },
  { icon: HelpCircle, label: "Help", path: "/help" },
];

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen flex flex-col bg-sidebar border-r border-sidebar-border relative"
      style={{ background: "var(--gradient-sidebar)" }}
    >
      {/* Logo & Brand */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-glow">
            <Presentation className="w-5 h-5 text-primary-foreground" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="font-display font-bold text-lg text-sidebar-foreground">
                  Slides
                </h1>
                <p className="text-[10px] text-sidebar-foreground/50 -mt-1">
                  Trường học số
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Create Button */}
      <div className="px-3 py-4">
        <Link href="/editor/new">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all duration-300",
              "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground",
              "shadow-lg hover:shadow-glow",
            )}
          >
            <Plus className="w-5 h-5" />
            {!isCollapsed && <span>Tạo mới</span>}
          </motion.button>
        </Link>
      </div>

      {/* Search (when expanded) */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 pb-4"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sidebar-foreground/40" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-sidebar-accent border border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/40 text-sm focus:outline-none focus:ring-2 focus:ring-sidebar-ring/50"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 space-y-6 overflow-y-auto custom-scrollbar">
        {/* Main Section */}
        <div className="space-y-1">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.path}
              item={item}
              isCollapsed={isCollapsed}
              isActive={isActive(item.path)}
            />
          ))}
        </div>

        {/* Secondary Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-3 text-[11px] font-medium text-sidebar-foreground/40 uppercase tracking-wider mb-2">
              Workspace
            </p>
          )}
          {secondaryNavItems.map((item) => (
            <NavLink
              key={item.path}
              item={item}
              isCollapsed={isCollapsed}
              isActive={isActive(item.path)}
            />
          ))}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.path}
            item={item}
            isCollapsed={isCollapsed}
            isActive={isActive(item.path)}
          />
        ))}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-sidebar border border-sidebar-border flex items-center justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </motion.aside>
  );
}

interface NavLinkProps {
  item: NavItem;
  isCollapsed: boolean;
  isActive: boolean;
}

function NavLink({ item, isCollapsed, isActive }: NavLinkProps) {
  const Icon = item.icon;

  return (
    <Link href={item.path}>
      <motion.div
        whileHover={{ x: 2 }}
        className={cn(
          "sidebar-item",
          isActive && "active",
          isCollapsed && "justify-center px-2",
        )}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 text-sm"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
        {!isCollapsed && item.badge && (
          <span className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs font-medium">
            {item.badge}
          </span>
        )}
      </motion.div>
    </Link>
  );
}
