import React from "react";
import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";
import "../../styles/auth/login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault(); // フォームが送信されたときにページがリロードされるのを防ぐ

    //ログインリクエストをサーバーに送信;
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    // Supabaseのクライアントを直接使用してログイン
    const { error, supdata } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("ログインエラー: ", error.message);
      alert("ログインに失敗しました。");
    } else {
      localStorage.setItem("supabaseSession", JSON.stringify(data.session));
      const property = data.session.user.user_metadata.property;
      const pagePath = "/";

      router.push({
        pathname: "/dashboard",
        //  query: { property },
      });
    }

    if (res.ok) {
      // session情報をlocalStorageに保存
      //   localStorage.setItem("supabaseSession", JSON.stringify(data.session))
      // ログイン成功時，ダッシュボードへリダイレクト
      console.log("Session: ", data.session);
      //   await router.push("/dashboard")
      // console.log("Data: ", data);
    } else {
      // ログイン失敗時，エラーメッセージを表示
      setError(data.message);
    }
  };

  return (
    <div className="register-content">
      {/* ログインフォーム */}
      <div className="login-form">
        <h1 className="login-text">ログイン</h1>
        {error && <p className="error-message">{error}</p>}
        <form className="main-form" onSubmit={handleLogin}>
          <div className="email-form">
            <label htmlFor="email" className="email-text">
              メール
            </label>
            <input
              type="email"
              id="email"
              className="email-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="password-form">
            <label htmlFor="password" className="password-text">
              パスワード
            </label>
            <input
              type="password"
              id="password"
              className="password-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => router.push("/auth/register")}
              className="forget-password"
            >
              パスワードを忘れた方はこちらから
            </button>
            <button type="submit" className="login-button">
              ログイン
            </button>
          </div>
          <button
            onClick={() => router.push("/auth/register")}
            type="button"
            className="register-button"
          >
            新規登録はこちら
          </button>
        </form>
      </div>
    </div>
  );
}
