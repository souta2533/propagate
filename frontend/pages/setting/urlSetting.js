import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSessionData } from "../../hooks/useSessionData";
import { handlerUrlSubmit } from "../../lib/submitHandler";
import Button from "@mui/material/Button";
import styles from "../../styles/setting/urlSetting.css";

export default function UrlSetting() {
  const [url, setUrl] = useState("");
  const [urlList, setUrlList] = useState([]);
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [newUrl, setNewUrl] = useState("");

  // Sessionの取得
const { fetchedSession, loading: sessionLoading } = useSessionData();
useEffect(() => {
  if (sessionLoading) return; // sessionがないかロード中の場合は何もしない

  if (!fetchedSession) {
    router.push("/auth/login");
    return;
  }

  if (fetchedSession) {
    console.log("Fetched Session: ", fetchedSession);
    setSession(fetchedSession);
  }
}, [router, fetchedSession, sessionLoading]);

useEffect(() => {
  const sessionUser = "user";
  const appMetadata = "app_metadata";
  const sessionEmail = "email";
  if (session && session[sessionUser] && session[sessionUser][appMetadata]) {
    const userEmail = session[sessionUser][sessionEmail];
    setEmail(userEmail);
  } else {
    console.log("Session or sessionUser is null");
  }
},[session]);



  // URL登録処理の実装
  const handleUrl = (e) => {
    e.preventDefault(); // フォーム送信時のページリロードを防止

    handlerUrlSubmit(email, url, setNewUrl);

    if (url) {
      console.log("登録されたURL: ", url);
      alert(`URL: ${url} が登録されました！`);

      //登録されたURLをlocalStorageに保存
      const storedUrls = JSON.parse(localStorage.getItem("urlOptions")) || [];
      const newUrl = { label: url, value: url };
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
      <form className="urlsetting-form" onSubmit={handleSubmit}>
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
