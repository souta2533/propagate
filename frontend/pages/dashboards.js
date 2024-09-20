import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DateRange from "../components/ui/DateRange"; // 日付範囲選択のコンポーネント
import { Card, CardContent } from "../components/ui/Card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "../components/ui/Select";
import Sidebar from "../components/ui/Sidebar";
import Header from "../components/ui/Header";
import MetricCard from "../components/ui/MetricCard";
import Overlay from "../components/ui/Overlay";
import LineChart from "../components/graph/LineChart";
import BarChart from "../components/graph/BarChart";
import PieChart from "../components/graph/PieChart";

import "../styles/dashboard.css";

const PropertyIds = [
  // サンプルデータをここに配置
  {
    properties_id: "424732958",
    properties_name: "Yuya",
    account_id: "300168308",
    url: null,
  },
  {
    properties_id: "428269691",
    properties_name: "gatest",
    account_id: "300168308",
    url: null,
  },
  {
    properties_id: "359877627",
    properties_name: "propagateGA4",
    account_id: "324522818",
    url: "https://www.propagateinc.com/",
  },
  {
    properties_id: "425610688",
    properties_name: "propagate-tfc.tokyo",
    account_id: "300168308",
    url: "",
  },
  {
    properties_id: "453492841",
    properties_name: "AnalyticsTest",
    account_id: "324522818",
    url: "",
  },
  {
    properties_id: "452842721",
    properties_name: "Propagate Analytics",
    account_id: "300168308",
    url: "https://www.propagate-fsk.tokyo/",
  },
];

const analytics = [
  {
    properties_id: "359877627",
    date: "2023-09-01",
    screen_page_views: 100,
    conversions: 5,
    sessions: 80,
  },
  {
    properties_id: "359877627",
    date: "2023-09-02",
    screen_page_views: 200,
    conversions: 10,
    sessions: 150,
  },
  {
    properties_id: "452842721",
    date: "2023-09-01",
    screen_page_views: 50,
    conversions: 2,
    sessions: 40,
  },
  // 他のプロパティのデータ...
];

const findPropertyIdByUrl = (url) => {
  let propertyId = null;

  for (let i = 0; i < PropertyIds.length; i++) {
    if (PropertyIds[i].url === url) {
      propertyId = PropertyIds[i].properties_id;
      break; // 一致したらループを抜ける
    }
  }

  return propertyId;
};

const filterByDateRange = (
  data,
  dateRange,
  customStartDate = null,
  customEndDate = null
) => {
  const now = new Date();
  let startDate, endDate;

  switch (dateRange) {
    case "過去7日間":
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case "過去30日間":
      startDate = new Date(now.setDate(now.getDate() - 30));
      break;
    case "過去90日間":
      startDate = new Date(now.setDate(now.getDate() - 90));
      break;
    case "カスタム":
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
      break;
    default:
      startDate = new Date("2023-01-01"); // 全期間
  }
  endDate = endDate || new Date();

  return data.filter((item) => {
    const itemDate = new Date(item.date);
    return itemDate >= startDate && itemDate <= endDate;
  });
};

// テスト実行
//const analyticsDataForDateRange = filterByDateRange(analyticsData, "過去7日間");
//console.log(analyticsDataForDateRange);

//const analytics = [
// サンプルのanalyticsデータをここに配置
//];

const calculateMonthOverMonth = (currentValue, previousValue) => {
  if (previousValue === 0) {
    return currentValue === 0 ? 0 : 100;
  }
  return ((currentValue - previousValue) / previousValue) * 100;
};

const getPreviousMonthData = (data, dateRange) => {
  const now = new Date();
  let previousStartDate, previousEndDate;

  switch (dateRange) {
    case "過去7日間":
      previousStartDate = new Date(now.setDate(now.getDate() - 14));
      previousEndDate = new Date(now.setDate(now.getDate() + 7));
      break;
    case "過去30日間":
      previousStartDate = new Date(now.setDate(now.getDate() - 60));
      previousEndDate = new Date(now.setDate(now.getDate() + 30));
      break;
    case "過去90日間":
      previousStartDate = new Date(now.setDate(now.getDate() - 180));
      previousEndDate = new Date(now.setDate(now.getDate() + 90));
      break;
    default:
      return [];
  }

  return data.filter((item) => {
    const itemDate = new Date(item.date);
    return itemDate >= previousStartDate && itemDate <= previousEndDate;
  });
};

const getAnalyticsData = (propertyId) => {
  return analytics
    .filter((entry) => entry.properties_id === propertyId)
    .map((entry) => ({
      date: entry.date,
      PV: entry.screen_page_views,
      CV: entry.conversions,
      CVR: entry.conversions / entry.sessions,
      UU: entry.sessions,
    }));
};

