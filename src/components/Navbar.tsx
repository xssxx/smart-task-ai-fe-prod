"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell,
  Settings,
  ChevronDown,
  LogOut,
  User,
} from "lucide-react";
import { logout, getProfile } from "@/services/api";
import { ROUTES } from "@/constants";
import { useLoading } from "@/components/LoadingProvider";

const Navbar = () => {
  const router = useRouter();
  const { startLoading } = useLoading();
  const [showDropdown, setShowDropdown] = useState(false);
  const [profile, setProfile] = useState<{
    firstName: string;
    lastName: string;
    nickname?: string;
    avatarPath?: string;
  } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        const data = response.data.data;
        setProfile({
          firstName: data.first_name,
          lastName: data.last_name,
          nickname: data.nickname,
          avatarPath: data.avatar_path,
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleNavigateToProfile = () => {
    setShowDropdown(false);
    startLoading();
    router.push(ROUTES.PROFILE);
  };

  const getInitials = () => {
    if (!profile) return "U";
    const firstInitial = profile.firstName?.charAt(0) || "";
    const lastInitial = profile.lastName?.charAt(0) || "";
    return (firstInitial + lastInitial).toUpperCase();
  };

  const getDisplayName = () => {
    if (!profile) return "User";
    return profile.nickname || profile.firstName || "User";
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between px-6 py-4 md:px-6 pl-16 md:pl-6">
        {/* Logo - Show only on mobile */}
        <div className="flex items-center gap-4 md:hidden">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Smart Task AI" width={32} height={32} className="object-contain" />
            <h1 className="text-2xl font-momo text-gray-900">
              Smart Task
            </h1>
          </div>
        </div>
        
        {/* Empty div for desktop to maintain layout */}
        <div className="hidden md:block"></div>
        
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
                {profile?.avatarPath && (
                  <AvatarImage src={profile.avatarPath} alt={getDisplayName()} />
                )}
                <AvatarFallback className="bg-gray-900 text-white text-sm">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {getDisplayName()}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-600 transition-all duration-300 ${showDropdown ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                {/* Backdrop with fade animation */}
                <div
                  className="fixed inset-0 z-10 animate-in fade-in-0 duration-200"
                  onClick={() => setShowDropdown(false)}
                />
                {/* Dropdown with slide and fade animation */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 animate-in fade-in-0 slide-in-from-top-2 duration-200 origin-top-right">
                  <button
                    onClick={handleNavigateToProfile}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors group"
                  >
                    <User className="w-4 h-4" />
                    โปรไฟล์
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors group"
                  >
                    <LogOut className="w-4 h-4" />
                    ลงชื่อออก
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
