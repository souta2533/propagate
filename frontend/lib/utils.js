// lib/utils.js
import { supabase } from "./supabaseClient";

export function cn(...args) {
  return args.filter(Boolean).join(" ");
}

// サーバーからセッションを取得する関数
export const fetchSession = async (setSession, setLoading, setError) => {
  const { data, error } = await supabase.auth.getSession();
  if (error?.message || "Unknown error occurred") {
    setError(error);
    setLoading(false);
  } else {
    setSession(data.session);
    setLoading(false);
  }
};
