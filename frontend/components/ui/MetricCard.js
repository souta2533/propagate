// MetricCard.js
import React from "react";

//前月比の色を決定する
const getComparisonColor = (change) => {
  if (change > 0) {
    return "#1EC270";
  } else if (change < 0) {
    return "#FF0000";
  } else {
    return "gray";
  }
};

const MetricCard = ({ title, value, previousValue, isActive, onClick }) => {
  const currentValue = parseFloat(value) || 0;
  const prevValue = parseFloat(previousValue) || 0;
  let comValue;

  if (title === "問い合わせ率(CVR)") {
    comValue = (currentValue - prevValue).toFixed(2);
  } else {
    comValue = currentValue - prevValue;
  }
  return (
    <div
      className={`metric-card ${isActive ? "active" : ""}`} // アクティブなカードにスタイルを追加
      onClick={onClick} // カードクリック時のイベント
    >
      <div className="metric-card-header">
        <p>{title}</p> {/* カードのタイトルを表示 */}
      </div>
      <div className="metric-value">
        {value ? value.toLocaleString() : "0"}{" "}
        {/* 数字をフォーマットして表示 */}
      </div>
      <div className="metric-bottom">
        <div
          className="metric-comparison"
          style={{ color: getComparisonColor(comValue) }}
        >
          {comValue > 0
            ? `+${comValue}`
            : comValue < 0
            ? `-${Math.abs(comValue)}`
            : (comValue = 0 ? "±0" : "-")}
        </div>
        <div className="metric-text">(同期間比)</div>
      </div>
    </div>
  );
};

export default MetricCard;
