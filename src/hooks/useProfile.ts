import { useState, useEffect } from "react";
import { getProfile } from "@/services/api";

interface Profile {
  firstName: string;
  lastName: string;
  nickname?: string;
  avatarPath?: string;
}

/**
 * Custom hook for managing user profile
 */
export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
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
        setError("ไม่สามารถโหลดข้อมูลโปรไฟล์ได้");
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

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

  return {
    profile,
    loading,
    error,
    getInitials,
    getDisplayName,
  };
}
