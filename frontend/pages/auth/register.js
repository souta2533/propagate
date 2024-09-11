import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";
import "../../styles/register.css";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();

    // SupabaseでUser登録
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(
        "Registration successful! Please check your email for verification."
      );
      setEmail("");
      setPassword("");

      // 登録したユーザー情報をバックエンドに送信
      const response = await fetch("/api/register-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      if (!response.ok) {
        console.error("Failed to register user on the backend");
      }

      // 登録後にダッシュボードへリダイレクト
      router.push("/dashboard");
    }
  };

  return (
    <div className="container flex-center">
      {/* 右上にログインリンクを配置 */}
      <Link href="/login" className="login-link">
        ログインはこちら
      </Link>
      <div className="form-container">
        <h1 className="text-center">新規会員登録</h1>
        {error && <p className="error-msg">{error}</p>}
        {success && <p className="success-msg">{success}</p>}
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-btn">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
