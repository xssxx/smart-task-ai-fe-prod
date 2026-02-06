"use client";

import { useState, Suspense } from "react";
import { Kanit, Momo_Signature } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { LoadingProvider } from "@/components/LoadingProvider";
import { ProjectProvider } from "@/contexts";
import { PageLoader } from "@/components/ui/page-loader";
import { Toaster } from "@/components/ui/sonner";

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin", "thai"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const momoSignature = Momo_Signature({
  variable: "--font-momo",
  subsets: ["latin"],
  weight: ["400"],
  adjustFontFallback: false,
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
        className={`${kanit.variable} ${momoSignature.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
        <Suspense fallback={<PageLoader />}>
          <LoadingProvider>
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
          </LoadingProvider>
        </Suspense>
      </body>
    </html>
  );
}
