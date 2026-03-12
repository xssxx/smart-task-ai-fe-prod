import type { Metadata } from "next";
import { Kanit, Momo_Signature } from "next/font/google";
import "../globals.css";
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
        className={`${kanit.variable} ${momoSignature.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
        {children}
        <Toaster
          position="top-right"
          closeButton={false}
          duration={2000}
          expand={false}
          visibleToasts={9}
        />
      </body>
    </html>
  );
}
