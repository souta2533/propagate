import React from "react";
import { useState } from "react";
import { useRouter } from "next/router";
import Button from "@mui/material/Button";
import styles from "../../styles/setting/logout.css";

export default function UrlSetting() {
  const [url, setUrl] = useState("");
  const [password, setPassword] = useState();
  const router = useRouter();

  return (
    <div className="urlsetting-container">
      <div className="urlsetting-form">
        <h1 className="url-text">ログアウト</h1>
        <form className="main-form">
          <div className="url-form">
            <label htmlFor="email" className="text-group">
              メール
            </label>
            <input
              type="email"
              id="email"
              className="input-group"
              value={url}
              onChage={(e) => setUrl(e.target.value)}
              placeholder=""
              required
            />
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
            <Button
              className="logout-button"
              type="submit"
              onClick={() => handleUrl}
            >
              ログアウト
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
