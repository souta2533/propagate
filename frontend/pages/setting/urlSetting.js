import React from "react";
import { useState } from "react";
import { useRouter } from "next/router";
import Button from "@mui/material/Button";
import styles from "../../styles/setting/urlSetting.css";

export default function UrlSetting() {
  const [url, setUrl] = useState("");
  const router = useRouter();

  // URL登録処理の実装
  const handleUrl = (e) => {
    e.preventDefault(); // フォーム送信時のページリロードを防止
    if (url) {
      console.log("登録されたURL: ", url);
      alert(`URL: ${url} が登録されました！`);

      //登録されたURLをlocalStorageに保存
      const storedUrls = JSON.parse(localStorage.getItem("urlOptions")) || [];
      const newUrl = { lavel: url, value: url };
      storedUrls.push(newUrl);
      localStorage.setItem("urlOptions", JSON.stringify(storedUrls));

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
            <Button
              className="register-button"
              type="submit"
              onClick={() => handleUrl}
            >
              登録
            </Button>
            <Button
              onClick={() => router.push("/dashboard")}
              type="button"
              className="dashboard-button"
            >
              ホームへ戻る
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
