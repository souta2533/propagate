import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { FaSearch, FaTrash } from "react-icons/fa";
import { Settings, UserRoundPen, Mail, LogOut } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useSessionData } from "../hooks/useSessionData";
import { useDataByDay } from "../hooks/useGetDataByDay";
import { useAnalyticsData } from "../hooks/useAnalyticsData";
import { useSearchConsoleData } from "../hooks/useSearchConsoleData";
import { useAggregatedData } from "../hooks/useAggregatedData";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { Card, CardContent } from "../components/ui/Card";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import Sidebar from "../components/ui/Sidebar";
import MetricCard from "../components/ui/MetricCard";
import LineChart from "../components/graph/LineChart";
import BarChart from "../components/graph/BarChart";
import PieChart from "../components/graph/PieChart";
import PercentageTable from "../components/graph/PercentageTable";
import Table from "../components/graph/Table";
import Table2 from "../components/graph/Table2";
import WebMetricsChart from "../components/graph/WebMetricsChart";
import TriangleChart from "../components/graph/TriangleChart";
import "../styles/dashboard.css";

const customStyles1 = {
  control: (provided) => ({
    ...provided,
    backgroundColor: "#000000",
    color: "#ffffff",
    border: "2px solid #ffffff",
    borderRadius: "10vw",
    boxShadow: "none",
    padding: "0.5vw",
    cursor: "pointer",
    width: "15vw",
    overflowX: "scroll",
    alignItems: "center",

    "@media (max-width: 768px)": {
      width: "40vw",
      padding: "1vw",
      overflowX: "scroll",
      alignItems: "center",
    },
  }),
  "&:hover": {},
  menu: (provided) => ({
    ...provided,
    backgroundColor: "#ffffff", // メニュー背景色
    zIndex: 9999, // メニューが他の要素の上に表示されるように
  }),
  "&:hover": {},
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? "#f0f0f0" : "#fff", // フォーカスされたときのオプションの背景色
    color: state.isFocused ? "#333" : "#000", // フォーカスされたときのオプションの文字色
    padding: 10,
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#ffffff", // 選択されたオプションのテキスト色
  }),
};

const customStyles2 = {
  control: (provided) => ({
    ...provided,
    border: "none",
    boxShadow: "none",
    padding: "5px 10px",
    cursor: "pointer",
    backgroundColor: "#f0f0f0",
    overflowX: "scroll",
  }),
  "&:hover": {},
  menu: (provided) => ({
    ...provided,
    backgroundColor: "#ffffff", // メニュー背景色
    zIndex: 9999, // メニューが他の要素の上に表示されるように
  }),
  "&:hover": {},
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? "#f0f0f0" : "#fff", // フォーカスされたときのオプションの背景色
    color: state.isFocused ? "#333" : "#000", // フォーカスされたときのオプションの文字色
    padding: 10,
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#333", // 選択されたオプションのテキスト色
  }),
};

