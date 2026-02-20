"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
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
  Settings,
  ChevronDown,
  LogOut,
  User,
  Languages,
  Palette,
} from "lucide-react";
import { logout } from "@/services/api";
import { ROUTES } from "@/constants";
import { useLoading } from "@/components/LoadingProvider";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { LanguageModal } from "@/components/LanguageModal";
import { ThemeModal } from "@/components/ThemeModal";
import { useProfile } from "@/contexts/ProfileContext";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { startLoading } = useLoading();
  const t = useTranslations("navbar");
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const { profile, getInitials, getDisplayName } = useProfile();

  const handleLogout = () => {
    logout();
  };

  const handleNavigateToProfile = () => {
    startLoading();
    router.push(ROUTES.PROFILE);
  };

  // Get current page title
  const getCurrentPageTitle = () => {
    if (pathname === "/app/home") {
      return t("dashboard");
    }
    if (pathname === "/app/calendar") {
      return t("calendar");
    }
    if (pathname === "/app/profile") {
      return t("myProfile");
    }

    if (pathname.includes("/board")) {
      return t("board");
    }
    if (pathname.includes("/chat")) {
      return t("aiAssistant");
    }

    if (pathname.startsWith("/app/") && pathname !== "/app/home" && pathname !== "/app/calendar" && pathname !== "/app/profile") {
      return t("project");
    }

    return null;
  };

  const pageTitle = getCurrentPageTitle();

  return (
    <header className="bg-background border-b border-border sticky top-0 z-10 dark:bg-background dark:border-border">
      <div className="flex items-center justify-between px-6 py-5 lg:px-8 pl-16 lg:pl-8">
        <div className="flex items-center gap-4 lg:hidden">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt={t("smartTask")} width={40} height={40} className="object-contain" />
            <h1 className="text-2xl font-momo text-foreground">
              {t("smartTask")}
            </h1>
          </div>
        </div>

        {pageTitle && (
          <div className="hidden lg:block">
            <h1 className="text-4xl font-semibold text-foreground">
              {pageTitle}
            </h1>
          </div>
        )}

        {!pageTitle && <div className="hidden lg:block"></div>}

        <div className="flex items-center">
          <NotificationDropdown />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 sm:h-13 sm:w-13 hover:bg-transparent"
                aria-label={t("settings")}
              >
                <Settings className="w-5.5! h-5.5! text-muted-foreground hover:text-foreground transition-colors" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setLanguageModalOpen(true)} className="cursor-pointer">
                <Languages className="w-4 h-4 mr-2" />
                {t("changeLanguage")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setThemeModalOpen(true)} className="cursor-pointer">
                <Palette className="w-4 h-4 mr-2" />
                {t("changeTheme")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 sm:gap-3 ml-1 sm:ml-2 p-1.5 sm:p-2 rounded-lg hover:bg-accent transition-colors focus:outline-none">
                <Avatar className="w-9 h-9 sm:w-10 sm:h-10">
                  {profile?.avatarPath && (
                    <AvatarImage src={profile.avatarPath} alt={getDisplayName()} />
                  )}
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm sm:text-base">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm sm:text-base font-medium text-foreground">
                  {getDisplayName()}
                </span>
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleNavigateToProfile} className="cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                {t("profile")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50">
                <LogOut className="w-4 h-4 mr-2" />
                {t("logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <LanguageModal
        open={languageModalOpen}
        onOpenChange={setLanguageModalOpen}
      />

      <ThemeModal
        open={themeModalOpen}
        onOpenChange={setThemeModalOpen}
      />
    </header>
  );
};

export default Navbar;
