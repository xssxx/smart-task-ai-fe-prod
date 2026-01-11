"use client";

import { useState, Suspense } from "react";
import { Kanit } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { LoadingProvider } from "@/components/LoadingProvider";
import { PageLoader } from "@/components/ui/page-loader";

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin", "thai"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <html lang="en">
      <body
        className={`${kanit.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
        <Suspense fallback={<PageLoader />}>
          <LoadingProvider>
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
          </LoadingProvider>
        </Suspense>
      </body>
    </html>
  );
}
