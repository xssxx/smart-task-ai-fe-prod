"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Bell,
  Settings,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { logout } from "@/services/api";

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between px-6 py-4 md:px-6 pl-16 md:pl-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-blue-600" />
            <h1 className="hidden md:flex text-xl font-bold text-gray-900">
              Smart Task
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5 text-gray-600" />
          </Button>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 ml-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    ออกจากระบบ
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
