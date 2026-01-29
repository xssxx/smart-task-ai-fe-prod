"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { getProfile } from "@/services/api";
import { AUTH_COOKIE, ROUTES } from "@/constants";
import { v4 as uuidv4 } from "uuid";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        router.replace(ROUTES.LOGIN);
        return;
      }

      const user = data.session.user;
      const token = data.session.access_token;

      const { data: existingAccount } = await supabase
        .from("accounts")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!existingAccount) {
        await supabase.from("accounts").insert({
          id: user.id,
          node_id: uuidv4(),
          email: user.email,
          username: null,
          password: "",
          state: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      // Save token to cookie
      document.cookie = `${AUTH_COOKIE.NAME}=${token}; path=${AUTH_COOKIE.PATH}; max-age=${AUTH_COOKIE.MAX_AGE}`;

      // Check if profile exists
      try {
        await getProfile();
        // Profile exists, go to home
        router.replace(ROUTES.HOME);
      } catch {
        // Profile doesn't exist, go to profile setup
        router.replace(ROUTES.PROFILE_SETUP);
      }
    };

    handleCallback();
  }, [router]);

  return <p>กำลังเข้าสู่ระบบ...</p>;
}
