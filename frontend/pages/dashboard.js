import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import { fetchAggregatedDataFromDashboard } from "../lib/getData";
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

  const normalizeDate = (date) => {
    date.setHours(0, 0, 0, 0); // 時間を00:00:00にリセットして、時間部分を無視する
    return date;
  };

  console.log("Filter Date Range Start:", startDate, "End:", endDate); // デバッグ用ログ
  const filteredData = data.filter((item) => {
    const itemDate = new Date(item.date);
    return itemDate >= startDate && itemDate <= endDate;
  });
  return filteredData;
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
  const [propertyIds, setPropertyIds] = useState([]);
  const [loading, setLoading] = useState(false); // ローディング中かどうかの状態を管理
  const [accountIds, setAccountIds] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [searchConsoleData, setSearchConsoleData] = useState([]);
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
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState(""); // URL用のstate
  const [metrics, setMetrics] = useState(sampleMetrics); // メトリクスのstate
  const [selectedMetric, setSelectedMetric] = useState("PV (ページ閲覧数)"); // 選択中のメトリクス
  const [searchKeywords, setSearchKeywords] = useState([]); // 検索キーワードのstate
  const [analyticsData, setAnalyticsData] = useState([]);
  const [dataForDateRange, setDataForDateRange] = useState([]);
  const [formattedAnalytics, setFormattedAnalytics] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const router = useRouter();

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
      console.log("PropertyIds: ", allProperties); // デバッグ用

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
    return propertyId;
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

    const analyticsData = filteredAnalytics.map((entry) => ({
      date: entry.date,
      PV: entry.screen_page_views,
      CV: entry.conversions,
      CVR: entry.sessions ? entry.conversions / entry.sessions : 0,
      UU: entry.sessions,
    }));

    console.log(
      "Analytics Data for Property ID",
      propertyId,
      ":",
      analyticsData
    ); // デバッグ用ログ
    return analyticsData;
  };

  useEffect(() => {
    if (propertyId) {
      const data = getAnalyticsData(propertyId);
      console.log("Fetched Data for Property:", data); // デバッグ用ログ
      setFilteredData(data);
    }
  }, [propertyId]);

  // プロパティIDに基づいてanalyticsデータを取得

  // 日付範囲に基づいてデータをフィルタリング
  //const dataForDateRange = filterByDateRange(filteredData, dateRange);

  //要修正//////////////////////////////////////////////////////////////////////////////////
  // 前月のデータを取得
  useEffect(() => {
    if (filteredData.length > 0) {
      const previousData = getPreviousMonthData(filteredData, dateRange);
      calculateCurrentAndPreviousData(filteredData, previousData);
    }
  }, [filteredData, dateRange]);

  // 集計データを取得
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

  // 最新のデータを取得
  /*const currentData = {
      PV: dataForDateRange.reduce((acc, curr) => acc + curr.PV, 0),
      CV: dataForDateRange.reduce((acc, curr) => acc + curr.CV, 0),
      UU: dataForDateRange.reduce((acc, curr) => acc + curr.UU, 0),
    };*/
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
    <div>上欄にURLを入力してください</div>;

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
