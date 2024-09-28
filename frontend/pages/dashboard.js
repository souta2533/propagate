import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FaSearch } from "react-icons/fa";
import { supabase } from "../lib/supabaseClient";
import { useSessionData } from "../hooks/useSessionData";
import { useDataByDay } from "../hooks/useGetDataByDay";
import { useAnalyticsData } from "../hooks/useAnalyticsData";
import { useSearchConsoleData } from "../hooks/useSearchConsoleData";
import { useAggregatedData } from "../hooks/useAggregatedData";
import { Card, CardContent } from "../components/ui/Card";
import Select from "react-select";
import Sidebar from "../components/ui/Sidebar";
import Header from "../components/ui/Header";
import MetricCard from "../components/ui/MetricCard";
import Overlay from "../components/ui/Overlay";
import LineChart from "../components/graph/LineChart";
import "../styles/dashboard.css";
import "../styles/react-select.css";

const Dashboard = () => {
  const sampledata1 = [
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
  const [aggregatedData, setAggregatedData] = useState({});
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const [propertyId, setPropertyId] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [dateRange, setDateRange] = useState("過去7日間");
  const [selectedOption, setSelectedOption] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState(""); // URL用のstate
  const [metrics, setMetrics] = useState(sampleMetrics); // メトリクスのstate
  const [selectedMetric, setSelectedMetric] = useState("PV (ページ閲覧数)"); // 選択中のメトリクス
  const [inputValue, setInputValue] = useState(""); // ここで useState を使って定義

  const [dataForDateRange, setDataForDateRange] = useState([]);
  const [formattedAnalytics, setFormattedAnalytics] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const router = useRouter();

  //detailsのリンクにpropertyIdを紐づける
  const handelButtonClick = (propertyId) => {
    router.push(`/${propertyId}/details`);
  };

  /////////////////////////////////////////////////////できるならコンテキストで保管したい
  const addUrlToList = (newUrl) => {
    if (!addUrlToList.includes(newUrl)) {
      SpeechRecognitionResultList((prevList) => [...prevList, newUrl]);
    }
  };

  useEffect(() => {
    if (router.query.url) {
      const decodedUrl = decodeURIComponent(router.query.url);
      setInputValue(decodedUrl);
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

  // AnalyticsとSearch Consoleのデータを取得
  const {
    data: fetchedDataByDay,
    error: dataByDayError,
    isLoading: dataByDayLoading,
    refetch: refetchDataByDay,
  } = useDataByDay(session, propertyIds, startDate, endDate);

  console.log("Data By Day: ", fetchedDataByDay);

  useEffect(() => {
    if (!session || !propertyIds || !startDate || !endDate) {
      console.log("Null something");
      return;
    }

    if (dataByDayError) {
      console.error("Error fetching data by day:", dataByDayError);
      refetchDataByDay(session, propertyIds, startDate, endDate);
    } else if (fetchedDataByDay) {
      console.log("Fetched Data By Day: ", fetchedDataByDay);
      setDataByDay(fetchedDataByDay);
    }
  }, [
    session,
    propertyIds,
    startDate,
    endDate,
    dataByDayError,
    dataByDayLoading,
    refetchDataByDay,
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
      setAggregatedData(fetchedAggregatedData);
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
  // useEffect(() => {
  //   const fetchAggregatedData = async () => {
  //     if (
  //       !session ||
  //       !propertyIds ||
  //       propertyIds.length === 0 ||
  //       !startDate ||
  //       !endDate
  //     ) {
  //       console.warn("Property ID, Start Date, or End Date is missing.");
  //       return;
  //     }

  //     const jwtToken = session.access_token;
  //     if (!jwtToken) {
  //       console.error("JWT Token is missing.");
  //       return;
  //     }

  //     const aggregatedDataByPropertyId = {};

  //     for (const property of propertyIds) {
  //       const propertyId = property.properties_id;
  //       try {
  //         const aggregatedData = await fetchAggregatedDataFromDashboard(
  //           ////////////////////////////////////////////////要確認
  //           jwtToken,
  //           propertyId,
  //           startDate,
  //           endDate
  //         );

  //         if (aggregatedData) {
  //           aggregatedDataByPropertyId[propertyId] = aggregatedData;
  //         }
  //       } catch (error) {
  //         console.error("Error fetching aggregated data:", error);
  //       }
  //     }
  //     //console.log("Aggregated Data:", aggregatedDataByPropertyId); // デバッグ用ログ
  //     //setAggregatedData(aggregatedDataByPropertyId);///////////////////////////////////////////////////////////////要確認
  //   };

  //   fetchAggregatedData();
  // }, [session, propertyIds, startDate, endDate]);

  // // データのデバッグ
  // console.log("Analytics Data: ", analyticsData);
  // console.log("Search Console Data: ", searchConsoleData);

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

  //Dachboardに表示するための加工したデータをformattedAnalyticsに格納
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
      return [
        {
          date: "",
          PV: 0,
          CV: 0,
          CVR: 0,
          UU: 0,
        },
      ];
    }

    const analyticsData = filteredAnalytics.map((entry) => ({
      date: entry.date,
      PV: entry.screen_page_views || 0,
      CV: entry.conversions || 0,
      CVR: entry.sessions
        ? ((entry.conversions / entry.sessions) * 100).toFixed(2)
        : 0, // CVRをパーセント表示
      UU: entry.sessions || 0,
    }));

    console.log("ANADATA:", analyticsData);
    return analyticsData;
  };

  const parseDate = (dateStr) => new Date(dateStr);

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
          CVR: 0,
          UU: 0,
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

  /*{showCalendar && (
                  <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(range) => {
                      setStartDate(range.startDate);
                      setEndDate(range.endDate);
                      filterDataByDateRange("カスタム"); // カスタム範囲でデータをフィルタリング
                    }*/

  // オプションが選択された時に実行される関数
  const handleSelectChange = (selectedOption) => {
    setDateRange(selectedOption.value); // 選択されたオプションを状態に保存
    setSelectedOption(selectedOption);
    console.log("selectedOption:", selectedOption.value);
  };

  //AnalyticsData, DateRange, filteredDataに呼応してフィルタリング//////////////////////////////////////////////////////////////////////////////////////////////////////Dataの変更場所
  useEffect(() => {
    if (formattedAnalytics.length > 0) {
      console.log("DateRange:", dateRange);
      const filtered = filterDataByDateRange(formattedAnalytics, dateRange); //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>516
      setFilteredData(filtered);
    }
  }, [dateRange, analyticsData]);

  useEffect(() => {
    if (filteredData.length > 0) {
      console.log("FilteredData:", filteredData);
      const previousData = getPreviousData(formattedAnalytics, dateRange); //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>603
      console.log("PreData:", previousData);
      calculateCurrentAndPreviousData(filteredData, previousData); //>>>>>>>>>>>>>>>646
    }
  }, [filteredData]);

  const getPreviousData = (data, dateRange) => {
    const now = new Date();
    console.log("NOW:", now);
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
        return [];
    }
    if (Array.isArray(data)) {
      const previousData = fillMissingDates(
        data,
        previousStartDate,
        previousEndDate
      );
      console.log("PreviousData :", previousData);
      return previousData;
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
    filteredData.forEach((data) => {
      totalPV += data.PV || 0;
      totalCV += data.CV || 0;
      totalUU += data.UU || 0;
    });

    previousData.forEach((data) => {
      prePV += data.screen_page_views || 0;
      preCV += data.conversions || 0;
      preUU += data.sessions || 0;
    });

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
        title: "PV (ページ閲覧数)",
        value: currentData.PV || 0,
        previousValue: preData.PV,
      },
      {
        title: "CV (お問い合わせ数)",
        value: currentData.CV || 0,
        previousValue: preData.CV,
      },
      {
        title: "CVR (お問い合わせ率)",
        value:
          currentData.UU > 0
            ? ((currentData.CV / currentData.UU) * 100).toFixed(2) + "%"
            : "0%", // UU が 0 の場合は "0%" を表示
        previousValue:
          preData.UU > 0
            ? ((preData.CV / preData.UU) * 100).toFixed(2) + "%"
            : "0%", // 前月の UU が 0 の場合も "0%" を表示
      },
      {
        title: "UU (セッション数)",
        value: currentData.UU || 0,
        previousValue: preData.UU,
      },
    ]);
  };

  useEffect(() => {
    if (propertyId) {
      console.log("PROID:", propertyId);
      //const data = getAnalyticsData(propertyId);
      //console.log("data:", data);
      const data = dataByDay[propertyId];
      console.log("DateByDAY for PRO:", data);
      const filtered = filterDataByDateRange(data, dateRange); //>>>>>>>>>>>>>>>>>>>>>>>>>>>>-300
      console.log("dateRange", dateRange);
      console.log("Fetched Data for Property:", data); // デバッグ用ログ
      console.log("filtered data:", filtered);
      setFilteredData(data); //..........................................................................修正！
    }
  }, [propertyId, dateRange]);

  //setChartData(dataForDateRange);
  //}, [propertyId, dateRange]);

  const handleMetricChange = (metricTitle) => {
    setSelectedMetric(metricTitle);
  };

  const renderContent = () => {
    if (!filteredData || filteredData.length === 0) {
      if (selectedMetric === "PV (ページ閲覧数)") {
        return <LineChart data={sampledata2} dataKey="PV" />;
      }
      if (selectedMetric === "CV (お問い合わせ数)") {
        return <LineChart data={sampledata2} dataKey="CV" />;
      }
      if (selectedMetric === "CVR (お問い合わせ率)") {
        return <LineChart data={sampledata2} dataKey="CVR" />;
      }
      if (selectedMetric === "UU (セッション数)") {
        return <LineChart data={sampledata2} dataKey="UU" />;
      }
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
    console.log(sanitizedUrl); // "https://www.propagateinc.com"

    const queryData = searchData[searchId]?.[sanitizedUrl]?.query;

    if (!queryData) {
      return [];
    }

    const sortedEntries = Object.entries(queryData).sort((a, b) => b[1] - a[1]);
    const topQueries = sortedEntries.slice(0, 7);
    return topQueries;
  }

  function getQuery2(data, searchId) {
    const queryCountMap = new Map();

    // 各エントリのqueryを集計
    data.forEach((entry) => {
      const query = entry.searchId;
      if (queryCountMap.has(query)) {
        queryCountMap.set(query, queryCountMap.get(query) + 1);
      } else {
        queryCountMap.set(query, 1);
      }
    });

    // Mapを配列に変換し、頻度順にソート
    const sortedQueries = Array.from(queryCountMap.entries()).sort(
      (a, b) => b[1] - a[1]
    );

    // 上位7つを取得
    const top7Queries = sortedQueries.slice(0, 7);

    return top7Queries;
  }

  const topQueries = getQuery(aggregatedData, propertyId);

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
      {/*<Overlay isOpen={isOpen} toggleMenu={toggleMenu} />*/}
      <main className="dashboard-main">
        {/* サイドバーの表示制御 */}
        <Sidebar isOpen={isOpen} className="sidebar" />
        <div className="dashboard-main-left">
          <div className="dashboard-header">
            <h2 className="dashboard-title">アナリティクスデータ</h2>
            <Select
              className="custom-select"
              value={selectedOption}
              onChange={handleSelectChange}
              options={options}
              placeholder="データの範囲を選択"
            ></Select>
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
                    onClick={() => handelButtonClick(propertyId)}
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
