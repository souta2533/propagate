{
  /*import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useSessionData } from "../../hooks/useSessionData";
import { useDataByDayFromDetails } from "../../hooks/useGetDataByDay";
import { useAnalyticsData } from "../../hooks/useAnalyticsData";
import { useSearchConsoleData } from "../../hooks/useSearchConsoleData";
import { useAggregatedData } from "../../hooks/useAggregatedData";
import Button from "@mui/material/Button";
import Select from "react-select";
import Popover from "../../components/ui/Popover";
import { X, Calendar as CalendarIcon } from "lucide-react";
import LineChart from "../../components/graph/LineChart";
import MultiLineChart from "../../components/graph/MultiLineChart";
import BarChart from "../../components/graph/BarChart";
import PieChart from "../../components/graph/PieChart";
import Table from "../../components/graph/Table";
import Table2 from "../../components/graph/Table2";
import PercentageTable from "../../components/graph/PercentageTable";
import { Grid, Paper, Typography, Box } from "@mui/material";

import "../../styles/details.css";

const customStyles = {
  control: (provided) => ({
    ...provided,
    border: "none",
    boxShadow: "none",
    padding: "5px 10px",
    cursor: "pointer",
  }),
  "&:hover": {},
  menu: (provided) => ({
    ...provided,
    backgroundColor: "#fff", // メニュー背景色
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

export default function Details() {
  const sampledata = [
    { date: "2024-05-15", PV: 1922, CV: 52, CVR: 2.71, UU: 1220 },
    { date: "2024-05-16", PV: 708, CV: 59, CVR: 8.33, UU: 1172 },
    { date: "2024-05-17", PV: 1798, CV: 63, CVR: 3.5, UU: 1104 },
    { date: "2024-05-18", PV: 690, CV: 108, CVR: 15.65, UU: 1164 },
    { date: "2024-05-19", PV: 1464, CV: 97, CVR: 6.63, UU: 532 },
    { date: "2024-05-20", PV: 1548, CV: 115, CVR: 7.43, UU: 1107 },
    { date: "2024-05-21", PV: 867, CV: 140, CVR: 16.15, UU: 1049 },
    { date: "2024-05-22", PV: 793, CV: 191, CVR: 24.09, UU: 1206 },
    { date: "2024-05-23", PV: 1141, CV: 143, CVR: 12.53, UU: 758 },
    { date: "2024-05-24", PV: 573, CV: 191, CVR: 33.33, UU: 1203 },
    { date: "2024-05-25", PV: 1498, CV: 132, CVR: 8.81, UU: 885 },
    { date: "2024-05-26", PV: 1819, CV: 61, CVR: 3.35, UU: 1072 },
    { date: "2024-05-27", PV: 1106, CV: 145, CVR: 13.11, UU: 1000 },
    { date: "2024-05-28", PV: 893, CV: 158, CVR: 17.69, UU: 1496 },
    { date: "2024-05-29", PV: 852, CV: 188, CVR: 22.07, UU: 1131 },
    { date: "2024-05-30", PV: 1979, CV: 164, CVR: 8.29, UU: 1499 },
    { date: "2024-05-31", PV: 1785, CV: 91, CVR: 5.1, UU: 1035 },
    { date: "2024-06-01", PV: 1242, CV: 108, CVR: 8.7, UU: 1350 },
    { date: "2024-06-02", PV: 902, CV: 168, CVR: 18.63, UU: 1183 },
    { date: "2024-06-03", PV: 1766, CV: 175, CVR: 9.91, UU: 873 },
    { date: "2024-06-04", PV: 1751, CV: 126, CVR: 7.2, UU: 521 },
    { date: "2024-06-05", PV: 516, CV: 135, CVR: 26.16, UU: 808 },
    { date: "2024-06-06", PV: 766, CV: 193, CVR: 25.2, UU: 1304 },
    { date: "2024-06-07", PV: 1650, CV: 67, CVR: 4.06, UU: 991 },
    { date: "2024-06-08", PV: 1842, CV: 181, CVR: 9.83, UU: 1460 },
    { date: "2024-06-09", PV: 1025, CV: 114, CVR: 11.12, UU: 631 },
    { date: "2024-06-10", PV: 884, CV: 51, CVR: 5.77, UU: 1104 },
    { date: "2024-06-11", PV: 1088, CV: 147, CVR: 13.51, UU: 560 },
    { date: "2024-06-12", PV: 1943, CV: 55, CVR: 2.83, UU: 594 },
    { date: "2024-06-13", PV: 822, CV: 177, CVR: 21.53, UU: 1233 },
    { date: "2024-06-14", PV: 1249, CV: 80, CVR: 6.41, UU: 1425 },
    { date: "2024-06-15", PV: 1417, CV: 93, CVR: 6.56, UU: 585 },
    { date: "2024-06-16", PV: 1601, CV: 102, CVR: 6.37, UU: 1219 },
    { date: "2024-06-17", PV: 1845, CV: 58, CVR: 3.14, UU: 549 },
    { date: "2024-06-18", PV: 1282, CV: 160, CVR: 12.48, UU: 1466 },
    { date: "2024-06-19", PV: 890, CV: 108, CVR: 12.13, UU: 1115 },
    { date: "2024-06-20", PV: 757, CV: 175, CVR: 23.12, UU: 1295 },
    { date: "2024-06-21", PV: 1830, CV: 68, CVR: 3.72, UU: 907 },
    { date: "2024-06-22", PV: 1832, CV: 172, CVR: 9.39, UU: 1304 },
    { date: "2024-06-23", PV: 611, CV: 148, CVR: 24.22, UU: 1205 },
    { date: "2024-06-24", PV: 725, CV: 99, CVR: 13.66, UU: 1493 },
    { date: "2024-06-25", PV: 741, CV: 144, CVR: 19.43, UU: 1078 },
    { date: "2024-06-26", PV: 798, CV: 99, CVR: 12.41, UU: 646 },
    { date: "2024-06-27", PV: 1634, CV: 93, CVR: 5.69, UU: 716 },
    { date: "2024-06-28", PV: 721, CV: 154, CVR: 21.36, UU: 660 },
    { date: "2024-06-29", PV: 1701, CV: 136, CVR: 8.0, UU: 936 },
    { date: "2024-06-30", PV: 1923, CV: 95, CVR: 4.94, UU: 838 },
    { date: "2024-07-01", PV: 1490, CV: 167, CVR: 11.21, UU: 1286 },
    { date: "2024-07-02", PV: 1952, CV: 52, CVR: 2.66, UU: 641 },
    { date: "2024-07-03", PV: 728, CV: 119, CVR: 16.35, UU: 772 },
    { date: "2024-07-04", PV: 1436, CV: 162, CVR: 11.28, UU: 1207 },
    { date: "2024-07-05", PV: 1301, CV: 59, CVR: 4.53, UU: 1028 },
    { date: "2024-07-06", PV: 1088, CV: 58, CVR: 5.33, UU: 922 },
    { date: "2024-07-07", PV: 1730, CV: 177, CVR: 10.23, UU: 1218 },
    { date: "2024-07-08", PV: 1808, CV: 78, CVR: 4.31, UU: 1205 },
    { date: "2024-07-09", PV: 1380, CV: 144, CVR: 10.43, UU: 1133 },
    { date: "2024-07-10", PV: 1353, CV: 172, CVR: 12.71, UU: 1108 },
    { date: "2024-07-11", PV: 1344, CV: 186, CVR: 13.84, UU: 1097 },
    { date: "2024-07-12", PV: 793, CV: 150, CVR: 18.92, UU: 1474 },
    { date: "2024-07-13", PV: 742, CV: 78, CVR: 10.51, UU: 945 },
    { date: "2024-07-14", PV: 1431, CV: 101, CVR: 7.06, UU: 501 },
    { date: "2024-07-15", PV: 1238, CV: 196, CVR: 15.83, UU: 823 },
    { date: "2024-07-16", PV: 1487, CV: 72, CVR: 4.84, UU: 1231 },
    { date: "2024-07-17", PV: 1099, CV: 80, CVR: 7.28, UU: 986 },
    { date: "2024-07-18", PV: 1761, CV: 144, CVR: 8.18, UU: 1236 },
    { date: "2024-07-19", PV: 1485, CV: 83, CVR: 5.59, UU: 963 },
    { date: "2024-07-20", PV: 901, CV: 178, CVR: 19.76, UU: 1161 },
    { date: "2024-07-21", PV: 1356, CV: 86, CVR: 6.34, UU: 1374 },
    { date: "2024-07-22", PV: 979, CV: 197, CVR: 20.12, UU: 1133 },
    { date: "2024-07-23", PV: 1856, CV: 189, CVR: 10.18, UU: 860 },
    { date: "2024-07-24", PV: 1667, CV: 172, CVR: 10.32, UU: 902 },
    { date: "2024-07-25", PV: 740, CV: 58, CVR: 7.84, UU: 854 },
    { date: "2024-07-26", PV: 1421, CV: 59, CVR: 4.15, UU: 1372 },
    { date: "2024-07-27", PV: 1153, CV: 148, CVR: 12.84, UU: 716 },
    { date: "2024-07-28", PV: 1535, CV: 68, CVR: 4.43, UU: 658 },
    { date: "2024-07-29", PV: 562, CV: 86, CVR: 15.3, UU: 853 },
    { date: "2024-07-30", PV: 1440, CV: 191, CVR: 13.26, UU: 1022 },
    { date: "2024-07-31", PV: 1388, CV: 193, CVR: 13.9, UU: 692 },
    { date: "2024-08-01", PV: 1352, CV: 102, CVR: 7.54, UU: 1310 },
    { date: "2024-08-02", PV: 1333, CV: 131, CVR: 9.83, UU: 817 },
    { date: "2024-08-03", PV: 1456, CV: 89, CVR: 6.11, UU: 1045 },
    { date: "2024-08-04", PV: 1324, CV: 157, CVR: 11.86, UU: 1320 },
    { date: "2024-08-05", PV: 1789, CV: 102, CVR: 5.7, UU: 1567 },
    { date: "2024-08-06", PV: 1543, CV: 76, CVR: 4.92, UU: 1389 },
    { date: "2024-08-07", PV: 1620, CV: 145, CVR: 8.95, UU: 1298 },
    { date: "2024-08-08", PV: 1398, CV: 112, CVR: 8.01, UU: 1187 },
    { date: "2024-08-09", PV: 1487, CV: 98, CVR: 6.59, UU: 1254 },
    { date: "2024-08-10", PV: 1734, CV: 123, CVR: 7.09, UU: 1432 },
    { date: "2024-08-11", PV: 1599, CV: 110, CVR: 6.88, UU: 1365 },
    { date: "2024-08-12", PV: 1478, CV: 134, CVR: 9.07, UU: 1278 },
    { date: "2024-08-13", PV: 1345, CV: 89, CVR: 6.62, UU: 1156 },
    { date: "2024-08-14", PV: 1689, CV: 145, CVR: 8.59, UU: 1423 },
    { date: "2024-08-15", PV: 1534, CV: 102, CVR: 6.65, UU: 1304 },
    { date: "2024-08-16", PV: 1456, CV: 78, CVR: 5.36, UU: 1234 },
    { date: "2024-08-17", PV: 1723, CV: 134, CVR: 7.78, UU: 1489 },
    { date: "2024-08-18", PV: 1589, CV: 112, CVR: 7.05, UU: 1378 },
    { date: "2024-08-19", PV: 1498, CV: 98, CVR: 6.54, UU: 1267 },
    { date: "2024-08-20", PV: 1678, CV: 123, CVR: 7.33, UU: 1456 },
    { date: "2024-08-21", PV: 1543, CV: 110, CVR: 7.13, UU: 1345 },
    { date: "2024-08-22", PV: 1398, CV: 134, CVR: 9.59, UU: 1234 },
    { date: "2024-08-23", PV: 1487, CV: 89, CVR: 5.98, UU: 1123 },
    { date: "2024-08-24", PV: 1734, CV: 145, CVR: 8.36, UU: 1432 },
    { date: "2024-08-25", PV: 1599, CV: 102, CVR: 6.38, UU: 1321 },
    { date: "2024-08-26", PV: 1478, CV: 76, CVR: 5.14, UU: 1210 },
    { date: "2024-08-27", PV: 1345, CV: 123, CVR: 9.14, UU: 1456 },
    { date: "2024-08-28", PV: 1689, CV: 110, CVR: 6.51, UU: 1345 },
    { date: "2024-08-29", PV: 1534, CV: 134, CVR: 8.74, UU: 1234 },
    { date: "2024-08-30", PV: 1456, CV: 89, CVR: 6.11, UU: 1123 },
    { date: "2024-08-31", PV: 1723, CV: 145, CVR: 8.41, UU: 1432 },
    { date: "2024-09-01", PV: 1589, CV: 102, CVR: 6.42, UU: 1321 },
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

  const dateRangeOptions = [
    { value: "過去7日間", label: "過去7日間" },
    { value: "過去28日間", label: "過去28日間" },
    { value: "過去90日間", label: "過去90日間" },
    { value: "先月", label: "先月" },
    { value: "先々月", label: "先々月" },
    { value: "1年間", label: "1年間" },
    { value: "全期間", label: "全期間" },
  ];

  const [dateRange, setDateRange] = useState("過去 28 日間");
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState("PV");
  const [selectedUrl, setSelectedUrl] = useState("");
  const [url, setUrl] = useState("");
  const [urlList, setUrlList] = useState([]);
  const [sanitizedUrl, setSanitizedUrl] = useState("");
  const [timeGranularity, setTimeGranularity] = useState("日別");
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1); // 今日から1ヶ月前の日付を設定
    return date.toISOString().split("T")[0]; // YYYY-MM-DD 形式で取得
  });
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [formattedAnalytics, setFormattedAnalytics] = useState([]);
  const [filteredData, setFilteredData] = useState(null);
  const [pagePath, setpagePath] = useState(null);
  const [selectedPagePath, setSelectedPagePath] = useState("/");
  const [selectedDateRange, setSelectedDateRange] = useState("過去7日間");
  const [query, setQuery] = useState([]);
  const [device, setDevice] = useState([]);
  const [country, setCountry] = useState([]);
  const [city, setCity] = useState([]);
  const router = useRouter();

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2); // 月は0から始まるため+1
    const day = `0${date.getDate()}`.slice(-2);
    return `${year}/${month}/${day}`;
  };

  const { fetchedSession, loading } = useSessionData();

  useEffect(() => {
    if (!fetchedSession && !loading) {
      router.push("/auth/login");
      return;
    } else {
      console.log("fetchedSession: ", fetchedSession);
    }
  }, [fetchedSession, loading, router]);

  // データの初期化
  const [dataByDayFromDetails, setDataByDayFromDetails] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [propertyId, setpropertyId] = useState(null);
  const [propertyIds, setPropertyIds] = useState([]);
  const [searchConsoleData, setSearchConsoleData] = useState([]);
  const [aggregatedData, setAggregatedData] = useState([]);
  const [pathList, setPathList] = useState([]);

  useEffect(() => {
    if (router.query.propertyId) {
      setpropertyId(router.query.propertyId);
    }
  }, [router.query.propertyId]);

  // console.log("PropertyId:", propertyId);

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
  //console.log("PropertyIds:", propertyIds);
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

  // 日毎, page_pathごとのデータを取得
  const {
    data: fetchedDataByDayFromDetails,
    error: dataByDayError,
    isLoading: dataByDayLoading,
    refetch: refetchDataByDayFromDetails,
  } = useDataByDayFromDetails(fetchedSession, propertyIds, startDate, endDate);
  useEffect(() => {
    console.log("トリガー");
    if (dataByDayLoading) {
      console.log("Loading data by day...");
      return;
    }
    if (dataByDayError) {
      console.error("Error fetching data by day:", dataByDayError);
      refetchDataByDayFromDetails();
    }

    if (
      fetchedDataByDayFromDetails &&
      Object.values(fetchedDataByDayFromDetails).some(
        (data) => Object.values(data).length > 0
      )
    ) {
      console.log("fetchedDataByDayFromDetails:", fetchedDataByDayFromDetails);
      setDataByDayFromDetails(fetchedDataByDayFromDetails);
    }
  }, [fetchedDataByDayFromDetails]);

  //URLのリストを作成する
  useEffect(() => {
    if (dataByDayFromDetails && dataByDayFromDetails[propertyId]) {
      const urls = Object.keys(dataByDayFromDetails[propertyId]);
      console.log("URLs:", urls);
      setUrlList(urls);
    }
  }, [dataByDayFromDetails, propertyId]);

  const urlOptions = urlList.map((url) => ({
    value: url,
    label: url,
  }));

  //PagePathを取得する関数
  useEffect(() => {
    if (
      dataByDayFromDetails &&
      dataByDayFromDetails[propertyId] &&
      sanitizedUrl
    ) {
      const list = Object.keys(dataByDayFromDetails[propertyId][sanitizedUrl]);
      console.log("PathList", list);
      setPathList(list);
    }
  }, [sanitizedUrl]);

  const pagePathOptions = pathList.map((path) => ({
    value: path,
    label: path,
  }));

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

  //グラフに描画するデータの作成
  useEffect(() => {
    if (!analyticsData || analyticsData.length === 0) {
      console.warn("analyticsDataが空です");
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
        date: formattedDate, // dateをそのまま使用
        screen_page_views: entry.screen_page_views || 0, // screen_page_viewsを使用
        conversions: entry.conversions || 0, // conversionsを使用
        total_users: entry.total_users || 0,
        sessions: entry.sessions || 0, // sessionsを使用
        click: entry.click || 0,
      };
    });
    setFormattedAnalytics(formattedAnalyticsData);
    console.log("Formatted Analytics:", formattedAnalyticsData);
  }, [analyticsData]); // analyticsDataが変更された時に実行

  // URLが選択されたときの処理
  const handleSelectUrlChange = (selectedOption) => {
    setSelectedUrl(selectedOption);
    console.log("selectedUrl:", selectedOption.value);
    if (selectedOption && typeof selectedOption.value === "string") {
      //onsole.log("Url.value:", selectedOption.value);
      const url = selectedOption.value;
      setUrl(url);

      // URLの最後に余分なスラッシュがあれば削除
      const saniUrl = url.replace(/\/+$/, "");
      setSanitizedUrl(saniUrl);
      console.log("SANIUrl:", saniUrl);
    } else {
      console.log("選択されたOptionは無効です:", selectedOption);
    }
  };

  const handleSelectDateChange = (selectedOption) => {
    setDateRange(selectedOption.value);
    setSelectedDateRange(selectedOption);
    console.log("selectedDateRangeOption:", selectedOption.value);
  };

  const handleSelectPathChange = (selectedOption) => {
    setSelectedPagePath(selectedOption);
    setpagePath(selectedOption.value);
    console.log("PagePath:", pagePath);
  };

  const handleMetricChange = (value) => {
    setSelectedMetric(value);
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////ここが何回も繰り返されている
  function getQuery(searchData, searchId, url, object = "") {
    const dataObject = searchData[searchId][url];
    if (!dataObject) {
      //console.warn("No data found for the given searchId:", searchId);
      return [];
    }
    // URL部分の下にある指定されたオブジェクトキー（object）を取得
    const queryData = dataObject?.[object];
    //console.log("QueryData: ", queryData);
    if (!queryData) {
      return [];
    }
    const sortedEntries = Object.entries(queryData).sort((a, b) => b[1] - a[1]);
    const top7Queries = sortedEntries.slice(0, 7);
    //console.log("top7Queries: ", top7Queries);
    return top7Queries;
  }

  useEffect(() => {
    if (url) {
      //console.log("AGGREGATED:", aggregatedData);
      const topQueries = getQuery(aggregatedData, propertyId, url, "query");
      setQuery(topQueries);
      //console.log("topQueries", topQueries);
      const topDevices = getQuery(
        aggregatedData,
        propertyId,
        url,
        "device_category"
      );
      setDevice(topDevices);
      console.log("topDevices", topDevices);
      const topCountries = getQuery(aggregatedData, propertyId, url, "country");
      setCountry(topCountries);
      //console.log("topCountries", topCountries);
      const topCities = getQuery(aggregatedData, propertyId, url, "city");
      setCity(topCities);
      //console.log("topCountries", topCountries);}
    } else {
      console.log("No Url Yet");
    }
  }, [pagePath]);

  const selectChart = () => {
    if (!filteredData || filteredData.length === 0) {
      if (selectedMetric === "PV") {
        return <LineChart data={[]} dataKey="PV" />;
      } else if (selectedMetric === "CV") {
        return <LineChart data={[]} dataKey="CV" />;
      } else if (selectedMetric === "TU") {
        return (
          <div>
            <LineChart data={[]} dataKey="total_users" />
          </div>
        );
      } else if (selectedMetric === "UU") {
        return <LineChart data={[]} dataKey="UU" />;
      } else if (selectedMetric === "CVR") {
        return <LineChart data={[]} dataKey="CVR" />;
      } else if (selectedMetric === "SD") {
        return (
          <div>
            <BarChart data={[]} />;
          </div>
        );
      } else if (selectedMetric === "VR") {
        return <BarChart data={[]} />; // 流入者属性
      } else if (selectedMetric === "RU") {
        return <PieChart data={[]} />; // 流入元URL
      } else if (selectedMetric === "SK") {
        return (
          <div>
            <PercentageTable
              data={[]}
              subtitle="上位7項目"
              className="Percentage-graph"
            />
          </div>
        );
      } else if (selectedMetric === "TC") {
        return <LineChart data={[]} dataKey="click" />; // 総クリック数
      } else {
        return <LineChart data={[]} dataKey="PV" />;
      }
    }
    //データが存在したらこっち
    if (selectedMetric === "PV") {
      return (
        <div>
          <LineChart data={filteredData} dataKey="PV" />
          <Table data={filteredData} dataKey="PV" />
        </div>
      );
    } else if (selectedMetric === "CV") {
      return (
        <div>
          <LineChart data={filteredData} dataKey="CV" />
          <Table data={filteredData} dataKey="CV" />
        </div>
      );
    } else if (selectedMetric === "TU") {
      return (
        <div>
          <LineChart data={filteredData} dataKey="TU" />
          <Table data={filteredData} dataKey="total_users" />
        </div>
      );
    } else if (selectedMetric === "UU") {
      return (
        <div>
          <LineChart data={filteredData} dataKey="UU" />
          <Table data={filteredData} dataKey="UU" />
        </div>
      );
    } else if (selectedMetric === "CVR") {
      return (
        <div>
          <LineChart data={filteredData} dataKey="CVR" />
          <Table data={filteredData} dataKey="CVR" />
        </div>
      );
    } else if (selectedMetric === "SD") {
      return (
        <div>
          <MultiLineChart data={filteredData} dataKey="device_category" />
          <PercentageTable
            data={device}
            title="流入元デバイス"
            subtitle="上位7項目"
            className="Percentage-graph"
          />
          <Table2 data={device} dataKey="流入元デバイス" />
        </div>
      ); //流入元デバイス
    } else if (selectedMetric === "VR") {
      return (
        <div className="details-graph">
          <PercentageTable
            data={city}
            title="流入者属性（国内）"
            subtitle="上位7項目"
            className="Percentage-graph"
          />

          <Table2 data={city} dataKey="流入者属性" />
          {/*<PercentageTable
            data={country}
            title="流入者属性（国別）"
            subtitle="上位7項目"
            className="Percentage-graph"
          />
          <Table2 data={country} dataKey="流入者属性" />
        </div>
      ); // 流入者属性
    } else if (selectedMetric === "RU") {
      return <LineChart data={query} />; // 流入元URL
    } else if (selectedMetric === "SK") {
      return (
        <div>
          <MultiLineChart data={filteredData} dataKey="query" />
          <PercentageTable
            data={query}
            title="検索キーワード"
            subtitle="上位7項目"
            className="Percentage-graph"
          />
          <Table2 data={query} dataKey="検索キーワード" />
        </div>
      );
    } else if (selectedMetric === "TC") {
      return (
        <div>
          <LineChart data={filteredData} dataKey="click" />
          <Table data={filteredData} dataKey="click" />
        </div>
      );
    } else {
      return <LineChart data={sampledata} dataKey="PV" />;
    }
  };

  const parseDate = (dateStr) => new Date(dateStr);

  useEffect(() => {
    if (
      dataByDayFromDetails &&
      dataByDayFromDetails[propertyId] &&
      dataByDayFromDetails[propertyId][sanitizedUrl] &&
      dataByDayFromDetails[propertyId][sanitizedUrl][pagePath]
    ) {
      const data = dataByDayFromDetails[propertyId][sanitizedUrl][pagePath]; //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>データ設定
      console.log("data:", data);
      const filtered = filterDataByDateRange(data, dateRange);
      console.log("dateRange", dateRange);
      console.log("Fetched Data for Property:", data); // デバッグ用ログ
      console.log("filtered data:", filtered);
      setFilteredData(filtered);
    } else {
      console.log("NOSANIANDDATA");
    }
  }, [sanitizedUrl, pagePath, dateRange]);

  const filterDataByDateRange = (data, range) => {
    const now = new Date();
    console.log("nowDate:", now);
    //setEndDate(now);
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
          total_users: 0,
          UU: 0,
          CVR: 0,
          device_category: { desktop: 0, mobile: 0, tablet: 0 },
          city: {},
          country: { jpn: 0 },
          query: {},
          click: 0,
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
        total_users: 0,
        UU: 0,
        CVR: 0,
        device_category: { desktop: 0, mobile: 0, tablet: 0 },
        city: { shibuya: 0 },
        country: { jpn: 0 },
        query: { ホームページ: 0 },
        click: 0,
      },
    ];
  };

  /*function aggregateDevicesByDate(data) {
    const aggregated = {};

    if (!data || !Array.isArray(data)) {
      return [];
    }
  
    data.forEach(item => {
      const date = item.date;
      const deviceCategory = item.device_category ? Object.keys(item.device_category)[0] : 'unknown';
  
      if (!aggregated[date]) {
        aggregated[date] = {};
      }
  
      if (!aggregated[date][deviceCategory]) {
        aggregated[date][deviceCategory] = 0;
      }
  
      aggregated[date][deviceCategory]++;
    });
  
    // 結果を日付でソートし、見やすい形式に変換
    const result = Object.entries(aggregated).sort(([a], [b]) => a.localeCompare(b)).map(([date, devices]) => ({
      date,
      devices
    }));
  
    return result;
  }

const aggregatedResult = aggregateDevicesByDate(filteredData);
console.log(JSON.stringify(aggregatedResult, null, 2));
*/
  /*
  const aggregateData = (data) => {
    const countryAggregation = {};
    const deviceAggregation = {};
    const queryAggregation = {};
    const cityAggregation = {};

    data.forEach((item) => {
      // Countryの集計
      const countries = item.country || {};
      Object.keys(countries).forEach((country) => {
        if (!countryAggregation[country]) {
          countryAggregation[country] = 0;
        }
        countryAggregation[country] += countries[country];
      });

      // Device Categoryの集計
      const devices = item.device_category || {};
      Object.keys(devices).forEach((device) => {
        if (!deviceAggregation[device]) {
          deviceAggregation[device] = 0;
        }
        deviceAggregation[device] += devices[device];
      });

      // Queryの集計
      const queries = item.query || {};
      Object.keys(queries).forEach((query) => {
        if (!queryAggregation[query]) {
          queryAggregation[query] = 0;
        }
        queryAggregation[query] += queries[query];
      });

      // Cityの集計
      const city = item.city || "(not set)";
      if (!cityAggregation[city]) {
        cityAggregation[city] = 0;
      }
      cityAggregation[city] += 1; // 同じcityがあったらカウントを増やす
    });

    return {
      countryAggregation,
      deviceAggregation,
      queryAggregation,
      cityAggregation,
    };
  };

  return (
    <div className="container">
      <div className="header">
        <div className="metric-select"></div>
        <div className="action-icons">
          <Button
            onClick={() => router.push("/dashboard")}
            variant="ghost"
            className="icon-button"
          >
            <X className="icon" />
          </Button>
        </div>
      </div>

      <div className="graph-control">
        <div className="filter-section">
          <div className="date-range">
            <Select
              styles={customStyles}
              className="custom-select"
              value={selectedUrl}
              onChange={handleSelectUrlChange}
              options={urlOptions}
              placeholder="URLを選択"
            />
            <Select
              styles={customStyles}
              className="custom-select"
              value={selectedPagePath}
              onChange={handleSelectPathChange}
              options={pagePathOptions}
              placeholder="ページパスを選択"
            />
          </div>
          <div className="chart-controls">
            <Select
              styles={customStyles}
              className="custom-select"
              value={selectedDateRange}
              onChange={handleSelectDateChange}
              options={dateRangeOptions}
              placeholder="データの範囲を選択"
            />
          </div>
        </div>
        <div className="tabs">
          <div className="tabs-list">
            <Button
              onClick={() => handleMetricChange("PV")}
              className={`tab ${selectedMetric === "PV" ? "active" : ""}`}
            >
              ページ閲覧数
            </Button>
            <Button
              onClick={() => handleMetricChange("CV")}
              className={`tab ${selectedMetric === "CV" ? "active" : ""}`}
            >
              お問い合わせ数
            </Button>
            <Button
              onClick={() => handleMetricChange("TU")}
              className={`tab ${selectedMetric === "TU" ? "active" : ""}`}
            >
              ページ訪問者数
            </Button>
            <Button
              onClick={() => handleMetricChange("UU")}
              className={`tab ${selectedMetric === "UU" ? "active" : ""}`}
            >
              セッション数
            </Button>
            <Button
              onClick={() => handleMetricChange("CVR")}
              className={`tab ${selectedMetric === "CVR" ? "active" : ""}`}
            >
              お問い合わせ率
            </Button>
            <Button
              onClick={() => handleMetricChange("SD")}
              className={`tab ${selectedMetric === "SD" ? "active" : ""}`}
            >
              流入元デバイス
            </Button>
            <Button
              onClick={() => handleMetricChange("VR")}
              className={`tab ${selectedMetric === "" ? "active" : ""}`}
            >
              流入者属性
            </Button>
            <Button
              onClick={() => handleMetricChange("RU")}
              className={`tab ${selectedMetric === "RU" ? "active" : ""}`}
            >
              流入元URL
            </Button>
            <Button
              onClick={() => handleMetricChange("SK")}
              className={`tab ${selectedMetric === "SK" ? "active" : ""}`}
            >
              検索キーワード
            </Button>
            <Button
              onClick={() => handleMetricChange("TC")}
              className={`tab ${selectedMetric === "TC" ? "active" : ""}`}
            >
              クリック数
            </Button>
          </div>
        </div>
      </div>
      <div className="details-bottom">
        {<div className="chart">{selectChart()}</div>}
      </div>
    </div>
  );
}
*/
}
