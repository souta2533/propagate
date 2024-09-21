// MetricCard.js
import React from "react";

const calculateMonthOverMonth = (currentValue, previousValue) => {
  if (previousValue === 0) {
    return currentValue === 0 ? 0 : 100;
  }
  return (currentValue / previousValue) * 100;
};

//前月比の色を決定する
const getComparisonColor = (change) => {
  if (change > 0) {
    return "green";
  } else if (change < 0) {
    return "red";
  } else {
    return "gray";
  }
};

const MetricCard = ({ title, value, previousValue, isActive, onClick }) => {
  //前月比を計算
  const monthOverMonth = ((value - previousValue) / (previousValue || 1)) * 100;

  return (
    <div
      className={`metric-card ${isActive ? "active" : ""}`} // アクティブなカードにスタイルを追加
      onClick={onClick} // カードクリック時のイベント
    >
      <div className="metric-card-header">
        <h3>{title}</h3> {/* カードのタイトルを表示 */}
      </div>
      <div className="metric-value">
        {value ? value.toLocaleString() : "0"}{" "}
        {/* 数字をフォーマットして表示 */}
      </div>
      <div
        className="metric-comparison"
        style={{ color: getComparisonColor(monthOverMonth) }}
      >
        {monthOverMonth !== 0 ? `${monthOverMonth.toFixed(2)}%` : "±0"}
        {monthOverMonth > 0 ? "▲" : monthOverMonth < 0 ? "▼" : ""}
      </div>
    </div>
  );
};

export default MetricCard;
