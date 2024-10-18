import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FaSearch } from "react-icons/fa";
import { supabase } from "../lib/supabaseClient";
import { useSessionData } from "../hooks/useSessionData";
import { useDataByDay } from "../hooks/useGetDataByDay";
import { useAnalyticsData } from "../hooks/useAnalyticsData";
import { useSearchConsoleData } from "../hooks/useSearchConsoleData";
import { useAggregatedData } from "../hooks/useAggregatedData";
import { useAggregatedData7 } from "../hooks/useAggregatedData7";
import { useAggregatedData90 } from "../hooks/useAggregatedData90";
import { usePreAggregatedData } from "../hooks/usePreAggregatedData";
import { usePreAggregatedData7 } from "../hooks/usePreAggregatedData7";
import { usePreAggregatedData90 } from "../hooks/usePreAggregatedData90";
import { useLLMReports } from "../hooks/useAIData";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { Card, CardContent } from "../components/ui/Card";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import MetricCard from "../components/ui/MetricCard";
import LineChart from "../components/graph/LineChart";
import PieChart from "../components/graph/PieChart";
import PercentageTable from "../components/graph/PercentageTable";
import Table from "../components/graph/Table";
import Table2 from "../components/graph/Table2";
import ChatComponent from "../components/ChatComponent";
import "../styles/dashboard.css";

