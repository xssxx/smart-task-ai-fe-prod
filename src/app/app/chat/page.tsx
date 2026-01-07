"use client";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ChatIndexPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Select a Project</h2>
        <p className="text-gray-600 mt-2 mb-4">
          Please select a project from the sidebar to start chatting with AI
        </p>
        <Link href="/app/home">
          <Button>Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
