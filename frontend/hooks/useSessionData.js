import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';


export const useSessionData = () => {
  const [fetchedSession, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  //完全にデータの取得が完了するまで待つ必要はないのか？待てているのか　yamasaki
  useEffect(() => {
    // 初期セッションを取得
    const getInitialSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error);
      } else {
        setSession(data.session);
      }
      setLoading(false);
    };

    getInitialSession();

    // セッションの状態変化を監視
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    // クリーンアップ
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return { fetchedSession, loading };
};
