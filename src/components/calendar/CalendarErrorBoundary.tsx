"use client";

import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class CalendarErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Calendar Error Boundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full min-h-[400px] p-8">
          <div className="text-center max-w-md">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-rose-100 rounded-full">
                <AlertTriangle className="w-8 h-8 text-rose-600" />
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              เกิดข้อผิดพลาด
            </h3>

            <p className="text-gray-600 mb-6">
              ขออภัย เกิดข้อผิดพลาดในการแสดงปฏิทิน กรุณาลองใหม่อีกครั้ง
            </p>

            {this.state.error && (
              <div className="mb-6 p-3 bg-gray-50 rounded-lg text-left">
                <p className="text-xs text-gray-500 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <Button onClick={this.handleReset} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              โหลดใหม่
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
