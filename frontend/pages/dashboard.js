import React, { useEffect, useState } from "react";
// import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
// import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import { handlerUrlSubmit } from "../lib/submitHandler";
import { Home, BarChart2, FileText, Search, Settings } from "lucide-react";
import { FaBars, FaTimes } from "react-icons/fa";
import {
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
import { cn } from "../lib/utils";
import { cva } from "class-variance-authority";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/Select";
import Sidebar from "../components/ui/Sidebar";
import Header from "../components/ui/Header";
import MetricCard from "../components/ui/MetricCard";
//import Overlay from "../components/ui/Overlay";
import LineChart from "../components/graph/LineChart";
import BarChart from "../components/graph/BarChart";
import PieChart from "../components/graph/PieChart";

import "../styles/dashboard.css";

const Dashboard = () => {
  //   const user = useUser();
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null); // エラーの状態を管理
  const [loading, setLoading] = useState(true); // ローディング中かどうかの状態を管理
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
  const [activeMetric, setActiveMetric] = useState("PV (ページ閲覧数)"); // 初期値を"PV"に設定
  const [selectedMetric, setSelectedMetric] = useState("PV (ページ閲覧数)");
  const [metricsData, setMetricsData] = useState({
    PV: 0,
    CV: 0,
    CVR: 0,
    UU: 0,
  });
  const [previousMonthData, setPreviousMonthData] = useState({
    PV: 0,
    CV: 0,
    CVR: 0,
    UU: 0,
  });
  const [searchKeywords, setSearchKeywords] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [dateRange, setDateRange] = useState("過去28日間");

  const metrics = [
    {
      title: "PV (ページ閲覧数)",
      value: metricsData.PV || 0,
      previousValue: previousMonthData.PV || 0,
    },
    {
      title: "CV (お問い合わせ数)",
      value: metricsData.CV || 0,
      previousValue: previousMonthData.CV || 0,
    },
    {
      title: "CVR (お問い合わせ率)",
      value: metricsData.CVR ? metricsData.CVR.toFixed(2) + "%" : "0%",
      previousValue: previousMonthData.CVR
        ? previousData.CVR.toFixed(2) + "%"
        : "0%",
    },
    {
      title: "UU (セッション数)",
      value: metricsData.UU || 0,
      previousValue: previousMonthData.UU || 0,
    },
  ];

  // フォーム送信時の処理
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("URL submitted:", url);
    // ここにURLを送信するロジックを追加
  };

  // セッションを取得する関数
  const fetchSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data?.session) {
      console.error("Error fetching session: ", error);
      setError(error);
      setLoading(false);
      return;
    }
    setSession(data.session);
    setLoading(false);
  };

  // useEffectでsessionがnullのときにリトライ
  useEffect(() => {
    if (!session) {
      setLoading(true); // ローディング状態に戻す
      fetchSession();
    }
  }, [session]); // session が null の場合に再度 fetchSession を実行

  /*サイドバーの開閉状態を保持する */
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  //入力されたURLに基づいてデータを取得
  const fetchAnalyticsDataByUrl = async (url, setAnalyticsData) => {
    try {
      const { data, error } = await supabase
        .from("AnalyticsData")
        .select("*")
        .eq("page_location", url);

      if (error) {
        throw new Error(`Error fetching analytics data: ${error.message}`);
      }

      setAnalyticsData(data);
    } catch (err) {
      console.eroor(err.message);
    }
  };

  /*URLの読み取り */
  useEffect(() => {
    if (url) {
      fetchAnalyticsDataByUrl(url, setAnalyticsData);
    }
  }, [url]); // urlが変更された時にデータを取得

  /*グラフの状態を保持する */
  const handleMetricChange = (metric) => {
    setSelectedMetric(metric);
  };

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      //セッションの取得
      const { data, error } = await supabase.auth.getSession();

      if (error || !data?.session) {
        console.error("Error fetching session:", error);
        return;
      }

      const accountIds = customerDetailsData.map((item) => item.accounts_id);
      setAccountIds(accountIds); // ['1', '2']
      console.log("AccountIds: ", accountIds);

      if (accountIds.length > 0) {
        setSelectedAccountId(accountIds[0]);
      }

      // 3. PropertyTableからpropertyIdを取得
      const { data: allProperties, error: propertyError } = await supabase
        .from("PropertyTable")
        .select("properties_id, properties_name, account_id, url")
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

      // 4. GoogleAnalyticsDataのデータを取得
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
  }, []);

  useEffect(() => {
    if (analyticsData.length > 0 && selectedProperty) {
      const filteredAnalytics = analyticsData.filter(
        (item) => item.property_id === selectedProperty.properties_id
      );

      //日別の集計
      const dataByDate = filteredAnalytics.reduce((acc, item) => {
        const dateStr = item.date;
        const formattedDate = `${dateStr.substring(4, 6)}/${dataStr.substring(
          6,
          8
        )}`;

        if (!acc[formattedDate]) {
          acc[formattedDate] = {
            date: formattedDate,
            PV: 0,
            CV: 0,
            CVR: 0,
            UU: 0,
          };
        }

        acc[formattedDate].PV += item.screen_page_views;
        acc[formattedDate].CV += item.conversions;
        acc[formattedDate].UU += item.sessions;
        acc[formattedDate].CVR = acc[formattedDate].UU
          ? (acc[formattedDate].CV / acc[formattedDate].UU) * 100
          : 0;

        return acc;
      }, {});

      //月別の集計
      const dataByMonth = filteredAnalytics.reduce((acc, item) => {
        const dateStr = item.date;
        const formattedMonth = `${dateStr.substring(0, 4)}/${dateStr.substring(
          4,
          6
        )}`;

        if (!acc[formattedMonth]) {
          acc[formattedMonth] = {
            month: formattedMonth,
            PV: 0,
            CV: 0,
            CVR: 0,
            UU: 0,
          };
        }
        acc[formattedMonth].PV += item.screen_page_views;
        acc[formattedMonth].CV += item.conversions;
        acc[formattedMonth].UU += item.active_users;
        acc[formattedMonth].CVR = acc[formattedMonth].UU
          ? (acc[formattedMonth].CV / acc[formattedMonth].UU) * 100
          : 0;

        return acc;
      }, {});

      // 年別の集計
      const dataByYear = filteredAnalytics.reduce((acc, item) => {
        const year = item.date.substring(0, 4); // YYYY

        if (!acc[year]) {
          acc[year] = {
            year: year,
            PV: 0,
            CV: 0,
            CVR: 0,
            UU: 0,
          };
        }

        acc[year].PV += item.screen_page_views;
        acc[year].CV += item.conversions;
        acc[year].UU += item.active_users;
        acc[year].SS += item.sessions;
        acc[year].CVR = acc[year].SS ? (acc[year].CV / acc[year].UU) * 100 : 0;

        return acc;
      }, {});

      // 日、月、年別のデータを保存
      setChartData({
        byDate: Object.values(dataByDate),
        byMonth: Object.values(dataByMonth),
        byYear: Object.values(dataByYear),
      });
    }
  }, [analyticsData, selectedProperty]);

  //前月データを計算する
  const calculatePreviousMonthData = (analyticsData) => {
    //現在の日付
    const currentDate = new Date();
    const previousMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );

    //前月のデータをフィルタリング
    const totals = analyticsData.reduce(
      (acc, item) => {
        const itemDate = new Date(item.date);
        if (
          itemDate.getMonth() === previousMonth.getMonth() &&
          itemDate.getFullYear() === previousMonth.getFullYear()
        ) {
          acc.PV += item.screen_page_views;
          acc.CV += item.conversions;
          acc.UU += item.active_users;
        }
        return acc;
      },
      { PV: 0, CV: 0, UU: 0, UU: 0 } // 初期値
    );

    const CVR = totals.SS ? (totals.CV / totals.SS) * 100 : 0;

    // 合計値とCVRを返す
    return {
      PV: totals.PV,
      CV: totals.CV,
      UU: totals.UU,
      CVR: CVR,
    };
  };

  useEffect(() => {
    if (analyticsData.length > 0) {
      const previousMonthData = calculatePreviousMonthData(analyticsData);
      const newMetricsData = calculateMetrics(metricsData, previousMonthData);
      setPreviousMonthData(previousMonthData);
      setMetricsData(newMetricsData);
    }
  }, [analyticsData]);

  const calculateMetrics = (currentData, previousData) => [
    {
      title: "PV (ページ閲覧数)",
      value: currentData.PV || 0,
      previousValue: previousData.PV || 0,
    },
    {
      title: "CV (お問い合わせ数)",
      value: currentData.CV || 0,
      previousValue: previousData.CV || 0,
    },
    {
      title: "CVR (お問い合わせ率)",
      value: currentData.CVR ? currentData.CVR.toFixed(2) + "%" : "0%",
      previousValue:
        previousData.CVR || previousData.UU > 0
          ? previousData.CVR.toFixed(2) + "%"
          : "0%",
    },
    {
      title: "UU (セッション数)",
      value: currentData.UU || 0,
      previousValue: previousData.UU || 0,
    },
  ];

  /*Sidebarが開いているときに他の箇所を暗くする */
  const Overlay = ({ isOpen, toggleMenu }) => (
    <div
      className={`overlay ${isOpen ? "visible" : ""}`}
      onClick={toggleMenu}
    ></div>
  );

  //グラフの種類を決定
  const renderContent = () => {
    switch (selectedMetric) {
      case "PV (ページ閲覧数)":
        return <LineChart data={chartData} dataKey="PV" />;
      case "CV (お問い合わせ数)":
        return <LineChart data={chartData} dataKey="CV" />;
      case "CVR (お問い合わせ率)":
        return <LineChart data={chartData} dataKey="CVR" />;
      case "UU (セッション数)":
        return <LineChart data={chartData} dataKey="UU" />;
      default:
        return <div>No data available for selected metric</div>;
    }
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
                {searchKeywords.map((keyword, index) => (
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
