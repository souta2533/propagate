import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import { handlerUrlSubmit } from "../lib/submitHandler";
import { Home, BarChart2, FileText, Search, Settings } from "lucide-react";
import { FaBars, FaTimes } from "react-icons/fa";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/Select";

import "../styles/dashboard.css";

const Dashboard = () => {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);         // エラーの状態を管理
  const [loading, setLoading] = useState(true);     // ローディング中かどうかの状態を管理
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
  const [activeMetric, setActiveMetric] = useState("PV"); // 初期値を"PV"に設定
  const [selectedMetric, setSelectedMetric] = useState("PV");
  const [dateRange, setDateRange] = useState("過去28日間");

  /*サイドバーの状態を保持する */
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  /*グラフの状態を保持する */
  const handleMetricChange = (value) => {
    setSelectedMetric(value);
  };

  // Sessionを取得
  useEffect(() => {
    const fetchSession = async () => {
        const { data, error } = await supabase.auth.getSession();

        if (error || !data?.session) {
            console.error('Error fetching session: ', error);
            setError(error);
            setLoading(false);
            return;
        }

        setSession(data.session);
        setLoading(false);
    };

    fetchSession();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // ローディング中の表示
  }

  if (error) {
    return <div>Error: {error}</div>; // エラー時の表示
  }

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

  /*新しいダッシュボード */
  /*Sidebarコンポーネント*/
  const Sidebar = ({ isOpen }) => (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="menu-list">
        <Button variant="ghost" className="menu-button">
          <Home className="icon" />
          <div className="icon-text">ホーム</div>
        </Button>
        <Button
          variant="ghost"
          onClick={() => router.push("/details")}
          className="menu-button"
        >
          <BarChart2 className="icon" />
          <div className="icon-text">ページ別状況</div>
        </Button>

        <Button variant="ghost" className="menu-button">
          <FileText className="icon" />
          <div className="icon-text">アナリティクスレポート</div>
        </Button>
      </div>
    </div>
  );

  /*Sidebarが開いているときに他の箇所を暗くする */
  const Overlay = ({ isOpen, toggleMenu }) => (
    <div
      className={`overlay ${isOpen ? "visible" : ""}`}
      onClick={toggleMenu}
    ></div>
  );

  // Dropdown コンポーネント
  const Dropdown = ({ isOpen }) => {
    return (
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="menu-list">
          <button className="menu-button">ホーム</button>
          <button className="menu-button">アナリティクス</button>
          {/* 追加のメニューボタン */}
        </div>
      </div>
    );
  };

  const Header = () => (
    <header className="header">
      <div className="header-left">
        <div className="hamburger-icon" onClick={toggleMenu}>
          {isOpen ? <FaTimes size={30} /> : <FaBars size={30} />}
        </div>
        <h1 className="header-title">Propagate Analytics</h1>
        <Input
          type="text"
          placeholder="https://www.propagateinc.com/"
          className="header-input"
        />
      </div>
      <Button size="icon" variant="ghost" className="header-button">
        <Settings className="icon" />
        <span className="sr-only">Settings</span>
      </Button>
    </header>
  );

  const MetricCard = ({ title, value, target, isActive, onClick }) => (
    <div
      className={`metric-card ${isActive ? "active" : ""}`} // アクティブなカードにクラスを追加
      onClick={onClick} // カードがクリックされたときに処理を実行
    >
      <div className="metric-card-header">
        <h3>{title}</h3>
      </div>
      <div className="metric-card-content">
        <div className="metric-value">{value.toLocaleString()}</div>
      </div>
    </div>
  );

  const data = [
    { name: "8/15", value: 4000 },
    { name: "8/20", value: 3000 },
    { name: "8/25", value: 2000 },
    { name: "8/30", value: 2780 },
    { name: "9/4", value: 1890 },
    { name: "9/9", value: 2390 },
    { name: "9/11", value: 3490 },
  ];

  const renderChart = () => {
    switch (selectedMetric) {
      case "PV":
        return <LineChartComponent />;
      case "CV":
        return <BarChartComponent />;
      case "CVR":
      case "SS":
        return <BarChartComponent dataKey="value" />;
      default:
        return <LineChartComponent />;
    }
  };

  const LineChartComponent = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const BarChartComponent = ({ dataKey }) => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );

  const SearchKeyword = ({ keyword, count }) => (
    <div className="search-keyword">
      <Search className="search-icon" />
      <div className="search-info">
        <p className="search-keyword-text">{keyword}</p>
        <p className="search-count-text">{count}回の検索結果</p>
      </div>
    </div>
  );

  const metrics = [
    { title: "PV (ページ閲覧数)", value: 23450, target: 1000, difference: 143 },
    {
      title: "CV (お問い合わせ数)",
      value: 23450,
      target: 1000,
      difference: -6,
    },
    {
      title: "CVR (お問い合わせ率)",
      value: 3.55,
      target: 2.55,
      difference: 1.34,
    },
    {
      title: "SS(セッション数)",
      value: 12345,
      targe: 23456,
      difference: 11111,
    },
  ];

  const searchKeywords = [
    { keyword: "サブスクホームページ制作", count: 3280 },
    { keyword: "東京都Webデザイン会社", count: 2345 },
    { keyword: "プロパゲート", count: 1034 },
  ];

  // ダッシュボードの内容を記載
  /*return (
      {/* Account ID の選択ドロップダウン */
  {
    /*{accountIds.length > 0 && (
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
      )}*/
  }
  {
    /* Property ID の選択ドロップダウン */
  }
  {
    /*{filteredProperties.length > 0 ? (
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
      )}*/
  }
  {
    /* URLとProperty IDの入力と送信ボタン */
  }
  {
    /*<div className="form-section">
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
      </div>
      */
  }

  return (
    <div className="dashboard-container">
      <Header />

      {/* オーバーレイの追加 */}
      <Overlay isOpen={isOpen} toggleMenu={toggleMenu} />

      <main className="dashboard-main">
        {/* サイドバーの表示制御 */}
        <Sidebar isOpen={isOpen} className="sidebar" />
        <div className="dashboard-main-left">
          <div className="dashboard-header">
            <h2 className="dashboard-title">アナリティクスデータ</h2>
            <Select
              value={dateRange}
              onValueChange={setDateRange}
              className="dashboard-select"
            >
              <SelectTrigger className="select-trigger">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent className="select-content">
                <SelectItem value="過去7日間">過去7日間</SelectItem>
                <SelectItem value="過去28日間">過去28日間</SelectItem>
                <SelectItem value="過去90日間">過去90日間</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="dashboard-main-right">
            <div className="chart-content">
              <div className="metrics-grid">
                {metrics.map((metric, index) => (
                  <MetricCard
                    key={index}
                    title={metric.title}
                    value={metric.value}
                    isActive={selectedMetric === metric.title} // 選択されているかどうかを判定
                    onClick={() => setSelectedMetric(metric.title)} // クリックで選択メトリクスを変更
                  />
                ))}
              </div>
              <Card className="chart-card">
                <CardContent className="chart-card-content">
                  <CardContent className="chart-card-content">
                    {renderChart()}{" "}
                    {/* ここで選択されたメトリクスに応じたグラフを表示 */}
                  </CardContent>
                </CardContent>
              </Card>
              <div className="dashboard-details">
                <button
                  onClick={() => router.push("/details")}
                  className="details-button"
                >
                  ページ別詳細はこちら
                </button>
              </div>
            </div>
            <div className="dashboard-sidebar">
              <h3 className="sidebar-title">検索キーワード</h3>
              <div className="search-keywords">
                {searchKeywords.map((keyword, index) => (
                  <SearchKeyword key={index} {...keyword} />
                ))}
              </div>
            </div>
          </div>
          <div className="suggest-space"></div>
        </div>
      </main>
    </div>
  );
};
export default Dashboard;
