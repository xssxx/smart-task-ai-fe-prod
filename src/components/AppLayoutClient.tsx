"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { LoadingProvider } from "@/components/LoadingProvider";
import { ProjectProvider } from "@/contexts";
import { NotificationProvider, useNotifications } from "@/contexts/NotificationContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { Toaster } from "@/components/ui/sonner";
import { setGlobalNotificationHandler } from "@/lib/enhanced-toast";

function NotificationSetup() {
  const { addNotification } = useNotifications();

  useEffect(() => {
    console.log('[NotificationSetup] Registering notification handler');
    setGlobalNotificationHandler(addNotification);
    return () => {
      console.log('[NotificationSetup] Unregistering notification handler');
    };
  }, [addNotification]);

  return null;
}

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <LoadingProvider>
      <NotificationProvider>
        <NotificationSetup />
        <ProfileProvider>
          <ProjectProvider>
            <div className="flex h-screen overflow-hidden">
              {/* Sidebar - Fixed on the left */}
              <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

              {/* Main content area */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Navbar - Fixed at top */}
                <Navbar />

                {/* Main scrollable content */}
                <main className="flex-1 overflow-y-auto bg-gray-50">
                  {children}
                </main>
              </div>
            </div>
            <Toaster
              position="top-right"
              richColors
              closeButton={false}
              duration={2000}
              expand={false}
              visibleToasts={9}
            />
          </ProjectProvider>
        </ProfileProvider>
      </NotificationProvider>
    </LoadingProvider>
  );
}
