import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";
import "../../styles/auth/register.css";

const Register = () => {
  const [showUrlRegister, setShowUrlRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [url, setUrl] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();

    // SupabaseでUser登録
    const { data, error } = await supabase.auth.signUp({
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

      // 登録したユーザー情報をバックエンドに送信(auth.uid(user.id))
      const userId = data.user.id;
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${apiUrl}/register-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          userId: userId,
        }),
      });

      if (!response.ok) {
        console.error("Failed to register user on the backend");
        return;
      }

      // 登録後にダッシュボードへリダイレクト
      router.push("/dashboard");
    }
  };

  const handleUrlRegister = () => {};

  return (
    <div
      className={`register ${
        showUrlRegister ? "slide-visible" : "slide-hidden"
      }`}
    >
      <div className="register-container">
        <div className="register-form">
          <h1 className="register-text">新規会員登録</h1>
          {/*{error && <p className="error-msg">{error}</p>}
          {success && <p className="success-msg">{success}</p>}*/}
          <form className="main-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="email" className="text-group">
                メール
              </label>
              <input
                type="email"
                id="email"
                className="input-group"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password" className="text-group">
                パスワード
              </label>
              <input
                type="password"
                id="password"
                className="input-group"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="button"
              className="register-button"
              onClick={() => setShowUrlRegister(true)}
            >
              新規登録
            </button>
          </form>
          <button
            onClick={() => router.push("/auth/login")}
            type="button"
            className="login-button"
          >
            ログインはこちら
          </button>
        </div>
      </div>
      <div className="url-register-container">
        <div className="register-form">
          <h1 className="register-text">URL登録</h1>
          <form className="main-form" onSubmit={handleUrlRegister}>
            <div className="form-group">
              <label htmlFor="url" className="text-group">
                URL登録
              </label>
              <input
                type="url"
                id="url"
                className="input-group"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="register-button">
              URL登録
            </button>
          </form>
          <button
            onClick={() => setShowUrlRegister(false)}
            type="button"
            className="login-button"
          >
            戻る
          </button>
        </div>
      </div>
    </div>
  );
};
export default Register;
