import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import { handlerUrlSubmit } from "../lib/submitHandler";
import "../styles/dashboard.css";
import Link from "next/link";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css"; // 必要なスタイルを読み込み
config.autoAddCss = false; // 自動的にスタイルを追加しないようにする
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; /*sidebarのアイコンをimport*/
import {
  faHome,
  faFileAlt,
  faChartBar,
} from "@fortawesome/free-solid-svg-icons";

const Dashboard = () => {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [accountIds, setAccountIds] = useState([]);
  const [propertyIds, setPropertyIds] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [searchConsoleData, setSearchConsoleData] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  // ここにセットされるデータ（必要かも？）
  const [pathList, setPathList] = useState([]); // pathListの状態を管理
  const [selectedPagePath, setSelectedPagePath] = useState("");
  const [propertyId, setPropertyId] = useState(""); // Property ID(URLと一生に送信する用)の状態を管理
  const [url, setUrl] = useState(""); // URLの状態を管理
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("PV");

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  //sidebarを開く関数
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      // 1. localStorageからセッションを取得
      const { data, error } = await supabase.auth.getSession();
      if (error || !data) {
          console.error('Error fetching session:', error);
          return;
      }

      const sessionData = data.session;

      if (!sessionData) {
        // router.push('/auth/login');
      } else {
        setSession(sessionData);
      }

      // 2. Userのemailを取得
      const email_customer = sessionData.user.email;

      // 3. CustomerDetailsTableからaccountIdを取得
      const { data: customerDetailsData, error: customerDetailsError } =
        await supabase
          .from("CustomerDetailsTable")
          .select("accounts_id")
          .eq("email_customer", email_customer);

      if (customerDetailsError) {
        console.error("Error fetching accountIds:", customerDetailsError);
        return;
      }

      const accountIds = customerDetailsData.map((item) => item.accounts_id);
      setAccountIds(accountIds); // ['1', '2']
      console.log("AccountIds: ", accountIds);

      if (accountIds.length > 0) {
        setSelectedAccountId(accountIds[0]);
      }

      // 4. PropertyTableからpropertyIdを取得
      const { data: allProperties, error: propertyError } = await supabase
        .from("PropertyTable")
        .select("properties_id, properties_name, account_id")
        .in("account_id", accountIds);

      if (propertyError) {
        console.error("Error fetching property ids:", propertyError);
        return;
      }
      // console.log('Properties: ', allProperties);

      setPropertyIds(allProperties); // [{account_id, properties_id, properties_name}]

      // 最初のaccountIdに紐づくpropertyIdを取得
      if (accountIds.length > 0) {
        const initialFilteredProperties = allProperties.filter(
          (p) => p.account_id === accountIds[0]
        );
        setFilteredProperties(initialFilteredProperties);
        if (initialFilteredProperties.length > 0) {
          setSelectedProperty(initialFilteredProperties[0]); // {account_id, properties_id, properties_name}
        }
      }

      // 5. GoogleAnalyticsDataのデータを取得
      const propertyIds = allProperties.map((p) => p.properties_id);
      const { data: allAnalytics, error: analyticsError } = await supabase
        .from("AnalyticsData")
        .select("*")
        .in("property_id", propertyIds);

      if (analyticsError) {
        console.error("Error fetching analytics data:", analyticsError);
        return;
      }

      setAnalyticsData(allAnalytics);
      console.log("Analytics: ", allAnalytics);

      // pagePathのリストを取得
      const pathList = new Set(allAnalytics.map((item) => item.page_path));
      console.log("PathList: ", pathList);
    };

    fetchAnalyticsData();
  }, [router]);

  useEffect(() => {
    /**
     *  以下ではGoogle Search Consoleのデータを取得する処理を追加
     */
    const fetchSearchConsoleData = async () => {
      try {
        console.log("PropertyIds: ", propertyIds);
        // 全てのPropertyIDからSearch Consoleのデータを取得
        let allSearchConsoleData = {};

        for (const property of propertyIds) {
          const { properties_id } = property;

          const { data, error: searchConsoleError } = await supabase
            .from("SearchConsoleDataTable")
            .select("*")
            .eq("property_id", properties_id)
            .limit(1000);

          if (searchConsoleError) {
            console.error(
              "Error fetching search console data:",
              searchConsoleError
            );
            continue;
          }

          // 取得したデータを辞書形式に追加
          allSearchConsoleData[properties_id] = data;
        }
        console.log("Search Console Data: ", allSearchConsoleData);

        setSearchConsoleData(allSearchConsoleData);
      } catch (error) {
        console.error("Error fetching search console data:", error);
      }
    };
    fetchSearchConsoleData();
  }, [propertyIds]);

  const handleAccountChange = (e) => {
    const selectedAccountId = e.target.value;
    setSelectedAccountId(selectedAccountId);

    // 選択されたaccountIdに紐づくpropertyIdを取得
    const newFilteredProperties = propertyIds.filter(
      (property) => property.account_id === selectedAccountId
    );
    setFilteredProperties(newFilteredProperties);

    if (newFilteredProperties.length > 0) {
      setSelectedProperty(newFilteredProperties[0]);
    } else {
      setSelectedProperty(null);
    }
  };

  const handlePropertyChange = (e) => {
    const selectedPropertyId = e.target.value;
    const property = filteredProperties.find(
      (p) => p.properties_id === selectedPropertyId
    );
    setSelectedProperty(property);
  };

  // URLの送信処理
  const handleSubmit = (e) => {
    e.preventDefault();
    handlerUrlSubmit(
      session.user.email,
      propertyId,
      url,
      setPropertyId,
      setUrl
    );
  };

  // ダッシュボードの内容を記載
  return (
    <div className="main-content">
      <h1>Dashboard</h1>
      {/* Account ID の選択ドロップダウン */}
      {/*{accountIds.length > 0 && (
        <div className="select-section">
          <label htmlFor="accountId">Select Account ID</label>
          <select
            id="accountId"
            value={selectedAccountId || ""}
            onChange={handleAccountChange}
          >
            {accountIds.map((accountId) => (
              <option key={accountId} value={accountId}>
                {accountId}
              </option>
            ))}
          </select>
        </div>
      )}*/}

      {/* Property ID の選択ドロップダウン */}
      {/*{filteredProperties.length > 0 ? (
        <div className="select-section">
          <h2>Analytics Properties:</h2>
          <label htmlFor="propertyId">Select Property ID</label>
          <select
            id="propertyId"
            value={selectedProperty ? selectedProperty.properties_id : ""}
            onChange={handlePropertyChange}
          >
            {filteredProperties.map((prop) => (
              <option key={prop.properties_id} value={prop.properties_id}>
                {prop.properties_name}
              </option>
            ))}
          </select>

          {selectedProperty && (
            <div>
              <p>
                <strong>Selected Account ID:</strong>{" "}
                {selectedProperty.account_id}
              </p>
              <p>
                <strong>Selected Property ID:</strong>{" "}
                {selectedProperty.properties_id}
              </p>
            </div>
          )}
        </div>
      ) : (
        <p>No Analytics properties found for this account.</p>
      )}*/}

      {/* URLとProperty IDの入力と送信ボタン */}
      {/*<div className="form-section">
        <h2>Submit Property ID and URL:</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="propertyId">Enter Property ID</label>
          <input
            id="propertyId"
            type="text"
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            placeholder="Property ID"
            required
          />

          <label htmlFor="url">Enter URL</label>
          <input
            id="url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            required
          />

          <button type="submit">Submit</button>
        </form>
      </div>*/}

      {/* カード表示 */}
      <div className="card-container">
        <div className="card">
          <h2>PV (ページ訪問者数)</h2>
          <p>Search for Data...</p>
        </div>
        <div className="card">
          <h2>CV (お問い合わせ数)</h2>
          <p>Search for Data...</p>
        </div>
        <div className="card">
          <h2>UU (ページ訪問者数)</h2>
          <p>Search for Data...</p>
        </div>

        <aside className="sidebar">
          <div className="logo">
            <h1 className="sidebar-name">Propagate Analytics</h1>
          </div>
          <nav className="sidebar-nav">
            <ul>
              <li>
                <Link href="/dashboard" legacyBehavior>
                  <a>
                    <FontAwesomeIcon icon={faHome} />
                    ホーム
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/" legacyBehavior>
                  <a>
                    <FontAwesomeIcon icon={faFileAlt} />
                    ページ別状況
                  </a>
                </Link>
              </li>
              <li className="dropdown">
                <button className="dropdown-btn" onClick={toggleDropdown}>
                  <FontAwesomeIcon icon={faChartBar} /> アナリティクスレポート
                </button>
                <div className={`dropdown-content ${isOpen ? "open" : ""}`}>
                  <a href="#">PVレポート</a>
                  <a href="#">CVレポート</a>
                  <a href="#">UUレポート</a>
                </div>
              </li>
            </ul>
          </nav>
        </aside>
      </div>

      {/*グラフ領域*/}
      <div class="graph-container">
        <div class="graphcard-container">
          <button
            className={`graphcard ${activeTab === "PV" ? "active" : ""}`}
            onClick={() => setActiveTab("PV")}
          >
            <h2>PV (ページ訪問者数)</h2>
            <p>Search for Data...</p>
          </button>
          <button
            className={`graphcard ${activeTab === "CV" ? "active" : ""}`}
            onClick={() => setActiveTab("CV")}
          >
            <h2>CV (お問い合わせ数)</h2>
            <p>Search for Data...</p>
          </button>

          <button
            className={`graphcard ${activeTab === "UU" ? "active" : ""}`}
            onClick={() => setActiveTab("UU")}
          >
            <h2>UU (ページ訪問者数)</h2>
            <p>Search for Data...</p>
          </button>

          <button
            className={`graphcard ${activeTab === "SS" ? "active" : ""}`}
            onClick={() => setActiveTab("SS")}
          >
            <h2>SS (セッション数)</h2>
            <p>Search for Data...</p>
          </button>
        </div>

        <div id="chart-space">
          {activeTab === "PV" && <div>PVに関連するデータを表示</div>}
          {activeTab === "CV" && <div>CVに関連するデータを表示</div>}
          {activeTab === "UU" && <div>UUに関連するデータを表示</div>}
          {activeTab === "SS" && <div>SSに関連するデータを表示</div>}
        </div>

        {/*右下に詳細ページへのボタンを追加*/}
        <div className="detail-link">
          <Link href="/details">
            <button classNeme="detail-button">詳細ページ</button>
          </Link>
        </div>
      </div>

      <main className={`main-content ${isSidebarOpen ? "shifted" : ""}`}></main>

      {/*ハンバーガーメニュー*/}
      <div className="dashboard-container">
        <button className="hamburger" onClick={toggleSidebar}>
          ☰
        </button>
        <div className={`sidebar ${isSidebarOpen ? "active" : ""}`}>
          <ul>
            <li>
              <a href="#">ホーム</a>
            </li>
            <li>
              <a href="#">ページ別状況</a>
            </li>
            <li>
              <a href="#">アナリティクスレポート</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
