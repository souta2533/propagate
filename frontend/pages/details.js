import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useSessionData } from "../hooks/useSessionData";
import { useAnalyticsData } from "../hooks/useAnalyticsData";
import { useSearchConsoleData } from "../hooks/useSearchConsoleData";
import { useAggregatedData } from "../hooks/useAggregatedData";
import { Button } from "../components/ui/Button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "../components/ui/Select";
/*import { Tabs, TabsList, TabsTrigger } from "../components/Tabs";*/
import { Calendar } from "../components/ui/Calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../components/ui/Popover";
import { X, Calendar as CalendarIcon } from "lucide-react";
import LineChart from "../components/graph/LineChart";
import BarChart from "../components/graph/BarChart";
import PieChart from "../components/graph/PieChart";

import "../styles/AnalyticsDashboard.css";

export default function AnalyticsDashboard() {
  const sampledata = [
    { date: "2024-09-01", PV: 0, CV: 0, CVR: 0, UU: 0 },
    { date: "2024-09-02", PV: 0, CV: 0, CVR: 0, UU: 0 },
    { date: "2024-09-03", PV: 0, CV: 0, CVR: 0, UU: 0 },
  ];
  const [dateRange, setDateRange] = useState("過去 28 日間");
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState("PV");
  const [urlList, seturlList] = useState("");
  const [timeGranularity, setTimeGranularity] = useState("日別");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [formattedAnalytics, setFormattedAnalytics] = useState([]);
  const router = useRouter();
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2); // 月は0から始まるため+1
    const day = `0${date.getDate()}`.slice(-2);
    return `${year}/${month}/${day}`;
  };

  const NOTpropertyIds = [
    {
      account_id: "300168308",
      properties_id: "424732958",
      properties_name: "Yuya",
      url: null,
    },
    {
      account_id: "300168308",
      properties_id: "428269691",
      properties_name: "gatest",
      url: null,
    },
    {
      account_id: "324522818",
      properties_id: "359877627",
      properties_name: "propagateGA4",
      url: "https://www.propagateinc.com/",
    },
    {
      account_id: "300168308",
      properties_id: "425610688",
      properties_name: "propagate-tfc.tokyo",
      url: "",
    },
    {
      account_id: "324522818",
      properties_id: "453492841",
      properties_name: "AnalyticsTest",
      url: "",
    },
    {
      account_id: "300168308",
      properties_id: "452842721",
      properties_name: "Propagate Analytics",
      url: "https://www.propagate-fsk.tokyo/",
    },
  ];

  const { fetchedSession, loading } = useSessionData();

  useEffect(() => {
    if (!fetchedSession && !loading) {
      router.push("/auth/login");
    } else {
      console.log("fetchedSession: ", fetchedSession);
    }
  }, [fetchedSession, loading, router]);

  // データの初期化
  const [analyticsData, setAnalyticsData] = useState([]);
  const [propertyIds, setPropertyIds] = useState([]);
  const [searchConsoleData, setSearchConsoleData] = useState([]);
  const [aggregatedData, setAggregatedData] = useState([]);

  // useAnalyticsDataでデータを取得する
  const {
    data: fetchedAnalyticsData,
    error: analyticsError,
    isLoading: analyticsLoading,
    refetch: refetchAnalyticsData,
  } = useAnalyticsData(fetchedSession, setPropertyIds);
  useEffect(() => {
    if (analyticsError) {
      console.error("Error fetching analytics data:", analyticsError);
    }

    if (fetchedAnalyticsData) {
      console.log("fetchedAnalyticsData:", fetchedAnalyticsData);
      setAnalyticsData(fetchedAnalyticsData.allAnalytics);
      setPropertyIds(fetchedAnalyticsData.allProperties);
    }
  }, [fetchedSession, analyticsError, router]);

  // useSearchConsoleDataでデータを取得する
  const {
    data: fetchedSearchConsoleData,
    error: searchConsoleError,
    isLoading: searchConsoleLoading,
    refetch: refetchSearchConsoleData,
  } = useSearchConsoleData(propertyIds);
  useEffect(() => {
    if (searchConsoleError) {
      console.error("Error fetching search console data:", searchConsoleError);
    }

    if (fetchedSearchConsoleData) {
      console.log("fetchedSearchConsoleData:", fetchedSearchConsoleData);
      setSearchConsoleData(fetchedSearchConsoleData);
    }
  }, [propertyIds, searchConsoleError, router]);

  // useAggregatedDataでデータを取得する
  const {
    data: fetchedAggregatedData,
    error: aggregatedError,
    isLoading: aggregatedLoading,
    refetch: refetchAggregatedData,
  } = useAggregatedData(fetchedSession, propertyIds, startDate, endDate);
  useEffect(() => {
    if (aggregatedLoading) {
      console.log("Loading aggregated data...");
      return;
    }
    if (aggregatedError) {
      console.error("Error fetching aggregated data:", aggregatedError);
      refetchAggregatedData();
    }

    if (fetchedAggregatedData) {
      console.log("fetchedAggregatedData:", fetchedAggregatedData);
      setAggregatedData(fetchedAggregatedData);
    }
  }, [
    fetchedSession,
    propertyIds,
    startDate,
    endDate,
    aggregatedError,
    router,
  ]);

  /*グラフの日付選択
  const handleDateSelect = (range) => {
    if (range && range.from && range.to) {
      setStartDate(range.from);
      setEndDate(range.to);
      setShowCalendar(false); // カレンダーを閉じる
    }
  };
  */

  //グラフに描画するデータの作成
  useEffect(() => {
    const formattedAnalyticsData = analyticsData.map((entry) => ({
      properties_id: entry.property_id, // property_idをproperties_idに変換
      date: entry.date, // dateをそのまま使用
      screen_page_views: entry.screen_page_views || 0, // screen_page_viewsを使用
      conversions: entry.conversions || 0, // conversionsを使用
      sessions: entry.sessions || 0, // sessionsを使用
    }));

    setFormattedAnalytics(formattedAnalyticsData);
    console.log("Formatted Analytics:", formattedAnalyticsData);
  }, [analyticsData]); // analyticsDataが変更された時に実行

  const generateData = (metric, granularity, startDate, endDate) => {
    if (!startDate || !endDate) return [];

    let baseData = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      let dateString;
      switch (granularity) {
        case "日別":
          dateString = formatDate(currentDate);
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case "月別":
          dateString = `${currentDate.getFullYear()}/${(
            currentDate.getMonth() + 1
          )
            .toString()
            .padStart(2, "0")}`;
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        case "年別":
          dateString = currentDate.getFullYear().toString();
          currentDate.setFullYear(currentDate.getFullYear() + 1);
          break;
        default:
          dateString = formatDate(currentDate);
          currentDate.setDate(currentDate.getDate() + 1);
      }

      baseData.push({
        date: dateString,
        [metric]: Math.floor(Math.random() * 1000),
      });
    }

    return baseData;
  };

  // 選択されたURLを管理するstate
  const [selectedURL, setSelectedURL] = useState("");

  // URLが選択されたときの処理
  const handleURLChange = (url) => {
    setSelectedURL(url);
  };

  const handleDateRangeChange = (value) => {
    setDateRange(value);
    setShowCalendar(value === "カスタム");
  };

  const handleMetricChange = (value) => {
    setSelectedMetric(value);
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function getQuery(searchData, searchId, object) {
    // 最後の / を削除
    //const sanitizedUrl = url.replace(/\/+$/, "");
    //console.log(sanitizedUrl);
    console.log("propertyId:", 359877627);
    console.log("aggregatedData;", aggregatedData);
    const queryData =
      searchData[searchId]?.["https://www.propagateinc.com"]?.query;
    console.log("QueryData: ", queryData);
    if (!queryData) {
      return [];
    }
    const sortedEntries = Object.entries(queryData).sort((a, b) => b[1] - a[1]);
    const top7Queries = sortedEntries.slice(0, 7);
    console.log("top7Queries: ", top7Queries);
    return top7Queries;
  }

  const topQueries = getQuery(aggregatedData, 359877627, "query");
  console.log("topQueries", topQueries);
  const topDevices = getQuery(aggregatedData, 359877627, "");
  const topCountries = getQuery(aggregatedData, 359877627, "query");

  const fakeData = [
    359877627,
    "https://www.propagateinc.com",
    { key: "active_users", value: 0 },
    { key: "city", value: {} },
    { key: "click", value: 1788 },
    { key: "conversion_rate", value: 0 },
    { key: "conversions", value: 0 },
    {
      key: "country",
      value: {
        jpn: 966,
        vnm: 15,
        usa: 4,
        kor: 3,
        idn: 2,
        other: 1,
      },
    },
    { key: "ctr", value: 17.491684601839168 },
    {
      key: "device_category",
      value: {
        desktop: 41,
        smartphone: 60,
      },
    },
    { key: "engaged_sessions", value: 0 },
    { key: "impression", value: 10222 },
    { key: "position", value: 3836 },
    {
      key: "query",
      value: {
        プロパゲート: 89,
        株式会社プロパゲート: 63,
        "wix サービス終了": 29,
        プロパゲート株式会社: 25,
        "インスタ dm 自動送信": 24,
        // その他のクエリもここに追加できます
      },
    },
    { key: "screen_page_views", value: 0 },
    { key: "sessions", value: 0 },
    { key: "total_users", value: 0 },
  ];

  //グラフに描画するデータの作成
  useEffect(() => {
    const formattedAnalyticsData = analyticsData.map((entry) => ({
      properties_id: entry.property_id, // property_idをproperties_idに変換
      date: entry.date, // dateをそのまま使用
      screen_page_views: entry.screen_page_views || 0, // screen_page_viewsを使用
      conversions: entry.conversions || 0, // conversionsを使用
      sessions: entry.sessions || 0, // sessionsを使用
    }));

    setFormattedAnalytics(formattedAnalyticsData);
    console.log("Formatted Analytics:", formattedAnalyticsData);
  }, [analyticsData]); // analyticsDataが変更された時に実行

  const selectChart = () => {
    switch (selectedMetric) {
      case "PV":
        return <LineChart data={formattedAnalytics} dataKey="PV" />;
      case "CV":
        return <LineChart data={formattedAnalytics} dataKey="CV" />;
      case "TU":
        return <LineChart data={formattedAnalytics} dataKey="TU" />;
      case "UU":
        return <LineChart data={formattedAnalytics} dataKey="UU" />;
      case "CVR":
        return <LineChart data={formattedAnalytics} dataKey="CVR" />;
      case "SD":
        return <BarChart data={topDevices} />; //流入元デバイス
      case "VR":
        return <BarChart data={topCountries} />; //流入者属性
      case "RU":
        return <PieChart data={topQueries} />; //流入元URL
      case "SK":
        return <BarChart data={topQueries} />; //検索キーワード
      default:
        return <LineChart data={sampledata} dataKey="PV" />;
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div className="metric-select"></div>
        <div className="action-icons">
          <button
            onClick={() => router.push("/dashboard")}
            className="icon-button"
          >
            <X className="icon" />
          </button>
        </div>
      </div>
      <div className="graph-control">
        <div className="filter-section">
          <div className="date-range">
            <Select value={dateRange} onValueChange={handleDateRangeChange}>
              <SelectTrigger className="select-trigger"></SelectTrigger>
              <SelectContent className="select-content">
                <SelectItem value="過去 7 日間" className="select-menu">
                  過去 7 日間
                </SelectItem>
                <SelectItem value="過去 28 日間" className="select-menu">
                  過去 28 日間
                </SelectItem>
                <SelectItem value="過去 90 日間" className="select-menu">
                  過去 90 日間
                </SelectItem>
                <SelectItem value="カスタム" className="select-menu">
                  カスタム
                </SelectItem>
              </SelectContent>
            </Select>
            {showCalendar && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="calendar-button">
                    <CalendarIcon className="icon-small" />
                    {startDate && endDate
                      ? `${formatDate(startDate)} 〜 ${formatDate(endDate)}`
                      : "日付を選択"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="calendar-popover">
                  <Calendar
                    selected={{ from: startDate, to: endDate }}
                    onSelect={handleDateSelect}
                    numberOfMonths={2}
                    mode="range"
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
        <div className="tabs">
          <div className="tabs-list">
            <button
              onClick={() => handleMetricChange("PV")}
              className={`tab ${selectedMetric === "PV" ? "active" : ""}`}
            >
              ページ閲覧数
            </button>
            <button
              onClick={() => handleMetricChange("CV")}
              className={`tab ${selectedMetric === "CV" ? "active" : ""}`}
            >
              お問い合わせ数
            </button>
            <button
              onClick={() => handleMetricChange("TU")}
              className={`tab ${selectedMetric === "TU" ? "active" : ""}`}
            >
              ページ訪問者数
            </button>
            <button
              onClick={() => handleMetricChange("UU")}
              className={`tab ${selectedMetric === "UU" ? "active" : ""}`}
            >
              セッション数
            </button>
            <button
              onClick={() => handleMetricChange("CVR")}
              className={`tab ${selectedMetric === "CVR" ? "active" : ""}`}
            >
              お問い合わせ率
            </button>
            <button
              onClick={() => handleMetricChange("SD")}
              className={`tab ${selectedMetric === "SD" ? "active" : ""}`}
            >
              流入元デバイス
            </button>
            <button
              onClick={() => handleMetricChange("VR")}
              className={`tab ${selectedMetric === "" ? "active" : ""}`}
            >
              流入者属性
            </button>
            <button
              onClick={() => handleMetricChange("RU")}
              className={`tab ${selectedMetric === "RU" ? "active" : ""}`}
            >
              流入元URL
            </button>
            <button
              onClick={() => handleMetricChange("SK")}
              className={`tab ${selectedMetric === "SK" ? "active" : ""}`}
            >
              検索キーワード
            </button>
          </div>
        </div>
        <div className="chart-controls">
          <Select>
            <SelectContent>
              <SelectItem value="views">PagePath</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="chart">{selectChart()}</div>
    </div>
  );
}
