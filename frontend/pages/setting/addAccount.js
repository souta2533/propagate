import React from "react";
import { useState } from "react";
import { useRouter } from "next/router";
import Button from "@mui/material/Button";

import styles from "../../styles/setting/addAccount.css";

const addAccount = () => {
  const [account, setAccount] = useState();
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(null);
  const router = useRouter();

  return (
    <div className="register-container">
      <div className="register-form">
        <h1 className="register-text">新規アカウント登録</h1>
        {error && <p className="error-msg">{error}</p>}
        <form className="main-form">
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
          <Button type="submit" className="register-button">
            新規アカウント登録
          </Button>
        </form>
        <Button
          onClick={() => router.push("/dashboard")}
          type="button"
          className="dashboard-button"
        >
          ホームへ戻る
        </Button>
      </div>
    </div>
  );
};
export default addAccount;
