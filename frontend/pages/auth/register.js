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
  const [userId, setUserId] = useState(null);
  const router = useRouter();

  // URLの形式を検証する関数
  const isValidUrl = (string) => {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

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
      setUserId(data.user.id);
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
      //正常に登録されたらURL追加画面に遷移する
      setShowUrlRegister(true);
    }
  };

  const handleUrlRegister = async (event) => {
    event.preventDefault();

    // URL形式が正しいかどうかの検証
    if (!isValidUrl(url)) {
      alert("有効なURLを入力してください");
      return;
    }

    if (!url) {
      alert("登録するURLを入力してください");
      return;
    }

    try {
      const { data, error } = await supabase.from("PropertyTable").insert([
        {
          url: url,
          user_id: userId,
        },
      ]);

      if (error) {
        console.log("Error inserting URL:", error);
        alert("URL登録中にエラーが発生しました。:");
      } else {
        console.log("データが正常に挿入されました:", data);
        alert("URLが正常に追加されました。");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Exception occurred while inserting data:", error);
      return;
    }
  };

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
            <button type="submit" className="register-button">
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
