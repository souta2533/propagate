import React from "react";
import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/setting/urlSetting.css";

export default function UrlSetting() {
  const [url, setUrl] = useState("");
  const router = useRouter();

  return (
    <div className="urlsetting-container">
      <div className="urlsetting-form">
        <h1 className="url-text">URL設定ページ</h1>
        <form className="main-form">
          <div className="url-form">
            <input
              type="url"
              id="url"
              className="url-input"
              value={url}
              onChage={(e) => setUrl(e.target.value)}
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