const styles1 = {
  control: (provided) => ({
    ...provided,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
    color: "#ffffff",
    border: "2px solid #ffffff",
    borderRadius: "10vw",
    boxShadow: "none",
    padding: "0vw",
    cursor: "pointer",
    width: "20vw",
    height: "0.5vw",
    overflowX: "scroll",
    overflowY: "hidden",
    alignItems: "center",

    "@media (max-width: 768px)": {
      width: "40vw",
      padding: "0 1vw",
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

const styles2 = {
  control: (provided) => ({
    ...provided,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "none",
    boxShadow: "none",
    padding: "0 7px",
    width: "20vw",
    height: "0.5vw",
    cursor: "pointer",
    backgroundColor: "#e5e5e5",
    overflowX: "scroll",
    overflowY: "hidden",

    "@media (max-width: 768px)": {
      width: "50vw",
      padding: "0 1vw",
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
    color: "#333", // 選択されたオプションのテキスト色
  }),
};

const Dashboard = () => {
  // PieChartのサンプルデータ
  const SampleData = [
    ["desktop", 500],
    ["mobile", 300],
    ["tablet", 150],
    ["smart tv", 50],
    ["other device", 20],
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

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true); // ローディング中かどうかの状態を管理
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
    return date7.toISOString().split("T")[0];
  });
  const [startDate90, setStartDate28] = useState(() => {
    const date90 = new Date();
    date90.setMonth(date90.getMonth() - 3); // 今日から1ヶ月前の日付を設定
    return date90.toISOString().split("T")[0]; // YYYY-MM-DD 形式で取得
  });
  const [preStartDate, setPreStartDate] = useState(() => {
    const preDate = new Date();
    preDate.setMonth(preDate.getMonth() - 2); // 今日から2ヶ月前の日付を設定
    return preDate.toISOString().split("T")[0]; // YYYY-MM-DD 形式で取得
  });
  const [preEndDate, setPreEndDate] = useState(() => {
    const preEndDate = new Date();
    preEndDate.setMonth(preEndDate.getMonth() - 1); // 今日から1ヶ月前の日付を設定
    return preEndDate.toISOString().split("T")[0]; // YYYY-MM-DD 形式で取得
  });
  const [preStartDate7, setPreStartDate7] = useState(() => {
    const preDate7 = new Date();
    preDate7.setDate(preDate7.getDate() - 14);
    return preDate7.toISOString().split("T")[0];
  });
  const [preEndDate7, setPreEndDate7] = useState(() => {
    const preEndDate7 = new Date();
    preEndDate7.setDate(preEndDate7.getDate() - 7);
    return preEndDate7.toISOString().split("T")[0];
  });
  const [preStartDate90, setPreStartDate90] = useState(() => {
    const preDate90 = new Date();
    preDate90.setMonth(preDate90.getMonth() - 6); // 今日から1ヶ月前の日付を設定
    return preDate90.toISOString().split("T")[0]; // YYYY-MM-DD 形式で取得
  });
  const [preEndDate90, setPreEndDate90] = useState(() => {
    const preEndDate90 = new Date();
    preEndDate90.setMonth(preEndDate90.getMonth() - 3); // 今日から1ヶ月前の日付を設定
    return preEndDate90.toISOString().split("T")[0]; // YYYY-MM-DD 形式で取得
  });
  const [aggregatedData, setAggregatedData] = useState({});
  const [aggregatedData7, setAggregatedData7] = useState({});
  const [aggregatedData90, setAggregatedData90] = useState({});
  const [totalData, setTotalData] = useState({});
  const [preAggregatedData, setPreAggregatedData] = useState({});
  const [preAggregatedData7, setPreAggregatedData7] = useState({});
  const [preAggregatedData90, setPreAggregatedData90] = useState({});
  const [preTotalData, setPreTotalData] = useState({});
  const [hasRunTotal, setHasRunTotal] = useState(false);
  const [hasRunAgg, setHasRunAgg] = useState(false);
  const [hasRunAgg7, setHasRunAgg7] = useState(false);
  const [hasRunAgg90, setHasRunAgg90] = useState(false);
  const [hasRunPreAgg, setHasRunPreAgg] = useState(false);
  const [hasRunPreAgg7, setHasRunPreAgg7] = useState(false);
  const [hasRunPreAgg90, setHasRunPreAgg90] = useState(false);

  const [hasRunDataByDay, setHasRunDataByDay] = useState(false);
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const [propertyId, setPropertyId] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [dateRange, setDateRange] = useState("過去28日間");
  const [selectedOption, setSelectedOption] = useState(null);
  const [url, setUrl] = useState(""); // URL用のstate
  const [urlOptions, setUrlOptions] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [sanitizedUrl, setSanitizedUrl] = useState(null);
  const [pagePath, setPagePath] = useState(null);
  const [selectedPagePath, setSelectedPagePath] = useState("/");
  const [pagePathOptions, setPagePathOptions] = useState([]);
  const [pagePathList, setPagePathList] = useState([]);
  const [metrics, setMetrics] = useState(sampleMetrics); // メトリクスのstate
  const [selectedMetrics, setSelectedMetrics] = useState([
    "ページ閲覧数(PV)",
    "セッション数(UU)",
  ]); // 選択中のメトリクス
  const [inputValue, setInputValue] = useState(""); // ここで useState を使って定義.........................................

  const [dataForDateRange, setDataForDateRange] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const router = useRouter();

  //............................................要変更
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
  const handleUrlChange = (e) => {
    if (!e) {
      alert("URLを選択してください");
      return;
    }

    setSelectedUrl(e);
    setUrl(e.value);
    console.log("SelectedURL:", e.value);
    const url = e.value;

    const foundPropertyId = findPropertyIdByUrl(url);
    if (foundPropertyId) {
      setPropertyId(foundPropertyId);
    } else {
      console.error("該当するプロパティが見つかりません");
    }

    const saniUrl = url.replace(/\/+$/, "");
    setSanitizedUrl(saniUrl);
  };

  const handlePagePathChange = (e) => {
    setSelectedPagePath(e);
    setPagePath(e.value);
    console.log(e);
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, pagePath: e.value },
      },
      undefined,
      { shallow: true } // パスを変更せずにデータを更新
    );
    const chartData = dataByDay[propertyId][e.value];
    const filteredData = filterDataByDateRange(chartData, dateRange);
    setChartData(filteredData);
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
  const [llmReports, setLLMReports] = useState([]);

  // Anlyticsデータの取得
  const {
    data: fetchedAnalyticsData,
    error: analyticsError,
    isLoading: analyticsLoading,
    refetch: refetchAnalyticsData,
  } = useAnalyticsData(session, setPropertyIds);

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
    fetchedSearchConsoleData,
    refetchSearchConsoleData,
  ]);

  // data by day (AnalyticsとSearch Console)のデータを取得
  const {
    data: fetchedDataByDay,
    error: dataByDayError,
    isLoading: dataByDayLoading,
    refetch: refetchDataByDay,
  } = useDataByDay(session, propertyIds, startDate, endDate);

  //console.log("Data By Day: ", fetchedDataByDay);

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
  }, [fetchedDataByDay, dataByDayError, dataByDayLoading, refetchDataByDay]);

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

    if (fetchedAggregatedData && !hasRunAgg) {
      setAggregatedData(fetchedAggregatedData);
      setHasRunAgg(true);
      if (!hasRunTotal) {
        setTotalData(fetchedAggregatedData);
        setHasRunTotal(true);
      }
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
  } = useAggregatedData7(session, propertyIds, startDate7, endDate);

  useEffect(() => {
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
      if (!hasRunAgg7) {
        setAggregatedData7(fetchedAggregatedData7);
        setHasRunAgg7(true);
      }
    }
    console.log("deback");
  }, [
    session,
    propertyIds,
    startDate7,
    endDate,
    aggregatedError7,
    aggregatedLoading7,
    refetchAggregatedData7,
  ]);

  // 集計データを取得
  const {
    data: fetchedAggregatedData90,
    error: aggregatedError90,
    isLoading: aggregatedLoading90,
    refetch: refetchAggregatedData90,
  } = useAggregatedData90(session, propertyIds, startDate90, endDate);

  useEffect(() => {
    if (
      !session ||
      !propertyIds.length ||
      !startDate90 ||
      !endDate ||
      aggregatedLoading90
    )
      return; // session, propertyIds, startDate
    if (aggregatedError90) {
      console.error("Error fetching aggregated data:", aggregatedError90);
      refetchAggregatedData90(session, propertyIds, startDate90, endDate); // エラー時にリフェッチ
    }

    if (fetchedAggregatedData90 && !hasRunAgg90) {
      console.log("Aggregated Data90: ", fetchedAggregatedData90);
      setAggregatedData90(fetchedAggregatedData90);
      setHasRunAgg90(true);
    }
  }, [
    session,
    propertyIds,
    startDate90,
    endDate,
    aggregatedError90,
    aggregatedLoading90,
    refetchAggregatedData90,
  ]);

  // 集計データを取得
  const {
    data: fetchedPreAggregatedData,
    error: preAggregatedError,
    isLoading: preAggregatedLoading,
    refetch: refetchPreAggregatedData,
  } = usePreAggregatedData(session, propertyIds, preStartDate, preEndDate);

  useEffect(() => {
    if (
      !session ||
      !propertyIds.length ||
      !preStartDate ||
      !preEndDate ||
      preAggregatedLoading
    )
      return; // session, propertyIds, startDate
    if (preAggregatedError) {
      console.error("Error fetching aggregated data:", preAggregatedError);
      refetchPreAggregatedData(session, propertyIds, preStartDate, preEndDate); // エラー時にリフェッチ
    }

    if (fetchedPreAggregatedData && !hasRunPreAgg) {
      console.log("PreAggregated Data: ", fetchedPreAggregatedData);
      setPreAggregatedData(fetchedPreAggregatedData);
      setPreTotalData(fetchedPreAggregatedData);
      setHasRunPreAgg(true);
    }
  }, [
    session,
    propertyIds,
    preStartDate,
    preEndDate,
    preAggregatedError,
    preAggregatedLoading,
    refetchPreAggregatedData,
  ]);

  // 集計データを取得
  const {
    data: fetchedPreAggregatedData7,
    error: preAggregatedError7,
    isLoading: preAggregatedLoading7,
    refetch: refetchPreAggregatedData7,
  } = usePreAggregatedData7(session, propertyIds, preStartDate7, preEndDate7);

  useEffect(() => {
    if (
      !session ||
      !propertyIds.length ||
      !preStartDate7 ||
      !preEndDate7 ||
      preAggregatedLoading7
    )
      return; // session, propertyIds, startDate
    if (preAggregatedError7) {
      console.error("Error fetching aggregated data:", preAggregatedError7);
      refetchPreAggregatedData7(
        session,
        propertyIds,
        preStartDate7,
        preEndDate7
      ); // エラー時にリフェッチ
    }

    if (fetchedPreAggregatedData7 && !hasRunPreAgg7) {
      console.log("PreAggregated Data7: ", fetchedPreAggregatedData7);
      setPreAggregatedData7(fetchedPreAggregatedData7);
      setHasRunPreAgg7(true);
    }
  }, [
    session,
    propertyIds,
    preStartDate7,
    preEndDate7,
    preAggregatedError7,
    preAggregatedLoading7,
    refetchPreAggregatedData7,
  ]);

  // 集計データを取得
  const {
    data: fetchedPreAggregatedData90,
    error: preAggregatedError90,
    isLoading: preAggregatedLoading90,
    refetch: refetchPreAggregatedData90,
  } = usePreAggregatedData90(
    session,
    propertyIds,
    preStartDate90,
    preEndDate90
  );

  useEffect(() => {
    if (
      !session ||
      !propertyIds.length ||
      !preStartDate90 ||
      !preEndDate90 ||
      preAggregatedLoading90
    )
      return; // session, propertyIds, startDate
    if (preAggregatedError90) {
      console.error("Error fetching aggregated data:", preAggregatedError90);
      refetchPreAggregatedData90(
        session,
        propertyIds,
        preStartDate90,
        preEndDate90
      ); // エラー時にリフェッチ
    }

    if (fetchedPreAggregatedData90 && !hasRunPreAgg90) {
      console.log("PreAggregated Data90: ", fetchedPreAggregatedData90);
      setPreAggregatedData90(fetchedPreAggregatedData90);
      setHasRunPreAgg90(true);
    }
  }, [
    session,
    propertyIds,
    preStartDate90,
    preEndDate90,
    preAggregatedError90,
    preAggregatedLoading90,
    refetchPreAggregatedData90,
  ]);

  // Analyticsデータの処理
  useEffect(() => {
    if (!session || analyticsLoading) return; // sessionがないかロード中の場合は何もしない

    if (analyticsError) {
      console.error("Error fetching analytics data:", analyticsError);
      //refetchAnalyticsData(session); // エラー時にリフェッチ
    } else if (fetchedAnalyticsData) {
      console.log("Fetched Analytics Data: ", fetchedAnalyticsData);
      setAnalyticsData(fetchedAnalyticsData.allAnalytics);
      setPropertyIds(fetchedAnalyticsData.allProperties);

      if (fetchedAnalyticsData.initialFilteredProperties) {
        console.log(
          "FIRSTURL:",
          fetchedAnalyticsData.initialFilteredProperties
        );
        const initialUrls = fetchedAnalyticsData.initialFilteredProperties
          .map((item) => item.url)
          .filter((url) => url !== "");
        console.log("URLS:", initialUrls);
        const initialUrlsList = initialUrls.map((url) => ({
          label: url,
          value: url,
        }));
        setUrlOptions(initialUrlsList);
        handleUrlChange(initialUrlsList[0]);
      } else {
        console.warn("initialFilteredProperties is undefined or null");
      }
    }
  }, [
    session,
    analyticsError,
    analyticsLoading,
    refetchAnalyticsData,
    dataByDay,
  ]);

  useEffect(() => {
    if (dataByDay && dataByDay[propertyId] && url) {
      const list = Object.keys(dataByDay[propertyId]);
      console.log("PathList", list);
      setPagePathList(list);
    }
  }, [dataByDay, propertyId, url]);

  let pagePaths = [];

  if (dataByDay && dataByDay[propertyId] && url) {
    const sanitizedUrl = url.replace(/\/+$/, ""); // URLの末尾のスラッシュを削除
    const urlLength = sanitizedUrl.length; // URLの文字数を取得

    pagePaths = Object.keys(dataByDay[propertyId])
      .map((path) => {
        // URLの長さ分だけフィルターをかける
        const filteredPath = path.substring(urlLength); // URLの長さ分だけ切り取る
        const match = filteredPath.match(/^\/?([^/]+)?$/); // 1階層下のパスを考慮
        if (match) {
          const pagePath = match[1] ? `/${match[1]}` : "/";
          return { value: path, label: pagePath }; // 元のpathと新しいlabelを返す
        }
        return null;
      })
      .filter((path) => path !== null);
  }

  useEffect(() => {
    setPagePathOptions(pagePaths);
    handleFirstPagePath();
  }, [pagePathList, preAggregatedData]);

  const handleFirstPagePath = () => {
    if (
      pagePathList &&
      Array.isArray(pagePathList) &&
      pagePathList.length > 0 &&
      preAggregatedData &&
      areaData
    ) {
      const shortestUrl = pagePathList.reduce((shortest, current) => {
        return current.length < shortest.length ? current : shortest;
      }, pagePathList[0]);
      const shortestUrlOption = { value: shortestUrl, label: "/" };

      handlePagePathChange(shortestUrlOption);

      setLoading(false);
    } else {
      console.warn("pagePathOptions is empty or undefined");
    }
  };

  // LLMからの解析結果を取得
  const {
    data: fetchedLLMReports,
    error: llmReportError,
    isLoading: llmReportLoading,
    refetch: refetchLLMReports,
  } = useLLMReports(session, propertyIds, startDate, endDate);

  useEffect(() => {
    if (
      !session ||
      !propertyIds.length ||
      !startDate ||
      !endDate ||
      llmReportLoading
    )
      return;
    if (llmReportError) {
      console.error("Error fetching LLM report:", llmReportError);
      refetchLLMReports(session, propertyIds, startDate, endDate);
    }

    if (fetchedLLMReports) {
      console.log("Fetched LLM Reports: ", fetchedLLMReports);
      setLLMReports(fetchedLLMReports);
    }
  });

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
    return propertyId;
  };

  const filterDataByDateRange = (data, range) => {
    const now = new Date();
    let startDate;

    switch (range) {
      case "過去7日間":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        setStartDate(startDate);
        //console.log("StartDate:", startDate);
        break;
      case "過去28日間":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 28);
        setStartDate(startDate);
        //console.log("StartDate:", startDate);
        break;
      case "過去90日間":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 90);
        setStartDate(startDate);
        //console.log("StartDate:", startDate);
        break;
      default:
        console.log("DATA:", data);
        return data;
    }

    if (Array.isArray(data)) {
      const filteredData = fillMissingDates(data, startDate, now);
      console.log("filteredData :", filteredData);
      return filteredData;
    } else {
      console.error("データが配列ではありません: ", data);
      return generateZeroData();
    }
  };

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
      const formattedDate = d.toISOString().split("T")[0].replace(/-/g, "/"); // YYYY-MM-DD形式で日付をフォーマット

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
        date: new Date().toISOString().split("T")[0].replace(/-/g, "/"), // デフォルトで現在の日付,
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
    const filteredData = filterDataByDateRange(chartData, e.target.value);
    setChartData(filteredData);
  };

  useEffect(() => {
    let totalDateData;

    if (dateRange === "過去7日間") {
      totalDateData = aggregatedData7;
    } else if (dateRange === "過去28日間") {
      totalDateData = aggregatedData;
    } else if (dateRange === "過去90日間") {
      totalDateData = aggregatedData90;
    } else if (dateRange === "カスタム") {
      totalDateData = aggregatedData;
    } else {
      console.error("No Total Data");
      totalDateData = aggregatedData;
    }

    setTotalData(totalDateData);
    console.log("TOTAL DATA: ", totalDateData);
  }, [dateRange]);

  useEffect(() => {
    let totalPreDateData;

    if (dateRange === "過去7日間") {
      totalPreDateData = preAggregatedData7;
    } else if (dateRange === "過去28日間") {
      totalPreDateData = preAggregatedData;
    } else if (dateRange === "過去90日間") {
      totalPreDateData = preAggregatedData90;
    } else if (dateRange === "カスタム") {
      totalPreDateData = preAggregatedData;
    } else {
      console.error("No Total Data");
      totalPreDateData = preAggregatedData;
    }

    setPreTotalData(totalPreDateData);
    console.log("PRE TOTAL DATA: ", totalPreDateData);
  }, [dateRange]);

  useEffect(() => {
    const nowData = {
      PV: totalData[propertyId]?.[pagePath]?.PV || 0,
      CV: totalData[propertyId]?.[pagePath]?.CV || 0,
      UU: totalData[propertyId]?.[pagePath]?.UU || 0,
    };

    const prevData = {
      PV: preTotalData[propertyId]?.[pagePath]?.PV || 0,
      CV: preTotalData[propertyId]?.[pagePath]?.CV || 0,
      UU: preTotalData[propertyId]?.[pagePath]?.UU || 0,
    };

    // サンプルメトリクスの設定
    setMetrics([
      {
        title: "ページ閲覧数(PV)",
        value: nowData.PV || 0,
        previousValue: prevData.PV,
      },
      {
        title: "セッション数(UU)",
        value: nowData.UU || 0,
        previousValue: prevData.UU,
      },
      {
        title: "問い合わせ数(CV)",
        value: nowData.CV || 0,
        previousValue: prevData.CV,
      },
      {
        title: "問い合わせ率(CVR)",
        value:
          nowData.UU > 0
            ? ((nowData.CV / nowData.UU) * 100).toFixed(2) + "%"
            : "0%", // UU が 0 の場合は "0%" を表示
        previousValue:
          prevData.UU > 0
            ? ((prevData.CV / prevData.UU) * 100).toFixed(2) + "%"
            : "0%", // 前月の UU が 0 の場合も "0%" を表示
      },
    ]);
  }, [dateRange, totalData, pagePath]);

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
    if (!chartData || chartData.length === 0) {
      return <div>データがありません</div>;
    }
    if (selectedMetrics.length === 0) {
      return <div>閲覧したいデータを選択してください</div>;
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

    return <LineChart data={chartData} dataKeys={dataKeys} />;
  };

  function getQuery(searchData, searchId) {
    const queryData = searchData[searchId]?.[pagePath]?.query;
    const viewData = searchData[searchId]?.[pagePath]?.impression;

    if (!queryData) {
      return [];
    }

    const topQueries = Object.entries(queryData).sort((a, b) => b[1] - a[1]);
    //console.log("TopQuery:", topQueries);
    const Queries = topQueries.map((item) => [item[0], item[1], viewData]);
    return Queries;
  }

  const topQueries = getQuery(totalData, propertyId);

  function getSourceData(data, id) {
    const sourceData = data[id]?.[pagePath]?.source;

    if (!sourceData) {
      return [];
    }

    const sortedEntries = Object.entries(sourceData).sort(
      (a, b) => b[1] - a[1]
    );
    return sortedEntries;
  }

  const sourceData = getSourceData(totalData, propertyId);

  function getDeviceData(data, id) {
    const deviceData = data[id]?.[pagePath]?.device_category;
    if (!deviceData) {
      return [];
    }

    const sortedEntries = Object.entries(deviceData).sort(
      (a, b) => b[1] - a[1]
    );
    return sortedEntries;
  }

  const deviceData = getDeviceData(totalData, propertyId);

  function getAreaData(data, id) {
    const areaData = data[id]?.[pagePath]?.city;
    if (!areaData) {
      return [];
    }

    const sortedEntries = Object.entries(areaData).sort((a, b) => b[1] - a[1]);
    return sortedEntries;
  }

  const areaData = getAreaData(totalData, propertyId);

  return (
    <div className="dashboard-container">
      <div>
        {loading ? (
          <div className="loader-content">
            <div className="loader">Loading...</div>
          </div>
        ) : (
          <></>
        )}
      </div>

      <header className="header">
        <div className="header-left">
          <h1 className="header-title">Propagate Analytics</h1>
        </div>
        <div className="header-right">
          <CreatableSelect
            className="url-select"
            styles={styles1}
            value={selectedUrl}
            onChange={(selectedOption) => {
              handleUrlChange(selectedOption);
            }}
            options={urlOptions}
            placeholder={
              <div>
                <FaSearch style={{ marginRight: "1vw" }} />
                <span>URL選択</span>
              </div>
            }
            onCreateOption={handleUrl}
          />
        </div>
      </header>
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div className="dashboard-header-left">
            <Select
              className="custom-select"
              styles={styles2}
              value={selectedPagePath}
              onChange={handlePagePathChange}
              options={pagePathOptions}
              placeholder={
                <div>
                  <FaSearch style={{ marginRight: "1vw" }} />
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
              <div className="middle-content-button"></div>
            </div>
            <div className="search-keywords">
              <Table data={topQueries} viewData={topQueries.viewData} />
            </div>
            <div className="middle-content-bottom"></div>
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
              <PieChart data={SampleData} />
              {/*/////////////////////////////////////////////////////////////////////////////要変更
              <PieChart data={deviceData} />
              */}
            </div>
          </div>
          <div className="dashboard-bottom-center">
            <div className="bottom-content-text">
              <p className="bottom-title">地域</p>
              <p className="bottom-subtitle">
                ユーザーがWebサイトにアクセスした地域別の割合
              </p>
            </div>
            <div className="bottom-graph">
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

        <div>
          <ChatComponent />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
