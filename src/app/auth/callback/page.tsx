"use client";
import { supabase } from "@/lib/supabase/client";
import { useEffect } from "react";

export default function Callback() {
  useEffect(() => {
    supabase.auth.getSession();
  }, []);

  return <p>กำลังเข้าสู่ระบบ...</p>;
}
