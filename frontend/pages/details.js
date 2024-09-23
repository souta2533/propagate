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
  const router = useRouter();
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

  const selectChart = () => {
    switch (selectedMetric) {
      case "PV":
        return <LineChart data={sampledata} dataKey="PV" />;
      case "CV":
        return <LineChart data={sampledata} dataKey="CV" />;
      case "TU":
        return <LineChart data={sampledata} dataKey="TU" />;
      case "UU":
        return <LineChart data={sampledata} dataKey="UU" />;
      case "CVR":
        return <LineChart data={sampledata} dataKey="CVR" />;
      case "SD":
        return <LineChart data={sampledata} dataKey="SD" />;
      case "VR":
        return <LineChart data={sampledata} dataKey="VR" />;
      case "RU":
        return <LineChart data={sampledata} dataKey="RU" />;
      case "SK":
        return <LineChart data={sampledata} dataKey="SK" />;
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
