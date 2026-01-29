"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
      <div className="flex items-center justify-between px-6 py-5 lg:px-8 pl-16 lg:pl-8">
        {/* Logo - Show when sidebar is hidden (< 1024px) */}
        <div className="flex items-center gap-4 lg:hidden">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Smart Task AI" width={40} height={40} className="object-contain" />
            <h1 className="text-2xl font-momo text-gray-900">
              Smart Task
            </h1>
          </div>
        </div>
        
        {/* Empty div for desktop to maintain layout */}
        <div className="hidden lg:block"></div>
        
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="h-12 w-12 sm:h-13 sm:w-13 hover:bg-transparent">
            <Bell className="w-5.5! h-5.5! text-gray-600 hover:text-gray-900 transition-colors" />
          </Button>
          <Button variant="ghost" size="icon" className="h-12 w-12 sm:h-13 sm:w-13 hover:bg-transparent">
            <Settings className="w-5.5! h-5.5! text-gray-600 hover:text-gray-900 transition-colors" />
          </Button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 sm:gap-3 ml-1 sm:ml-2 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none">
                <Avatar className="w-9 h-9 sm:w-10 sm:h-10">
                  {profile?.avatarPath && (
                    <AvatarImage src={profile.avatarPath} alt={getDisplayName()} />
                  )}
                  <AvatarFallback className="bg-gray-900 text-white text-sm sm:text-base">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm sm:text-base font-medium text-gray-700">
                  {getDisplayName()}
                </span>
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleNavigateToProfile} className="cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                โปรไฟล์
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50">
                <LogOut className="w-4 h-4 mr-2" />
                ลงชื่อออก
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
