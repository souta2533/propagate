import React, { useState, useEffect } from "react";
import { Button } from "../components/Button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/Select";
/*import { Tabs, TabsList, TabsTrigger } from "../components/Tabs";*/
import { Calendar } from "../components/Calendar";
import { Popover, PopoverTrigger, PopoverContent } from "../components/Popover";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ChevronDown,
  Download,
  MessageSquare,
  X,
  Calendar as CalendarIcon,
} from "lucide-react";
import "../styles/AnalyticsDashboard.css";

const generateData = (metric, granularity) => {
  let baseData;
  switch (granularity) {
    case "日別":
      baseData = [
        { date: "2024/08/14" },
        { date: "2024/08/19" },
        { date: "2024/08/23" },
        { date: "2024/08/28" },
        { date: "2024/09/01" },
        { date: "2024/09/06" },
        { date: "2024/09/10" },
      ];
      break;
    case "月別":
      baseData = [
        { date: "2024/01" },
        { date: "2024/02" },
        { date: "2024/03" },
        { date: "2024/04" },
        { date: "2024/05" },
        { date: "2024/06" },
      ];
      break;
    case "年別":
      baseData = [
        { date: "2020" },
        { date: "2021" },
        { date: "2022" },
        { date: "2023" },
        { date: "2024" },
      ];
      break;
    default:
      baseData = [];
  }
  return baseData.map((item) => ({
    ...item,
    [metric]: Math.floor(Math.random() * 1000),
  }));
};

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState("過去 28 日間");
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState("PV");
  const [chartType, setChartType] = useState("折れ線グラフ");
  const [timeGranularity, setTimeGranularity] = useState("日別");

  // 登録されているURLのリスト
  const [urlList, setUrlList] = useState([
    { id: 1, label: "https://www.google.com", value: "https://www.google.com" },
    {
      id: 2,
      label: "https://www.youtube.com",
      value: "https://www.youtube.com",
    },
    {
      id: 3,
      label: "https://www.facebook.com",
      value: "https://www.facebook.com",
    },
  ]);

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

  const handleChartTypeChange = (value) => {
    setChartType(value);
  };

  const handleTimeGranularityChange = (value) => {
    setTimeGranularity(value);
  };

  const renderChart = () => {
    const data = generateData(selectedMetric, timeGranularity);
    switch (chartType) {
      case "折れ線グラフ":
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey={selectedMetric} stroke="#8884d8" />
          </LineChart>
        );
      case "棒グラフ":
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey={selectedMetric} fill="#8884d8" />
          </BarChart>
        );
      case "エリアチャート":
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey={selectedMetric}
              stroke="#8884d8"
              fill="#8884d8"
            />
          </AreaChart>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div className="metric-select">
          {/*タブを選択してグラフを変える*/}
          <Select value={selectedMetric} onValueChange={handleMetricChange}>
            {/*<SelectTrigger className="select-trigger">
              <SelectValue placeholder="メトリクス" />
            </SelectTrigger>
            <SelectContent className="select-content">
              <SelectItem className="select-item" value="PV">
                PV
              </SelectItem>
              <SelectItem className="select-item" value="CV">
                CV
              </SelectItem>
              <SelectItem className="select-item" value="UU">
                UU
              </SelectItem>
              <SelectItem className="select-item" value="SS">
                SS
              </SelectItem>
            </SelectContent>*/}
          </Select>
        </div>
        <div className="action-icons">
          {/*ダウンロードアイコンとメッセージアイコン
          <Download className="icon" />
          <MessageSquare className="icon" />*/}
          <X className="icon" />
        </div>
      </div>

      <div className="filter-section">
        <div>
          <Select value={selectedURL} onValueChange={handleURLChange}>
            <SelectTrigger className="custom-select-trigger">
              <SelectValue placeholder="URLを選択" />
            </SelectTrigger>

            <SelectContent className="custom-select-content">
              {urlList.map((url) => (
                <SelectItem key={url.id} value={url.value}>
                  {url.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 選択されたURLを表示する部分
          {selectedURL && (
            <div style={{ marginTop: "20px" }}>
              <p>
                選択されたURL:{" "}
                <a href={selectedURL} target="_blank" rel="noopener noreferrer">
                  {selectedURL}
                </a>
              </p>
            </div>
          )*/}
        </div>
        <div className="date-range">
          <Select value={dateRange} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="select-trigger">
              <SelectValue placeholder="期間を選択" />
            </SelectTrigger>
            <div className="select-content">
              <SelectContent>
                <SelectItem value="過去 7 日間">過去 7 日間</SelectItem>
                <SelectItem value="過去 28 日間">過去 28 日間</SelectItem>
                <SelectItem value="過去 90 日間">過去 90 日間</SelectItem>
                <SelectItem value="カスタム">カスタム</SelectItem>
              </SelectContent>
            </div>
          </Select>
          {showCalendar && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="calendar-button">
                  <CalendarIcon className="icon-small" />
                  2024/08/14 〜 2024/09/10
                </Button>
              </PopoverTrigger>
              <PopoverContent className="calendar-popover">
                <Calendar />
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
            onClick={() => handleMetricChange("UU")}
            className={`tab ${selectedMetric === "UU" ? "active" : ""}`}
          >
            ページ訪問者数
          </button>
          <button
            onClick={() => handleMetricChange("SS")}
            className={`tab ${selectedMetric === "SS" ? "active" : ""}`}
          >
            セッション数
          </button>
          <button
            onClick={() => handleMetricChange("SS")}
            className={`tab ${selectedMetric === "SS" ? "active" : ""}`}
          >
            お問い合わせ率
          </button>
          <button
            onClick={() => handleMetricChange("SS")}
            className={`tab ${selectedMetric === "SS" ? "active" : ""}`}
          >
            流入元デバイス
          </button>
          <button
            onClick={() => handleMetricChange("SS")}
            className={`tab ${selectedMetric === "SS" ? "active" : ""}`}
          >
            流入者属性
          </button>
          <button
            onClick={() => handleMetricChange("SS")}
            className={`tab ${selectedMetric === "SS" ? "active" : ""}`}
          >
            流入元URL
          </button>
          <button
            onClick={() => handleMetricChange("SS")}
            className={`tab ${selectedMetric === "SS" ? "active" : ""}`}
          >
            検索キーワード
          </button>
        </div>
      </div>
      <div className="chart-controls">
        <Select>
          <SelectContent>
            <SelectItem value="views">コンテンツ ごとの視聴回数</SelectItem>
          </SelectContent>
        </Select>
        {/*グラフの種類をコントロール
        <div className="chart-type-controls">
          <Select value={chartType} onValueChange={handleChartTypeChange}>
            <SelectTrigger className="custom-select-trigger">
              <SelectValue placeholder="グラフタイプ" />
            </SelectTrigger>
            <SelectContent className="custom-select-content">
              <SelectItem value="折れ線グラフ">折れ線グラフ</SelectItem>
              <SelectItem value="棒グラフ">棒グラフ</SelectItem>
              <SelectItem value="エリアチャート">エリアチャート</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={timeGranularity}
            onValueChange={handleTimeGranularityChange}
          >
            <SelectTrigger className="select-trigger">
              <SelectValue placeholder="時間単位" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="日別">日別</SelectItem>
              <SelectItem value="月別">月別</SelectItem>
              <SelectItem value="年別">年別</SelectItem>
            </SelectContent>
          </Select>
        </div>
        */}
      </div>

      <div className="chart">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
      {/*
      <table className="data-table">
        <thead>
          <tr>
            <th>コンテンツ</th>
            <th>視聴回数</th>
            <th>総再生時間（単位：時間）</th>
            <th>平均視聴時間</th>
            <th>インプレッション数</th>
            <th>インプレッションのクリック率</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>合計</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
          </tr>
        </tbody>
      </table>
      */}
    </div>
  );
}
