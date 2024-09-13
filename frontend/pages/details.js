import React, { useState, useEffect } from "react";
import { Button } from "../components/Button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/Select";
import { Tabs, TabsList, TabsTrigger } from "../components/Tabs";
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
          <MessageSquare className="icon" />
          <Select value={selectedMetric} onValueChange={handleMetricChange}>
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
          </Select>
        </div>
        <div className="action-icons">
          <Download className="icon" />
          <MessageSquare className="icon" />
          <X className="icon" />
        </div>
      </div>

      <div className="filter-section">
        <Button variant="outline" className="filter-button">
          フィルタ
          <ChevronDown className="icon-small" />
        </Button>
        <div className="date-range">
          <Select value={dateRange} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="select-trigger">
              <SelectValue placeholder="期間を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="過去 7 日間">過去 7 日間</SelectItem>
              <SelectItem value="過去 28 日間">過去 28 日間</SelectItem>
              <SelectItem value="過去 90 日間">過去 90 日間</SelectItem>
              <SelectItem value="カスタム">カスタム</SelectItem>
            </SelectContent>
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
          <span className="date-range-text">{dateRange}</span>
        </div>
      </div>

      <Tabs defaultValue="contents" className="tabs">
        <TabsList className="tabs-list">
          <TabsTrigger value="contents" className="tab">
            コンテンツ
          </TabsTrigger>
          <TabsTrigger value="traffic" className="tab">
            トラフィック ソース
          </TabsTrigger>
          <TabsTrigger value="region" className="tab">
            地域
          </TabsTrigger>
          <TabsTrigger value="city" className="tab">
            都市
          </TabsTrigger>
          <TabsTrigger value="age" className="tab">
            視聴者の年齢
          </TabsTrigger>
          <TabsTrigger value="gender" className="tab">
            視聴者の性別
          </TabsTrigger>
          <TabsTrigger value="date" className="tab">
            日付
          </TabsTrigger>
          <TabsTrigger value="type" className="tab">
            コンテンツ タイプ
          </TabsTrigger>
          <TabsTrigger value="playlist" className="tab">
            再生リスト
          </TabsTrigger>
          <TabsTrigger value="other" className="tab">
            その他
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="chart-controls">
        <Select>
          <SelectTrigger className="select-trigger">
            <SelectValue placeholder="コンテンツ ごとの視聴回数" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="views">コンテンツ ごとの視聴回数</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="select-trigger">
            <SelectValue placeholder="サブの統計情報を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sub-stats">サブの統計情報を選択</SelectItem>
          </SelectContent>
        </Select>
        <div className="chart-type-controls">
          <Select value={chartType} onValueChange={handleChartTypeChange}>
            <SelectTrigger className="select-trigger">
              <SelectValue placeholder="グラフタイプ" />
            </SelectTrigger>
            <SelectContent>
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
      </div>

      <div className="chart">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>コンテンツ</th>
            <th>視聴回数</th>
            <th>総再生時間（単位：時間）</th>
            <th>チャンネル登録者</th>
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
    </div>
  );
}