const Dashboard = () => {
  const [propertyId, setPropertyId] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [dateRange, setDateRange] = useState("過去7日間");
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState(""); // URL用のstate
  const [metrics, setMetrics] = useState([]); // メトリクスのstate
  const [selectedMetric, setSelectedMetric] = useState(null); // 選択中のメトリクス
  const [searchKeywords, setSearchKeywords] = useState([]); // 検索キーワードのstate
  const [analyticsData, setAnalyticsData] = useState([]);

  const router = useRouter();

  // toggleMenu関数を定義
  const toggleMenu = () => {
    setIsOpen((prev) => !prev); // メニューの開閉状態をトグル
  };

  // フォーム送信時の処理
  const handleSubmit = (e) => {
    e.preventDefault();
    const foundPropertyId = findPropertyIdByUrl(url);
    if (foundPropertyId) {
      setPropertyId(foundPropertyId);
    } else {
      console.error("該当するプロパティが見つかりません");
    }
  };

  useEffect(() => {
    if (!propertyId) return;
    // プロパティIDに基づいてanalyticsデータを取得
    const filteredData = getAnalyticsData(propertyId);

    // 日付範囲に基づいてデータをフィルタリング
    const dataForDateRange = filterByDateRange(filteredData, dateRange);

    // 前月のデータを取得
    const previousData = getPreviousMonthData(filteredData, dateRange);

    // 最新のデータを取得
    const currentData = {
      PV: dataForDateRange.reduce((acc, curr) => acc + curr.PV, 0),
      CV: dataForDateRange.reduce((acc, curr) => acc + curr.CV, 0),
      UU: dataForDateRange.reduce((acc, curr) => acc + curr.UU, 0),
    };

    const previousMonthData = {
      PV: previousData.reduce((acc, curr) => acc + curr.PV, 0),
      CV: previousData.reduce((acc, curr) => acc + curr.CV, 0),
      UU: previousData.reduce((acc, curr) => acc + curr.UU, 0),
    };

    //setChartData(dataForDateRange);
    // サンプルメトリクスの設定
    setMetrics([
      {
        title: "PV (ページ閲覧数)",
        value: dataForDateRange.reduce((acc, curr) => acc + curr.PV, 0),
        previousValue: previousData.reduce((acc, curr) => acc + curr.PV, 0),
      },
      {
        title: "CV (お問い合わせ数)",
        value: dataForDateRange.reduce((acc, curr) => acc + curr.CV, 0),
        previousValue: previousData.reduce((acc, curr) => acc + curr.CV, 0),
      },
      {
        title: "UU (セッション数)",
        value: dataForDateRange.reduce((acc, curr) => acc + curr.UU, 0),
        previousValue: previousData.reduce((acc, curr) => acc + curr.UU, 0),
      },
      {
        title: "CVR (お問い合わせ率)",
        value:
          currentData.UU > 0
            ? ((currentData.CV / currentData.UU) * 100).toFixed(2) + "%"
            : "0%", // UU が 0 の場合は "0%" を表示
        previousValue:
          previousData.UU > 0
            ? ((previousData.CV / previousData.UU) * 100).toFixed(2) + "%"
            : "0%", // 前月の UU が 0 の場合も "0%" を表示
      },
    ]);

    setChartData(dataForDateRange);
  }, [propertyId, dateRange]);

  const handleMetricChange = (metricTitle) => {
    setSelectedMetric(metricTitle);
  };

  const renderContent = () => {
    if (selectedMetric === "PV (ページ閲覧数)") {
      return <LineChart data={chartData} dataKey="PV" />;
    }
    if (selectedMetric === "CV (お問い合わせ数)") {
      return <LineChart data={chartData} dataKey="CV" />;
    }
    if (selectedMetric === "CVR (お問い合わせ率)") {
      return <LineChart data={chartData} dataKey="CVR" />;
    }
    if (selectedMetric === "UU (セッション数)") {
      return <LineChart data={chartData} dataKey="UU" />;
    }
    return <div>No data available for selected metric</div>;
  };

  const SearchKeyword = ({ keyword, count }) => (
    <div className="search-keyword">
      <Search className="search-icon" />
      <div className="search-info">
        <p className="search-keyword-text">{keyword}</p>
        <p className="search-count-text">{count}回の検索結果</p>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <Header
        isOpen={isOpen}
        toggleMenu={toggleMenu}
        handleSubmit={handleSubmit}
        url={url}
        setUrl={setUrl}
      />
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
                {dateRange || "日付範囲を選択してください"}
              </SelectTrigger>
              <SelectContent className="select-content">
                <SelectItem value="過去7日間">過去7日間</SelectItem>
                <SelectItem value="過去30日間">過去30日間</SelectItem>
                <SelectItem value="過去90日間">過去90日間</SelectItem>
                <SelectItem value="カスタム">カスタム</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="dashboard-main-right">
            <div className="chart-content">
              <div className="metrics-grid">
                {metrics.map((metric, index) => (
                  <MetricCard
                    key={index}
                    title={metric.title} // カードのタイトル
                    value={metric.value} // カードに表示する値
                    previousValue={metric.previousValue}
                    isActive={selectedMetric === metric.title}
                    onClick={() => handleMetricChange(metric.title)}
                  />
                ))}
              </div>
              <Card className="chart-card">
                <CardContent className="chart-card-content">
                  {renderContent()}{" "}
                  {/* ここで選択されたメトリクスに応じたグラフを表示 */}
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
                {searchKeywords.map((keywordItem, index) => (
                  <SearchKeyword
                    key={index}
                    keyword={keywordItem.keyword}
                    count={keywordItem.count}
                  />
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
