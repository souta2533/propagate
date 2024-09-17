import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "../components/ui/Button";
import {
  Select,
  SelectTrigger,
  SelectValue,
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

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState("過去 28 日間");
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState("PV");
  const [chartType, setChartType] = useState("折れ線グラフ");
  const [timeGranularity, setTimeGranularity] = useState("日別");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const router = useRouter();
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2); // 月は0から始まるため+1
    const day = `0${date.getDate()}`.slice(-2);
    return `${year}/${month}/${day}`;
  };

  /*日付を表示形式に整える*/
  useEffect(() => {
    // 例として過去7日間を設定
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - 7);

    setStartDate(pastDate);
    setEndDate(today);
  }, []);

  /*グラフの日付選択*/
  const handleDateSelect = (range) => {
    if (range && range.from && range.to) {
      setStartDate(range.from);
      setEndDate(range.to);
      setShowCalendar(false); // カレンダーを閉じる
    }
  };

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

  const selectChart = () => {
    switch (selectedTab) {
      case "PV":
        return <div>ページ閲覧数のコンテンツ</div>;
      case "CV":
        return <div>お問い合わせ数のコンテンツ</div>;
      case "UU":
        return <div>ページ訪問者数のコンテンツ</div>;
      case "IR":
        return <div>セッション数のコンテンツ</div>;
      case "DS":
        return <div>お問い合わせ率のコンテンツ</div>;
      case "UA":
        return <div>流入元デバイスのコンテンツ</div>;
      case "SU":
        return <div>流入者属性のコンテンツ</div>;
      case "SK":
        return <div>流入元URLのコンテンツ</div>;
      default:
        return <div>検索キーワードのコンテンツ</div>;
    }
  };
  const renderChart = () => {
    const data = generateData(
      selectedMetric,
      timeGranularity,
      startDate,
      endDate
    );
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
          {/*<Select value={selectedMetric} onValueChange={handleMetricChange}>
            <SelectTrigger className="select-trigger">
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
            </SelectContent>
          </Select>*/}
        </div>
        <div className="action-icons">
          {/*ダウンロードアイコンとメッセージアイコン
          <Download className="icon" />
          <MessageSquare className="icon" />*/}
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
              onClick={() => handleMetricChange("IR")}
              className={`tab ${selectedMetric === "IR" ? "active" : ""}`}
            >
              お問い合わせ率
            </button>
            <button
              onClick={() => handleMetricChange("DS")}
              className={`tab ${selectedMetric === "DS" ? "active" : ""}`}
            >
              流入元デバイス
            </button>
            <button
              onClick={() => handleMetricChange("UA")}
              className={`tab ${selectedMetric === "UA" ? "active" : ""}`}
            >
              流入者属性
            </button>
            <button
              onClick={() => handleMetricChange("SU")}
              className={`tab ${selectedMetric === "SU" ? "active" : ""}`}
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