const Dashboard = () => {
  const sampledata2 = [
    { date: "2024-09-01", PV: 0, CV: 102, CVR: 6.42, UU: 1321 },
    { date: "2024-09-02", PV: 1498, CV: 76, CVR: 5.07, UU: 1210 },
    { date: "2024-09-03", PV: 1678, CV: 123, CVR: 7.33, UU: 1456 },
    { date: "2024-09-04", PV: 1543, CV: 110, CVR: 7.13, UU: 1345 },
    { date: "2024-09-05", PV: 1398, CV: 134, CVR: 9.59, UU: 1234 },
    { date: "2024-09-06", PV: 1487, CV: 89, CVR: 5.98, UU: 1123 },
    { date: "2024-09-07", PV: 1734, CV: 145, CVR: 8.36, UU: 1432 },
    { date: "2024-09-08", PV: 1599, CV: 102, CVR: 6.38, UU: 1321 },
    { date: "2024-09-09", PV: 1478, CV: 76, CVR: 5.14, UU: 1210 },
    { date: "2024-09-10", PV: 1345, CV: 123, CVR: 9.14, UU: 1456 },
    { date: "2024-09-11", PV: 1689, CV: 110, CVR: 6.51, UU: 1345 },
    { date: "2024-09-12", PV: 1534, CV: 134, CVR: 8.74, UU: 1234 },
    { date: "2024-09-13", PV: 1456, CV: 89, CVR: 6.11, UU: 1123 },
    { date: "2024-09-14", PV: 1723, CV: 145, CVR: 8.41, UU: 1432 },
    { date: "2024-09-15", PV: 1589, CV: 102, CVR: 6.42, UU: 1321 },
    { date: "2024-09-16", PV: 1498, CV: 76, CVR: 5.07, UU: 1210 },
    { date: "2024-09-17", PV: 1678, CV: 123, CVR: 7.33, UU: 1456 },
    { date: "2024-09-18", PV: 1543, CV: 110, CVR: 7.13, UU: 1345 },
    { date: "2024-09-19", PV: 1398, CV: 134, CVR: 9.59, UU: 1234 },
    { date: "2024-09-20", PV: 1487, CV: 89, CVR: 5.98, UU: 1123 },
    { date: "2024-09-21", PV: 1734, CV: 145, CVR: 8.36, UU: 1432 },
    { date: "2024-09-22", PV: 1599, CV: 102, CVR: 6.38, UU: 1321 },
    { date: "2024-09-23", PV: 1478, CV: 76, CVR: 5.14, UU: 1210 },
    { date: "2024-09-24", PV: 1345, CV: 123, CVR: 9.14, UU: 1456 },
    { date: "2024-09-25", PV: 1689, CV: 110, CVR: 6.51, UU: 1345 },
    { date: "2024-09-26", PV: 1534, CV: 134, CVR: 8.74, UU: 1234 },
    { date: "2024-09-27", PV: 1456, CV: 89, CVR: 6.11, UU: 1123 },
    { date: "2024-09-28", PV: 1723, CV: 145, CVR: 8.41, UU: 1432 },
    { date: "2024-09-29", PV: 1589, CV: 102, CVR: 6.42, UU: 1321 },
    { date: "2024-09-30", PV: 1498, CV: 76, CVR: 5.07, UU: 1210 },
  ];

  // サンプルメトリクスデータ
  const sampleMetrics = [
    {
      title: "ページ閲覧数(PV)",
      value: "-",
      previousValue: "-",
    },
    {
      title: "セッション数(UU)",
      value: "-",
      previousValue: "-",
    },
    {
      title: "問い合わせ率(CVR)",
      value: "-",
      previousValue: "-",
    },
    {
      title: "問い合わせ数(CV))",
      value: "-",
      previousValue: "-",
    },
  ];

  const options = [
    { value: "過去7日間", label: "過去7日間" },
    { value: "過去28日間", label: "過去28日間" },
    { value: "過去90日間", label: "過去90日間" },
    { value: "先月", label: "先月" },
    { value: "先々月", label: "先々月" },
    { value: "1年間", label: "1年間" },
    { value: "全期間", label: "全期間" },
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
  const [startDate7, setStartDate7] = useState(() => {
    const date7 = new Date();
    date7.setDate(date7.getDate() - 7);
    console.log("SDate7:", date7.toISOString().split("T")[0]);
    const formattedDate = date7.toISOString().split("T")[0];
    console.log("Formatted Date:", formattedDate);
    return formattedDate;
  });
  const [aggregatedData, setAggregatedData] = useState({});
  const [aggregatedData7, setAggregatedData7] = useState({});
  const [aggregatedData28, setAggregatedData28] = useState({});
  const [aggregatedData90, setAggregatedData90] = useState({});
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const [propertyId, setPropertyId] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [dateRange, setDateRange] = useState("過去7日間");
  const [selectedOption, setSelectedOption] = useState(null);
  const [url, setUrl] = useState(""); // URL用のstate
  const [urlOptions, setUrlOptions] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [sanitizedUrl, setSanitizedUrl] = useState(null);
  const [metrics, setMetrics] = useState(sampleMetrics); // メトリクスのstate
  const [selectedMetrics, setSelectedMetrics] = useState([]); // 選択中のメトリクス
  const [inputValue, setInputValue] = useState(""); // ここで useState を使って定義

  const [dataForDateRange, setDataForDateRange] = useState([]);
  const [formattedAnalytics, setFormattedAnalytics] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [registeredUrl, setRegisteredUrl] = useState(""); //URL追加ページで登録したURLを保持
  const router = useRouter();

  const [sourceChartData, setSourceChartData] = useState([]);
  //Loadingの設定
  if (loading) {
    return <div>Loading...</div>;
  }

  //localStorageからURLリストを取得
  useEffect(() => {
    const storedUrls = JSON.parse(localStorage.getItem("urlOptions")) || [];
    setUrlOptions(storedUrls);
  }, []);

  const handleUrl = (inputValue) => {
    if (!inputValue) {
      alert("URLを入力してください");
      return;
    }

    console.log("登録されたURL:", inputValue);
    alert(`URL: ${inputValue} が登録されました！`);

    const storedUrls = JSON.parse(localStorage.getItem("urlOptions")) || [];
    const newUrl = { label: inputValue, value: inputValue };
    storedUrls.push(newUrl);
    localStorage.setItem("urlOptions", JSON.stringify(storedUrls));

    setUrlOptions(storedUrls);
  };

  //URL選択時の処理
  const handleUrlChange = (selectedOption) => {
    setSelectedUrl(selectedOption);
    setUrl(selectedOption.value);
    console.log("SelectedURL:", selectedOption.value);
    const url = selectedOption.value;
    const saniUrl = url.replace(/\/+$/, "");
    setSanitizedUrl(saniUrl);
  };

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
  const [dataByDay, setDataByDay] = useState([]);

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

  // data by day (AnalyticsとSearch Console)のデータを取得
  const {
    data: fetchedDataByDay,
    error: dataByDayError,
    isLoading: dataByDayLoading,
    refetch: refetchDataByDay,
  } = useDataByDay(session, propertyIds, startDate, endDate);

  console.log("Data By Day: ", fetchedDataByDay); //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.
  if (dataByDay && dataByDay[propertyId]) {
    console.log("DDBP:", dataByDay[propertyId]);
    console.log("SNURL:", sanitizedUrl);
    console.log("DD:", dataByDay[propertyId][sanitizedUrl]);
  } else {
    console.log("dataByDay または url が存在しないか無効です");
  }

  useEffect(() => {
    if (!session || !propertyIds || !startDate || !endDate) return;

    if (dataByDayError) {
      console.error("Error fetching data by day:", dataByDayError); //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      refetchDataByDay(session, propertyIds, startDate, endDate);
    } else if (
      fetchedDataByDay &&
      Object.values(fetchedDataByDay).some(
        (data) => Object.values(data).length > 0
      )
    ) {
      console.log("Data By Day: ", fetchedDataByDay);
      setDataByDay(fetchedDataByDay);
    } else {
      console.log("Data By Day is empty");
    }
  }, [fetchedDataByDay]);

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
      setAggregatedData(fetchedAggregatedData);
      fetchAggregatedData7();
      console.log("Aggregated Data:", aggregatedData);
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

  // 集計データを取得
  const {
    data: fetchedAggregatedData7,
    error: aggregatedError7,
    isLoading: aggregatedLoading7,
    refetch: refetchAggregatedData7,
  } = useAggregatedData(session, propertyIds, startDate7, endDate);

  const fetchAggregatedData7 = () => {
    console.log("session:", session);
    console.log("propertyIds:", propertyIds);
    console.log("startDate7:", startDate7);
    console.log("endDate:", endDate);
    if (
      !session ||
      !propertyIds.length ||
      !startDate7 ||
      !endDate ||
      aggregatedLoading7
    )
      return; // session, propertyIds, startDate
    if (aggregatedError7) {
      console.error("Error fetching aggregated data:", aggregatedError7);
      refetchAggregatedData7(session, propertyIds, startDate7, endDate); // エラー時にリフェッチ
    }

    if (fetchedAggregatedData7) {
      console.log("Aggregated Data7: ", fetchedAggregatedData7);
      console.log("SDate7:", startDate7);
      console.log("EDate7:", endDate);
      setAggregatedData7(fetchedAggregatedData7);
    }
  };

  {
    /*const handleAggregatedChange = () => {
    if (!session || !propertyIds || !startDate || !endDate) return;

    const data = refetchAggregatedData(
      session,
      propertyIds,
      startDate,
      endDate
    );
    console.log("Aggregated Data 7:", data);
    setAggregatedData7(data);
  };*/
  }

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
    setPropertyId(propertyId);
    setUrl(url);
    const saniUrl = url.replace(/\/+$/, "");
    setSanitizedUrl(saniUrl);
    console.log("SANIUrl:", saniUrl);
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
    if (!analyticsData || analyticsData.length === 0) {
      //console.warn("analyticsDataが空です");
      return;
    }

    const formattedAnalyticsData = analyticsData.map((entry) => {
      // YYYYMMDD形式の日付をYYYY-MM-DDに変換
      const formattedDate = `${entry.date.slice(0, 4)}-${entry.date.slice(
        4,
        6
      )}-${entry.date.slice(6, 8)}`;
      return {
        properties_id: entry.property_id, // property_idをproperties_idに変換
        date: formattedDate, // 表示を変更
        screen_page_views: entry.screen_page_views || 0, // screen_page_viewsを使用
        conversions: entry.conversions || 0, // conversionsを使用
        sessions: entry.sessions || 0, // sessionsを使用};
      };
    });

    setFormattedAnalytics(formattedAnalyticsData);
    console.log("Formatted Analytics:", formattedAnalyticsData);
  }, [analyticsData]); // analyticsDataが変更された時に実行

  /////////////////////////////////////////////////////////////////////////////////////////////////////////

  const parseDate = (dateStr) => new Date(dateStr);

  const filterDataByDateRange = (data, range) => {
    const now = new Date();
    let startDate;

    switch (range) {
      case "過去7日間":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        setStartDate(startDate);
        console.log("StartDate:", startDate);
        break;
      case "過去28日間":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 28);
        setStartDate(startDate);
        console.log("StartDate:", startDate);
        break;
      case "過去90日間":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 90);
        setStartDate(startDate);
        console.log("StartDate:", startDate);
        break;
      case "先月":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        setStartDate(startDate);
        console.log("StartDate:", startDate);
        now.setMonth(now.getMonth(), 0); // 先月の最後の日
        break;
      case "先々月":
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        setStartDate(startDate);
        console.log("StartDate:", startDate);
        now.setMonth(now.getMonth() - 1, 0); // 先々月の最後の日
        break;
      case "1年間":
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        setStartDate(startDate);
        console.log("StartDate:", startDate);
        break;
      case "全期間":
        //startDate = parseDate(data[data.length - 1].date); // データの最古の日付
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        setStartDate(startDate);
        console.log("StartDate:", startDate);
        break;
      default:
        console.log("DATA:", data);
        return data;
    }

    if (Array.isArray(data)) {
      const filteredData = fillMissingDates(data, startDate, now);
      console.log("DatefilteredData :", filteredData);
      return filteredData;
    } else {
      console.error("データが配列ではありません: ", data);
      return generateZeroData();
    }
  }; //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>589

  const fillMissingDates = (data, startDate, endDate) => {
    const result = [];
    const currentDate = new Date(startDate);
    const dataMap = new Map();

    data.forEach((item) => {
      dataMap.set(item.date, item);
    });

    // 開始日と終了日の差分を一度に生成し、配列を作成する
    for (
      let d = new Date(endDate);
      d >= new Date(startDate);
      d.setDate(d.getDate() - 1)
    ) {
      const formattedDate = d.toISOString().split("T")[0]; // YYYY-MM-DD形式で日付をフォーマット

      // Mapに該当日付のデータがあれば、それをresultに追加、なければ0データを追加
      result.push(
        dataMap.get(formattedDate) || {
          date: formattedDate,
          PV: 0,
          CV: 0,
          CVR: 0,
          SS: 0,
        }
      );
    }

    return result;
  };

  const generateZeroData = () => {
    return [
      {
        date: new Date().toISOString().split("T")[0], // デフォルトで現在の日付,
        PV: 0,
        CV: 0,
        CVR: 0,
        UU: 0,
      },
    ];
  };

  // オプションが選択された時に実行される関数
  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value); // 選択されたオプションを状態に保存
    setSelectedOption(e.target.value);
    console.log("selectedOption:", e.target.value);
  };

  const preFilterDataByDateRange = (data, dateRange) => {
    const now = new Date();
    let previousStartDate, previousEndDate;

    switch (dateRange) {
      case "過去7日間":
        previousStartDate = new Date(now);
        previousStartDate.setDate(previousStartDate.getDate() - 14);
        console.log("preStart:", previousStartDate);
        previousEndDate = new Date(now);
        previousEndDate.setDate(previousEndDate.getDate() - 7);
        console.log("preEnd:", previousEndDate);
        break;

      case "過去28日間":
        previousStartDate = new Date(now);
        previousStartDate.setDate(previousStartDate.getDate() - 60);
        console.log("preStart:", previousStartDate);
        previousEndDate = new Date(now);
        previousEndDate.setDate(previousEndDate.getDate() - 30);
        console.log("preEnd:", previousEndDate);
        break;

      case "過去90日間":
        previousStartDate = new Date(now);
        previousStartDate.setDate(previousStartDate.getDate() - 180);
        console.log("preStart:", previousStartDate);
        previousEndDate = new Date(now);
        previousEndDate.setDate(previousEndDate.getDate() - 90);
        console.log("preEnd:", previousEndDate);
        break;
      case "先月":
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1); // 先月の1日
        previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0); // 先月の最後の日
        console.log("preStart:", previousStartDate);
        console.log("preEnd:", previousEndDate);
        break;
      case "先々月":
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 2, 1); // 先々月の1日
        previousEndDate = new Date(now.getFullYear(), now.getMonth() - 1, 0); // 先々月の最後の日
        console.log("preStart:", previousStartDate);
        console.log("preEnd:", previousEndDate);
        break;
      case "1年間":
        previousStartDate = new Date(
          now.getFullYear() - 1,
          now.getMonth(),
          now.getDate()
        ); // 1年前
        previousEndDate = now; // 今日まで
        console.log("preStart:", previousStartDate);
        console.log("preEnd:", previousEndDate);
        break;
      //case "全期間":
      //previousStartDate = parseDate(data[data.length - 1].date); // データの最古の日付
      //break;

      default:
        console.log("PreDATA:", data);
        return data;
    }
    if (Array.isArray(data)) {
      const preFilteredData = fillMissingDates(
        data,
        previousStartDate,
        previousEndDate
      );
      console.log("PreviousData :", preFilteredData);
      return preFilteredData;
    } else {
      console.error("データが配列ではありません: ", data);
      return generateZeroData();
    }
  }; //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>597

  const calculateCurrentAndPreviousData = (filteredData, previousData) => {
    let totalPV = 0,
      totalCV = 0,
      totalUU = 0,
      prePV = 0,
      preCV = 0,
      preUU = 0;

    // ループ処理でPV, CV, UUを集計
    if (Array.isArray(filteredData)) {
      filteredData.forEach((data) => {
        totalPV += data.PV || 0;
        totalCV += data.CV || 0;
        totalUU += data.UU || 0;
      });
      previousData.forEach((data) => {
        prePV += data.PV || 0;
        preCV += data.CV || 0;
        preUU += data.SS || 0;
      });
    }

    const currentData = {
      PV: totalPV,
      CV: totalCV,
      UU: totalUU,
    };

    const preData = {
      PV: prePV,
      CV: preCV,
      UU: preUU,
    };

    console.log("Current Data:", currentData); // デバッグ用ログ
    console.log("Previous Data:", preData); // デバッグ用ログ
    //setChartData(dataForDateRange);
    // サンプルメトリクスの設定
    setMetrics([
      {
        title: "ページ閲覧数(PV)",
        value: currentData.PV || 0,
        previousValue: preData.PV,
      },
      {
        title: "セッション数(UU)",
        value: currentData.UU || 0,
        previousValue: preData.UU,
      },
      {
        title: "問い合わせ数(CV)",
        value: currentData.CV || 0,
        previousValue: preData.CV,
      },
      {
        title: "問い合わせ率(CVR)",
        value:
          currentData.UU > 0
            ? ((currentData.CV / currentData.UU) * 100).toFixed(2) + "%"
            : "0%", // UU が 0 の場合は "0%" を表示
        previousValue:
          preData.UU > 0
            ? ((preData.CV / preData.UU) * 100).toFixed(2) + "%"
            : "0%", // 前月の UU が 0 の場合も "0%" を表示
      },
    ]);
  };

  useEffect(() => {
    if (propertyId) {
      console.log("PROID:", propertyId);
      //const data = getAnalyticsData(propertyId);
      //console.log("data:", data);
      const data = dataByDay[propertyId]?.[sanitizedUrl] || [];
      //console.log("DateByDAY for PRO:", data);
      const filtered = filterDataByDateRange(data, dateRange); //>>>>>>>>>>>>>>>>>>>>>>>>>>>>-300
      const prefiltered = preFilterDataByDateRange(data, dateRange); //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>603
      //console.log("PreData:", prefiltered);
      //console.log("dateRange", dateRange);
      //console.log("Fetched Data for Property:", data); // デバッグ用ログ
      //console.log("filtered data:", filtered);
      setFilteredData(filtered); //>>>>>>>>>-300
      calculateCurrentAndPreviousData(filtered, prefiltered); //>>>>>>>>>>>>>>>646
    }
  }, [sanitizedUrl, dateRange]);

  const handleMetricChange = (metricTitle) => {
    setSelectedMetrics((prevSelectedMetrics) => {
      if (prevSelectedMetrics.includes(metricTitle)) {
        return prevSelectedMetrics.filter((title) => title !== metricTitle);
      } else if (prevSelectedMetrics.length < 2) {
        return [...prevSelectedMetrics, metricTitle];
      } else {
        return [prevSelectedMetrics[1], metricTitle];
      }
    });
  };

  const renderContent = () => {
    if (!filteredData || filteredData.length === 0) {
      return <div>No data</div>;
    }
    if (selectedMetrics.length === 0) {
      return <div>メトリクスを選択してください</div>;
    }

    const dataKeys = selectedMetrics
      .map((metric) => {
        switch (metric) {
          case "ページ閲覧数(PV)":
            return "PV";
          case "セッション数(UU)":
            return "UU";
          case "問い合わせ率(CVR)":
            return "CVR";
          case "問い合わせ数(CV)":
            return "CV";
          default:
            return "";
        }
      })
      .filter((key) => key !== ""); // 空のキーを除外

    console.log("Data Keys:", dataKeys); // デバッグ用ログ

    return <LineChart data={filteredData} dataKeys={dataKeys} />;
  };

  function getQuery(searchData, searchId) {
    // 最後の / を削除

    console.log(sanitizedUrl); // "https://www.propagateinc.com"

    const queryData = searchData[searchId]?.[sanitizedUrl]?.query;
    console.log("QueryData: ", queryData);

    if (!queryData) {
      return [];
    }

    const topQueries = Object.entries(queryData).sort((a, b) => b[1] - a[1]);
    console.log("TopQuery:", topQueries);
    return topQueries;
  }

  const topQueries = getQuery(aggregatedData, propertyId);

  function getSourceData(data, id) {
    const sourceData = data[id]?.[sanitizedUrl]?.source;

    if (!sourceData) {
      return [];
    }
    //console.log("SourceData:", sourceData);
    const sortedEntries = Object.entries(sourceData).sort(
      (a, b) => b[1] - a[1]
    );
    //const top5Entries = sortedEntries.slice(0, 5);

    //const top5SourceData = Object.fromEntries(top5Entries);
    return sortedEntries;
  }

  const sourceData = getSourceData(aggregatedData, propertyId);

  function getDeviceData(data, id) {
    const deviceData = data[id]?.[sanitizedUrl]?.device_category;
    if (!deviceData) {
      return [];
    }
    //console.log("DeviceData:", deviceData);
    const sortedEntries = Object.entries(deviceData).sort(
      (a, b) => b[1] - a[1]
    );
    //const top5Entries = sortedEntries.slice(0, 5);

    //const top5SourceData = Object.fromEntries(top5Entries);
    return sortedEntries;
  }

  const deviceData = getDeviceData(aggregatedData, propertyId);

  function getAreaData(data, id) {
    const areaData = data[id]?.[sanitizedUrl]?.city;
    if (!areaData) {
      return [];
    }
    //console.log("AreaData:", areaData);
    const sortedEntries = Object.entries(areaData).sort((a, b) => b[1] - a[1]);
    //const top5Entries = sortedEntries.slice(0, 5);

    //const top5SourceData = Object.fromEntries(top5Entries);
    return sortedEntries;
  }

  const areaData = getAreaData(aggregatedData, propertyId);

  const SearchKeyword = ({ keyword, count }) => {
    // キーワードが空のときは何も表示しない
    if (!keyword) {
      return null;
    }
    return (
      <div className="search-keyword">
        <FaSearch className="search-icon" />
        <div className="search-info">
          <p className="search-keyword-text">{keyword}</p>
          <p className="search-count-text">{count}回の検索結果</p>
        </div>
      </div>
    );
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen((prevState) => !prevState);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e) => {
    e.preventDefault();
    if (url) {
      console.log("Submitted URL:", url);
      // dashboardにURLをクエリパラメータとして渡してリダイレクト
      router.push(`/dashboard?url=${encodeURIComponent(url)}`);
    } else {
      alert("URLを追加してください。");
    }
  };

  return (
    <div className="dashboard-container">
      <header className="header">
        <div className="header-left">
          <h1 className="header-title">Propagate Analytics</h1>
        </div>
        <div className="header-right">
          <form onSubmit={handleSubmit}>
            <CreatableSelect
              className="url-select"
              styles={customStyles1}
              value={selectedUrl}
              onChange={handleUrlChange}
              options={urlOptions}
              placeholder={
                <div>
                  <FaSearch style={{ marginRight: "2vw" }} />
                  <span>URL選択</span>
                </div>
              }
              onCreateOption={handleUrl}
            />
          </form>
          {/*設定ボタン
            <Button
            variant="ghost"
            startIcon={<Settings className="Icon" />}
            className="header-button"
            ref={buttonRef}
            onClick={toggleDropdown}
          >
            <span className="sr-only"></span>
          </Button>*/}
          {isDropdownOpen && (
            <div className="header-dropdown-menu">
              <Button
                variant="ghost"
                onClick={() => router.push("/dashboard")}
                className="menu-button"
              >
                <UserRoundPen className="icon" />
                <div className="icon-text">プロフィール</div>
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push("/setting/addAccount")}
                className="menu-button"
              >
                <Mail className="icon" />
                <div className="icon-text">アカウント追加</div>
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push("/setting/logout")}
                className="menu-button"
              >
                <LogOut className="icon" />
                <div className="icon-text">ログアウト</div>
              </Button>
            </div>
          )}
        </div>
      </header>
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div className="dashboard-header-left">
            <Select
              className="custom-select"
              styles={customStyles2}
              value={selectedOption}
              onChange={handleDateRangeChange}
              options={options}
              placeholder={
                <div>
                  <FaSearch style={{ marginRight: "2vw" }} />
                  <span>ページパス選択</span>
                </div>
              }
            />
          </div>
          <div className="dashboard-header-right">
            <ToggleButtonGroup
              value={dateRange}
              exclusive
              onChange={handleDateRangeChange}
              aria-label="Date Range"
            >
              <ToggleButton value="過去7日間" aria-label="過去7日間">
                過去7日間
              </ToggleButton>
              <ToggleButton value="過去28日間" aria-label="過去28日間">
                過去28日間
              </ToggleButton>
              <ToggleButton value="過去90日間" aria-label="過去90日間">
                過去90日間
              </ToggleButton>
              <ToggleButton value="カスタム" aria-label="カスタム">
                カスタム
              </ToggleButton>
            </ToggleButtonGroup>
            {/*
            <Select
              className="custom-select"
              styles={customStyles}
              value={selectedOption}
              onChange={handleDateRangeChange}
              options={options}
              placeholder="データ範囲選択"
            />
            */}
          </div>
        </div>
        <div className="dashboard-top">
          <div className="dashboard-top-left">
            <div className="metrics-grid">
              {metrics.map((metric, index) => {
                const isActive = selectedMetrics.includes(metric.title);
                const activeClass = isActive
                  ? selectedMetrics.indexOf(metric.title) === 0
                    ? "first"
                    : "second"
                  : "";
                return (
                  <MetricCard
                    key={index}
                    title={metric.title} // カードのタイトル
                    value={metric.value} // カードに表示する値
                    previousValue={metric.previousValue}
                    isActive={isActive}
                    onClick={() => handleMetricChange(metric.title)}
                    className={`metric-card ${
                      isActive ? "active" : ""
                    } ${activeClass}`}
                  />
                );
              })}
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
              {/*<div className="dashboard-details">
                <button
                  onClick={() => handelButtonClick(propertyId)}
                  className="details-button"
                >
                  詳細
                </button>
              </div>*/}
            </div>
          </div>
          <div className="dashboard-top-right">
            <p className="dashboard-top-right-title">サイトの分析・提案</p>
          </div>
        </div>
        <div className="dashboard-middle">
          <div className="dashboard-middle-content">
            <div className="middle-content-text">
              <p className="middle-title">流入経路</p>
              <p className="middle-subtitle">
                ユーザーがどのような手段や経路を通じてWebサイトを訪れたかを示す数
              </p>
            </div>
            <div className="middle-chart">
              <Table2 data={sourceData} dataKeys="流入数" />
            </div>
          </div>
          <div className="dashboard-middle-content">
            <div className="middle-content-text">
              <p className="middle-title">検索数とクリック数の多いキーワード</p>
              <p className="middle-subtitle">
                Google検索で、Webサイトが検索一覧に表示された回数とクリックされた回数
              </p>
            </div>
            <div className="search-keywords">
              {/*topQueries.map((Item, index) => (
                <SearchKeyword key={index} keyword={Item[0]} count={Item[1]} />
              ))}*/}
              <Table data={topQueries} />
            </div>
          </div>
        </div>
        <div className="dashboard-bottom">
          <div className="dashboard-bottom-left">
            <div className="bottom-content-text">
              <p className="bottom-title">ディバイス</p>
              <p className="bottom-subtitle">
                ユーザーがWebサイトにアクセスする際に使用した機器の割合
              </p>
            </div>
            <div className="bottom-chart">
              <PieChart data={deviceData} />
            </div>
          </div>
          <div className="dashboard-bottom-center">
            <div className="bottom-content-text">
              <p className="bottom-title">地域</p>
              <p className="bottom-subtitle">
                ユーザーがWebサイトにアクセスした地域別の割合
              </p>
            </div>
            <div className="bottom-chart">
              <PercentageTable data={areaData} className="Percentage-graph" />
            </div>
          </div>
          <div className="dashboard-bottom-right">
            <div className="bottom-content-text">
              <p className="bottom-title">性別・男女</p>
              <p className="bottom-subtitle">
                Webサイトにアクセスしたユーザ情報
              </p>
            </div>
            <div className="bottom-chart"></div>
          </div>
        </div>
      </main>
      {/*<Sidebar className="sidebar" />*/}
    </div>
  );
};

export default Dashboard;
