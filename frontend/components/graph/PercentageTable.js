import React from "react";
import "../../styles/components/percentageTable.css"; // スタイルを別のCSSファイルに記述

const PercentageTable = ({ data, title, subtitle }) => {
  // データが存在しない、または不正な場合は何も表示しない
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  // 総数を計算
  const total = data.reduce((acc, item) => acc + item[1], 0);

  // データがすべて0の場合の処理
  if (total === 0) {
    return <p>No valid data available</p>;
  }

  return (
    <div className="percentage-table">
      <h3 className="table-title">{title}</h3>
      <p className="table-subtitle">{subtitle}</p>
      <div className="table-content">
        {data.map((item, index) => {
          // 各項目の割合を計算
          const percentage = ((item[1] / total) * 100).toFixed(1);

          return (
            <div
              key={index}
              className="table-row"
              style={{ display: "flex", flexDirection: "column" }}
            >
              <div className="label" style={{ marginBottom: "5px" }}>
                {item[0]}
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  className="bar"
                  aria-label={`Bar for ${item[0]} showing ${percentage}%`}
                  role="progressbar"
                  style={{ flex: 1, marginRight: "8px" }}
                >
                  <div
                    className="bar-fill"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: `#25DFBB`,
                    }}
                  ></div>
                </div>
                <div className="percentage">{percentage}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PercentageTable;
