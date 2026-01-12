import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "../globals.css";
import { Toaster } from "@/components/ui/sonner";

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin", "thai"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "TaskFlow - Task Management",
  description: "Manage your tasks and projects efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${kanit.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
        {children}
        <Toaster 
          position="top-right" 
          richColors 
          closeButton={false} 
          duration={2000}
          expand={false}
          visibleToasts={9}
        />
      </body>
    </html>
  );
}
