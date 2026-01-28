import { ReactNode } from "react";
import { MobileHeader } from "@/components/MobileHeader";
import { BottomNav } from "@/components/BottomNav";
import { DesktopSidebar } from "@/components/DesktopSidebar";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  showMobileHeader?: boolean;
}

export function AppLayout({ children, title = "Study Progress", showMobileHeader = true }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen pb-20 md:pb-0">
        {/* Mobile Header - Only visible on mobile */}
        {showMobileHeader && (
          <div className="md:hidden">
            <MobileHeader title={title} />
          </div>
        )}

        {/* Page Content */}
        <div className="flex-1">
          {children}
        </div>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}
