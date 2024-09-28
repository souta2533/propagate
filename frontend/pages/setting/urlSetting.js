import React from "react";
import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/setting/urlSetting.css";

export default function UrlSetting() {
  const [url, setUrl] = useState("");
  const router = useRouter();

  // URL登録処理の実装
  const handleUrl = (e) => {
    e.preventDefault(); // フォーム送信時のページリロードを防止
    if (url) {
      // URLの登録ロジックをここに追加
      console.log("登録されたURL: ", url);
      alert(`URL: ${url} が登録されました！`);
      // 登録後にdashboardへリダイレクト
      router.push({
        pathname: "/dashboard",
        query: { url: encodeURIComponent(url) },
      });
    } else {
      alert("URLを入力してください。");
    }
  };

  return (
    <div className="urlsetting-container">
      <div className="urlsetting-form">
        <h1 className="url-text">URL設定ページ</h1>
        <form className="main-form" onSubmit={handleUrl}>
          <div className="url-form">
            <input
              type="url"
              id="url"
              className="url-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="登録するURLを入力してください"
              required
            ></input>
            <button
              className="register-button"
              type="submit"
              onClick={() => handleUrl}
            >
              登録
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              type="button"
              className="dashboard-button"
            >
              ホームへ戻る
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
