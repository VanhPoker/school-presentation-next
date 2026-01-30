"use client";

import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { usePathname } from "next/navigation";

interface MainLayoutProps {
  title?: string;
  headerActions?: React.ReactNode;
  children?: React.ReactNode;
}

export function MainLayout({
  title,
  headerActions,
  children,
}: MainLayoutProps) {
  const pathname = usePathname();
  const isEditor = pathname?.startsWith("/editor");
  const isPresenter =
    pathname?.startsWith("/present") || pathname?.startsWith("/live");

  if (isEditor || isPresenter) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <AppHeader title={title} actions={headerActions} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
