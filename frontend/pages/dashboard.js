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
//import Overlay from "../components/ui/Overlay";
import LineChart from "../components/graph/LineChart";
import BarChart from "../components/graph/BarChart";
import PieChart from "../components/graph/PieChart";

import "../styles/dashboard.css";

// URLからProperty IDを取得する関数
const getPropertyIdFromUrl = (url, propertyIds) => {
  // URLに基づいてProperty IDを取得
  const matchedProperty = propertyIds.find((property) => property.url === url);

  if (matchedProperty) {
    console.log(`Matched Property ID: ${matchedProperty.properties_id}`);
    return matchedProperty.properties_id;
  } else {
    console.log("指定されたURLに対応するプロパティが見つかりません。");
    return null;
  }
};

const Dashboard = () => {
  //const user = useUser();
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null); // エラーの状態を管理
  const [loading, setLoading] = useState(false); // ローディング中かどうかの状態を管理
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
  //const [chartData, setChartData] = useState([]);
  const [dateRange, setDateRange] = useState("過去28日間");
  const [startDate, setStartDate] = useState(new Date());
  const [dataByDate, setDataByDate] = useState([]);
  const [dataByMonth, setDataByMonth] = useState([]);
  const [dataByYear, setDataByYear] = useState([]);
  const [endDate, setEndDate] = useState(new Date());
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const [totalScreenViews, setTotalScreenViews] = useState(0); // スクリーンビューの合計を管理
  const urls = "https://www.propagate-fsk.tokyo/"; // 使用したいURL
  const chartData = [
    { date: "2024-09-01", PV: 120 },
    { date: "2024-09-02", PV: 150 },
    { date: "2024-09-03", PV: 170 },
  ];

  // スクリーンビューを取得する関数
  const countScreenViewsByPropertyId = async (propertyId) => {
    try {
      const { data: properties, error: propertyError } = await supabase
        .from("PropertyTable")
        .select("properties_id")
        .eq("url", url);

      if (propertyError) {
        throw new Error(`プロパティIDの取得エラー: ${propertyError.message}`);
      }

      if (properties.length === 0) {
        console.log("指定されたURLに対応するプロパティが見つかりません。");
        return 0;
      }

      const propertyId = properties[0].properties_id;
      console.log(`取得したプロパティID: ${propertyId}`);

      const { data: analyticsData, error: analyticsError } = await supabase
        .from("AnalyticsData")
        .select("screen_page_views")
        .eq("property_id", propertyId);

      if (analyticsError) {
        throw new Error(
          `アナリティクスデータ取得エラー: ${analyticsError.message}`
        );
      }

      let totalScreenViews = 0;
      for (let i = 0; i < analyticsData.length; i++) {
        totalScreenViews += analyticsData[i].screen_page_views || 0;
      }

      console.log(
        `プロパティID ${propertyId} のスクリーンビュー合計: ${totalScreenViews}`
      );
      return totalScreenViews;
    } catch (error) {
      console.error("countScreenViewsByPropertyId内でのエラー: ", error);
      return 0;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const totalViews = await countScreenViewsByPropertyId(url);
      setTotalScreenViews(totalViews);
    };

    fetchData();
  }, [urls]); // URLが変更されたときにデータを再取得
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

  const dateOptions = [
    { value: "7", label: "過去7日間" },
    { value: "28", label: "過去28日間" },
    { value: "90", label: "過去90日間" },
  ];

  // セッションを取得する関数
  const fetchSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data?.session) {
      console.error("Error fetching session: ", error);
      setError("セッションの取得に失敗しました");
      //setLoading(false);
      return;
    }
    setSession(data.session);
    //setLoading(false);
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

  /*グラフの状態を保持する */
  const handleMetricChange = (metric) => {
    setSelectedMetric(metric);
  };

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!session) {
        console.log("Session is null");
        return;
      }

      const sessionData = session;

      if (!sessionData) {
        // router.push('/auth/login');
      } else {
        setSession(sessionData);
      }

      // 1. Userのemailを取得
      //   console.log("Session of this: ", sessionData);
      console.log("User's auth.uin(): ", sessionData.user.id);

      // const email_customer = sessionData.user.user_metadata.email;

      // 2. CustomerDetailsTableからaccountIdを取得
      const { data: customerDetailsData, error: customerDetailsError } =
        await supabase.from("CustomerDetailsTable").select("accounts_id");
      //   .eq("email_customer", email_customer);

      console.log("CustomerDetailsData: ", customerDetailsData);
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
  }, [session]);

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
    console.log("Selected Property Change:", selectedPropertyId);
    setSelectedPropertyId(selectedPropertyId); // 追加
    const property = filteredProperties.find(
      (p) => p.properties_id === selectedPropertyId
    );
    setSelectedProperty(property);
  };

  /*URLの読み取り */
  useEffect(() => {
    if (url) {
      const propertyId = getPropertyIdFromUrl(url, propertyIds);
      if (propertyId) {
        setSelectedPropertyId(propertyId);
        fetchAnalyticsDataByPropertyId(propertyId, startDate, endDate);
      }
    }
  }, [url, propertyIds, startDate, endDate]); // urlが変更された時にデータを取得

  //入力されたURLに基づいてデータを取得
  const fetchAnalyticsDataByPropertyId = async (
    propertyId,
    startDate,
    endDate
  ) => {
    setLoading(true);
    try {
      const formattedStartDate = startDate.toISOString().split("T")[0]; // YYYY-MM-DD形式
      const formattedEndDate = endDate.toISOString().split("T")[0]; // YYYY-MM-DD形式

      const { data, error } = await supabase
        .from("AnalyticsData")
        .select("*")
        .eq("property_id", propertyId)
        .gte("date", formattedStartDate)
        .lte("date", formattedEndDate);

      if (error) {
        throw new Error(`Error fetching analytics data: ${error.message}`);
      }

      setAnalyticsData(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // フォーム送信時の処理
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!url) {
      console.log("URLが空です");
      return;
    }
    const propertyId = getPropertyIdFromUrl(url, propertyIds);

    if (propertyId && propertyId !== selectedPropertyId) {
      // Property IDが異なる場合にのみセット
      setSelectedPropertyId(propertyId);
      fetchAnalyticsDataByPropertyId(propertyId, startDate, endDate);
    }
  };
  /* propertyIdの読み取り */
  useEffect(() => {
    if (selectedPropertyId && startDate && endDate) {
      fetchAnalyticsDataByPropertyId(selectedPropertyId, startDate, endDate);
    }
  }, [selectedPropertyId, startDate, endDate]); // selectedPropertyIdが変更された時にデータを取得

  const property = filteredProperties.find(
    (p) => p.properties_id === selectedPropertyId
  );

  if (property) {
    setSelectedProperty(property);
    console.log("プロパティが見つかりました:", property);
    // URLに基づいたデータの取得を開始
    fetchAnalyticsDataByPropertyId(selectedPropertyId, startDate, endDate);
  } else {
    console.log("プロパティが見つかりませんでした");
  }

  const retirievedpropertyId = getPropertyIdFromUrl(url, propertyIds);

  {
    /*if (retirievedpropertyId) {
  setSelectedPropertyId(propertyId);
  fetchAnalyticsDataByPropertyId(propertyId, startDate, endDate);
  return;
}*/
  }
  console.log("指定されたプロパティIDが見つかりませんでした。");

  {
    /*// selectedPropertyIdのログ出力
    console.log("Selected Property ID:", selectedPropertyId);

    // selectedPropertyIdが設定されているか確認する
    if (!selectedPropertyId) {
      console.log("選択されたプロパティIDがありません");
      return;
    }*/
  }

  //表示するデータの計算
  useEffect(() => {
    if (analyticsData.length > 0 && selectedProperty) {
      const filteredAnalytics = analyticsData.filter(
        (item) => item.property_id === selectedProperty.properties_id
      );

      //日別の集計
      const dataByDate = filteredAnalytics.reduce((acc, item) => {
        const dateStr = item.date;
        const formattedDate = `${dateStr.substring(4, 6)}/${dateStr.substring(
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
      { PV: 0, CV: 0, CVR: 0, UU: 0 } // 初期値
    );

    const CVR = totals.UU ? (totals.CV / totals.UU) * 100 : 0;

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

  useEffect(() => {
    let selectedData;
    switch (dateRange) {
      case "過去7日間":
        selectedData = dataByDate;
        break;
      case "過去28日間":
        selectedData = dataByMonth;
        break;
      case "過去90日間":
        selectedData = dataByYear;
        break;
      default:
        selectedData = dataByDate;
    }
    //setChartData(selectedData);
    setMetricsData(calculateMetrics(selectedData)); // メトリクスも更新
  }, [dateRange, dataByDate, dataByMonth, dataByYear]);

  const calculateMetrics = (currentData = {}, previousData = {}) => [
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
        previousData.UU > 0 ? previousData.CVR.toFixed(2) + "%" : "0%",
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
        {/*
        /////////////////////////////////////////////////////////////////
        <div className="souta">
          <h1>Dashboard</h1>
          <p>指定されたURLのスクリーンビューの合計: {totalScreenViews}</p>
          <LineChart
            data={[
              { date: "2024-09-01", PV: 120 },
              { date: "2024-09-02", PV: 150 },
              { date: "2024-09-03", PV: 170 },
            ]}
            dataKey="CV"
          />
        </div>*/}
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
