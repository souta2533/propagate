import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Search } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useSessionData } from "../hooks/useSessionData";
import { useAnalyticsData } from "../hooks/useAnalyticsData";
import { useSearchConsoleData } from "../hooks/useSearchConsoleData";
import { useAggregatedData } from "../hooks/useAggregatedData";
import { fetchAggregatedData } from "../lib/getData";
import { fetchAggregatedDataFromDashboard } from "../lib/getData"; //この関数を追加
import { Card, CardContent } from "../components/ui/Card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  DateRangePicker,
} from "../components/ui/Select";
import Sidebar from "../components/ui/Sidebar";
import Header from "../components/ui/Header";
import MetricCard from "../components/ui/MetricCard";
import Overlay from "../components/ui/Overlay";
import LineChart from "../components/graph/LineChart";

import "../styles/dashboard.css";

const calculateMonthOverMonth = (currentValue, previousValue) => {
  if (previousValue === 0) {
    return currentValue === 0 ? 0 : 100;
  }
  console.log("Current Value:", currentValue, "Previous Value:", previousValue);
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

  const previousData = data.filter((item) => {
    const itemDate = new Date(item.date);
    return itemDate >= previousStartDate && itemDate <= previousEndDate;
  });
  return previousData;
};

const Dashboard = () => {
  // サンプルメトリクスデータ
  const sampleMetrics = [
    {
      title: "PV (ページ閲覧数)",
      value: "-",
      previousValue: "-",
    },
    {
      title: "CV (お問い合わせ数)",
      value: "-",
      previousValue: "-",
    },
    {
      title: "CVR (お問い合わせ率)",
      value: "-",
      previousValue: "-",
    },
    {
      title: "UU (セッション数)",
      value: "-",
      previousValue: "-",
    },
  ];
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false); // ローディング中かどうかの状態を管理
  const [accountIds, setAccountIds] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1); // 今日から1ヶ月前の日付を設定
    return date.toISOString().split("T")[0]; // YYYY-MM-DD 形式で取得
  });
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [aggregatedData, setAggregatedData] = useState({});
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const [propertyId, setPropertyId] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [dateRange, setDateRange] = useState("過去7日間");
  const [showCalendar, setShowCalendar] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState(""); // URL用のstate
  const [urlList, setUrlList] = useState([]);
  const [metrics, setMetrics] = useState(sampleMetrics); // メトリクスのstate
  const [selectedMetric, setSelectedMetric] = useState("PV (ページ閲覧数)"); // 選択中のメトリクス
  const [searchKeywords, setSearchKeywords] = useState([]); // 検索キーワードのstate

  const [dataForDateRange, setDataForDateRange] = useState([]);
  const [formattedAnalytics, setFormattedAnalytics] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [registeredUrl, setRegisteredUrl] = useState(""); //URL追加ページで登録したURLを保持
  const router = useRouter();

  const addUrlToList = (newUrl) => {
    if (!addUrlToList.includes(newUrl)) {
      SpeechRecognitionResultList((prevList) => [...prevList, newUrl]);
    }
  };

  useEffect(() => {
    if (router.query.url) {
      setUrl(decodeURIComponent(router.query.url));
    }
  }, [router.query.url]);

  const handleDateRangeChange = (value) => {
    // Toggle showCalendar if custom date is selected
    if (value === "カスタム") {
      setShowCalendar(true);
    } else {
      setShowCalendar(false);
    }
    filterDataByDateRange(value);
  };

  /*console.log("Filter Date Range Start:", startDate, "End:", endDate); // デバッグ用ログ
    const filteredData = data.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= endDate;
    });
    return filteredData;
  };*/

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

  // データの初期化
  const [analyticsData, setAnalyticsData] = useState([]);
  const [propertyIds, setPropertyIds] = useState([]);
  const [searchConsoleData, setSearchConsoleData] = useState([]);

  // Anlyticsデータの取得
  const {
    data: fetchedAnalyticsData,
    error: analyticsError,
    isLoading: analyticsLoading,
    refetch: refetchAnalyticsData,
  } = useAnalyticsData(session, setPropertyIds);

  // Analyticsデータの処理
  useEffect(() => {
    if (!session || analyticsLoading) return; // sessionがないかロード中の場合は何もしない

    if (analyticsError) {
      console.error("Error fetching analytics data:", analyticsError);
      refetchAnalyticsData(session); // エラー時にリフェッチ
    } else if (fetchedAnalyticsData) {
      console.log("Fetched Analytics Data: ", fetchedAnalyticsData);
      setAnalyticsData(fetchedAnalyticsData.allAnalytics);
      setPropertyIds(fetchedAnalyticsData.allProperties);
    }
  }, [session, analyticsError, analyticsLoading, refetchAnalyticsData]);

  // Search Consoleデータの取得
  const {
    data: fetchedSearchConsoleData,
    error: searchConsoleError,
    isLoading: searchConsoleLoading,
    refetch: refetchSearchConsoleData,
  } = useSearchConsoleData(propertyIds);

  useEffect(() => {
    if (!propertyIds.length || searchConsoleLoading) return; // propertyIdsがないかロード中の場合は何もしない

    if (searchConsoleError) {
      console.error("Error fetching search console data:", searchConsoleError);
      refetchSearchConsoleData(propertyIds); // エラー時にリフェッチ
    } else if (fetchedSearchConsoleData) {
      console.log("Fetched Search Console Data: ", fetchedSearchConsoleData);
      setSearchConsoleData(fetchedSearchConsoleData);
    }
  }, [
    propertyIds,
    searchConsoleError,
    searchConsoleLoading,
    refetchSearchConsoleData,
  ]);

  // 集計データを取得
  const {
    data: fetchedAggregatedData,
    error: aggregatedError,
    isLoading: aggregatedLoading,
    refetch: refetchAggregatedData,
  } = useAggregatedData(session, propertyIds, startDate, endDate);

  useEffect(() => {
    if (
      !session ||
      !propertyIds.length ||
      !startDate ||
      !endDate ||
      aggregatedLoading
    )
      return; // session, propertyIds, startDate

    if (aggregatedError) {
      console.error("Error fetching aggregated data:", aggregatedError);
      refetchAggregatedData(session, propertyIds, startDate, endDate); // エラー時にリフェッチ
    }

    if (fetchedAggregatedData) {
      console.log("Aggregated Data: ", fetchedAggregatedData);
      //setAggregatedData(fetchedAggregatedData);
    }
  }, [
    session,
    propertyIds,
    startDate,
    endDate,
    aggregatedError,
    aggregatedLoading,
    refetchAggregatedData,
  ]);

  //AggregatedDataが空白にならないようにするにはMemo化が必要かも　yamasaki
  /*メモ化（Memoization）とは
メモ化は計算の最適化技術の一つで、高コストな関数の戻り値をキャッシュし、同じ入力に対してはキャッシュから結果を返すことで、不要な計算を避ける手法です。これにより、アプリケーションのパフォーマンスが向上します。

Reactにおけるメモ化
Reactでは主に以下の二つのフックを利用してメモ化を行います。

useMemo:

計算された値をメモ化するために使用されます。
関数の戻り値を記憶しておき、依存する値が変わった場合にのみ再計算を行います。
useCallback:

関数自体をメモ化するために使用されます。
コンポーネントが再レンダリングされても、依存する値が変わらない限り同じ関数の参照を保持します。*/

  /** 以下日付変更が起こった際に集計データを取得する関数 */
  useEffect(() => {
    const fetchAggregatedData = async () => {
      if (
        !session ||
        !propertyIds ||
        propertyIds.length === 0 ||
        !startDate ||
        !endDate
      ) {
        console.warn("Property ID, Start Date, or End Date is missing.");
        return;
      }

      const jwtToken = session.access_token;
      if (!jwtToken) {
        console.error("JWT Token is missing.");
        return;
      }

      const aggregatedDataByPropertyId = {};

      for (const property of propertyIds) {
        const propertyId = property.properties_id;
        try {
          const aggregatedData = await fetchAggregatedDataFromDashboard(
            jwtToken,
            propertyId,
            startDate,
            endDate
          );

          if (aggregatedData) {
            aggregatedDataByPropertyId[propertyId] = aggregatedData;
          }
        } catch (error) {
          console.error("Error fetching aggregated data:", error);
        }
      }
      console.log("Aggregated Data:", aggregatedDataByPropertyId); // デバッグ用ログ
      setAggregatedData(aggregatedDataByPropertyId);
    };

    fetchAggregatedData();
  }, [session, propertyIds, startDate, endDate]);

  // // データのデバッグ
  console.log("Analytics Data: ", analyticsData);
  console.log("Search Console Data: ", searchConsoleData);

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////hooks/usePropertyIdSetting.jsにコピーした箇所
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

  const findPropertyIdByUrl = (url) => {
    let propertyId = null;

    if (!propertyIds || propertyIds.length === 0) {
      console.error("propertyIds is empty or undefined");
      return null;
    }

    for (let i = 0; i < propertyIds.length; i++) {
      if (propertyIds[i].url === url) {
        propertyId = propertyIds[i].properties_id;
        break;
      }
    }
    console.log("Found Property ID:", propertyId); // デバッグ用ログ
    setPropertyId[propertyId];
    setUrl[url];
    return propertyId;
  };
  //////hooks/usePropertyIdSetting.jsにコピーした箇所
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const generateEmptyDataForDateRange = (startDate, endDate) => {
    const data = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      data.push({
        date: currentDate.toISOString().split("T")[0], // YYYY-MM-DD形式で日付を保持
        PV: 0,
        CV: 0,
        CVR: 0,
        UU: 0,
      });
      currentDate.setDate(currentDate.getDate() + 1); // 次の日付に進む
    }

    return data;
  };

  const ensureDataForDateRange = (data, startDate, endDate) => {
    if (!Array.isArray(data) || data.length === 0) {
      // データが存在しない場合、指定された範囲の日付のデータを0で初期化して作成
      console.warn("Data is empty, generating empty data for the date range.");
      return generateEmptyDataForDateRange(startDate, endDate);
    }

    // データが存在する場合も、存在しない日付のデータを0で埋める
    const filledData = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const formattedDate =
        currentDate.getFullYear().toString() +
        (currentDate.getMonth() + 1).toString().padStart(2, "0") +
        currentDate.getDate().toString().padStart(2, "0");

      // 該当する日付のデータがあるか確認
      const existingData = data.find((item) => item.date === formattedDate);

      if (existingData) {
        filledData.push(existingData);
      } else {
        // データがなければ0で初期化されたデータを追加
        filledData.push({
          date: formattedDate,
          PV: 0,
          CV: 0,
          CVR: 0,
          UU: 0,
        });
      }

      currentDate.setDate(currentDate.getDate() + 1); // 次の日付に進む
    }

    return filledData;
  };

  //Dachboardに表示するための加工したデータをformattedAnalyticsに格納
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

  /////////////////////////////////////////////////////////////////////////////////////////////////////////

  /*サイドバーの開閉状態を保持する */
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const getAnalyticsData = (propertyId) => {
    if (!formattedAnalytics || formattedAnalytics.length === 0) {
      console.warn("formattedAnalytics is empty or undefined.");
      return [];
    }
    const filteredAnalytics = formattedAnalytics.filter(
      (entry) => entry.properties_id === propertyId
    );

    if (filteredAnalytics.length === 0) {
      console.warn("No analytics data found for Property ID:", propertyId);
      return [];
    }

    return filteredAnalytics.map((entry) => ({
      date: entry.date,
      PV: entry.screen_page_views || 0,
      CV: entry.conversions || 0,
      CVR: entry.sessions
        ? ((entry.conversions / entry.sessions) * 100).toFixed(2)
        : 0, // CVRをパーセント表示
      UU: entry.sessions || 0,
    }));
  };

  const filterDataByDateRange = (data, range) => {
    if (!Array.isArray(data)) {
      console.warn("Provided data is not an array:", data); // デバッグ用ログ
      return [];
    }
    const now = new Date();
    const year = now.getFullYear();
    const month = ("0" + (now.getMonth() + 1)).slice(-2);
    const day = ("0" + now.getDate()).slice(-2);

    let endDate = `${year}${month}${day}`;
    let startDate = endDate;
    console.log("startdate:", endDate);

    switch (range) {
      case "過去7日間":
        startDate = endDate - 11;
        console.log("startdate:", startDate);
        break;
      case "過去30日間":
        startDate = endDate - 100;

        break;
      case "過去90日間":
        startDate = encodeURIComponentDate - 300;

        break;
      case "カスタム":
        startDate = endDate; // カスタム範囲で選択された日付

        break;
      default:
        data;
    }

    if (!Array.isArray(data)) {
      ensureDataForDateRange(data, startDate, endDate);
    }

    // データのフィルタリング処理（開始日以降のデータのみ残す）
    return data.filter((item) => item.date >= startDate);
  };

  // useEffectでデータをフィルタリングし、更新
  useEffect(() => {
    if (analyticsData.length > 0) {
      const filtered = filterDataByDateRange(analyticsData, dateRange);
      setFilteredData(filtered); // 絞り込んだデータを保存
    }
  }, [analyticsData, dateRange]); // データや範囲が変わった時に実行

  useEffect(() => {
    if (propertyId) {
      const data = getAnalyticsData(propertyId);
      const filtered = filterDataByDateRange(data, dateRange);
      console.log("data:", data);
      console.log("dateRange", dateRange);
      console.log("Fetched Data for Property:", data); // デバッグ用ログ
      console.log("filtered data:", filtered);
      setFilteredData(filtered);
    }
  }, [propertyId, dateRange]);

  //要修正//////////////////////////////////////////////////////////////////////////////////
  // 前月のデータを取得
  useEffect(() => {
    if (filteredData.length > 0) {
      const previousData = getPreviousMonthData(filteredData, dateRange);
      calculateCurrentAndPreviousData(filteredData, previousData);
    }
  }, [filteredData, dateRange]);

  const calculateCurrentAndPreviousData = (filteredData, previousData) => {
    let totalPV = 0,
      totalCV = 0,
      totalUU = 0;
    // ループ処理でPV, CV, UUを集計
    filteredData.forEach((data) => {
      totalPV += data.PV || 0;
      totalCV += data.CV || 0;
      totalUU += data.UU || 0;
    });

    const currentData = {
      PV: totalPV,
      CV: totalCV,
      UU: totalUU,
    };

    const previousMonthData = {
      PV: previousData.reduce((acc, curr) => acc + curr.PV, 0),
      CV: previousData.reduce((acc, curr) => acc + curr.CV, 0),
      UU: previousData.reduce((acc, curr) => acc + curr.UU, 0),
    };

    console.log("Current Data:", currentData); // デバッグ用ログ
    console.log("Previous Month Data:", previousMonthData); // デバッグ用ログ

    //setChartData(dataForDateRange);
    // サンプルメトリクスの設定
    setMetrics([
      {
        title: "PV (ページ閲覧数)",
        value: currentData.PV || 0,
        previousValue: previousMonthData.PV || 0,
      },
      {
        title: "CV (お問い合わせ数)",
        value: currentData.CV || 0,
        previousValue: previousMonthData.CV || 0,
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
      {
        title: "UU (セッション数)",
        value: currentData.UU || 0,
        previousValue: previousMonthData.UU || 0,
      },
    ]);
  };

  //setChartData(dataForDateRange);
  //}, [propertyId, dateRange]);

  const handleMetricChange = (metricTitle) => {
    setSelectedMetric(metricTitle);
  };

  const renderContent = () => {
    // デフォルトで表示するサンプルデータ
    const sampledata = [
      { date: "2024-09-01", PV: 0, CV: 0, CVR: 0, UU: 0 },
      { date: "2024-09-02", PV: 0, CV: 0, CVR: 0, UU: 0 },
      { date: "2024-09-03", PV: 0, CV: 0, CVR: 0, UU: 0 },
    ];
    if (!filteredData || filteredData.length === 0) {
      return <LineChart data={sampledata} dataKey="PV" />;
    }

    if (selectedMetric === "PV (ページ閲覧数)") {
      return <LineChart data={filteredData} dataKey="PV" />;
    }
    if (selectedMetric === "CV (お問い合わせ数)") {
      return <LineChart data={filteredData} dataKey="CV" />;
    }
    if (selectedMetric === "CVR (お問い合わせ率)") {
      return <LineChart data={filteredData} dataKey="CVR" />;
    }
    if (selectedMetric === "UU (セッション数)") {
      return <LineChart data={filteredData} dataKey="UU" />;
    }
    return <div>URLを入力してください</div>;
  };

  function getQuery(searchData, searchId) {
    // 最後の / を削除
    const sanitizedUrl = url.replace(/\/+$/, "");
    console.log(sanitizedUrl);
    console.log("propertyId:", propertyId);
    console.log("aggregatedData".aggregatedData);

    const queryData = searchData[searchId]?.[sanitizedUrl]?.query;
    console.log("QueryData: ", queryData);

    if (!queryData) {
      return [];
    }

    const sortedEntries = Object.entries(queryData).sort((a, b) => b[1] - a[1]);
    const top7Queries = sortedEntries.slice(0, 7);
    console.log("top7Queries: ", top7Queries);
    return top7Queries;
  }

  const topQueries = getQuery(aggregatedData, propertyId);

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
        urlList={urlList}
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
              onValueChange={handleDateRangeChange}
              className="dashboard-select"
            >
              <SelectTrigger
                className="select-trigger"
                onClick={() => setIsOpen(!isOpen)}
              >
                {dateRange || "日付範囲を選択してください"}
              </SelectTrigger>
              <SelectContent className={isOpen ? "open" : "closed"}>
                <SelectItem value="過去7日間" className="select-menu">
                  過去7日間
                </SelectItem>
                <SelectItem value="過去30日間" className="select-menu">
                  過去30日間
                </SelectItem>
                <SelectItem value="過去90日間" className="select-menu">
                  過去90日間
                </SelectItem>
                <SelectItem value="カスタム" className="select-menu">
                  カスタム
                </SelectItem>
                {showCalendar && (
                  <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(range) => {
                      setStartDate(range.startDate);
                      setEndDate(range.endDate);
                      filterDataByDateRange("カスタム"); // カスタム範囲でデータをフィルタリング
                    }}
                  />
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="dashboard-main-right">
            <div className="center-content">
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
              <div className="chart-content">
                <Card className="chart-card">
                  <CardContent className="chart-card-content">
                    <div className="chart">
                      {renderContent()}{" "}
                      {/* ここで選択されたメトリクスに応じたグラフを表示 */}
                    </div>
                  </CardContent>
                </Card>
                <div className="dashboard-details">
                  <button
                    onClick={() => router.push("/details")}
                    className="details-button"
                  >
                    詳細
                  </button>
                </div>
              </div>
            </div>
            <div className="dashboard-sidebar">
              <h3 className="sidebar-title">検索キーワード</h3>
              <div className="search-keywords">
                {topQueries.map((Item, index) => (
                  <SearchKeyword
                    key={index}
                    keyword={Item[0]}
                    count={Item[1]}
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
