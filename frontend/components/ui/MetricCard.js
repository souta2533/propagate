// MetricCard.js
import React from "react";

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
  const currentValue = parseFloat(value) || 0;
  const prevValue = parseFloat(previousValue) || 0;
  let comValue;
  if (currentValue - prevValue === currentValue) {
    comValue = "-";
  } else if (title === "CVR (お問い合わせ率)") {
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
        <h3>{title}</h3> {/* カードのタイトルを表示 */}
      </div>
      <div className="metric-value">
        {value ? value.toLocaleString() : "0"}{" "}
        {/* 数字をフォーマットして表示 */}
      </div>
      <div
        className="metric-comparison"
        style={{ color: getComparisonColor(comValue) }}
      >
        {comValue > 0
          ? `${comValue}増加▲`
          : comValue < 0
          ? `${comValue}減少▼`
          : (comValue = 0 ? "±0" : "-")}
      </div>
    </div>
  );
};

export default MetricCard;
