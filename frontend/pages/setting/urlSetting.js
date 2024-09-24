import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/setting/urlSetting.css";

export default function UrlSetting() {
  const [url, setUrl] = useState("");
  const [urlList, setUrlList] = useState([]);
  const router = useRouter();

  // URLリストに新しいURLを追加する関数
  const addUrlToList = (newUrl) => {
    if (newUrl && !urlList.includes(newUrl)) {
      setUrlList((prevList) => [...prevList, newUrl]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url) {
      alert("URLを入力してください");
      return;
    }

    addUrlToList(url);

    console.log("登録されたURL:", url);

    //送信
    router.push({
      pathname: "/dashboard",
      query: { url: encodeURIComponent(url) },
    });
  };

  return (
    <div className="urlsetting-container">
      <form className="urlsetting-form" onSubmit={handleSubmit}>
        <h1 className="url-text">URL設定ページ</h1>
        <div className="url-form">
          <input
            type="url"
            className="url-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="登録するURLを入力してください"
          />
          <button className="register-button" type="submit">
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
  );
}
