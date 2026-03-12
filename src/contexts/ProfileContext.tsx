"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getProfile } from "@/services/api";

interface Profile {
  firstName: string;
  lastName: string;
  nickname?: string;
  avatarPath?: string;
}

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  getInitials: () => string;
  getDisplayName: () => string;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getProfile();
      const data = response.data.data;
      setProfile({
        firstName: data.first_name,
        lastName: data.last_name,
        nickname: data.nickname,
        avatarPath: data.avatar_path,
      });
    } catch (err) {
      setError("profile.cannotLoadProfile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const getInitials = useCallback(() => {
    if (!profile) return "U";
    const firstInitial = profile.firstName?.charAt(0) || "";
    const lastInitial = profile.lastName?.charAt(0) || "";
    return (firstInitial + lastInitial).toUpperCase();
  }, [profile]);

  const getDisplayName = useCallback(() => {
    if (!profile) return "User";
    return profile.nickname || profile.firstName || "User";
  }, [profile]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        error,
        refreshProfile: fetchProfile,
        getInitials,
        getDisplayName,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
