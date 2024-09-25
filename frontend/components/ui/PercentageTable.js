import React from "react";
import "../../styles/components/percentageTable.css"; // スタイルを別のCSSファイルに記述

const PercentageTable = ({ data }) => {
  // 総数を計算
  const total = data.reduce((acc, item) => acc + item[1], 0);

  return (
    <div className="percentage-table">
      <h3 className="table-title"></h3>
      <p className="table-subtitle">視聴回数・過去28日間</p>
      <div className="table-content">
        {data.map((item, index) => {
          // 各項目の割合を計算
          const percentage = ((item[1] / total) * 100).toFixed(1);

          return (
            <div key={index} className="table-row">
              <div className="label">{item[0]}</div>
              <div className="bar">
                <div
                  className="bar-fill"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: `#005bac`,
                  }}
                ></div>
              </div>
              <div className="percentage">
                {percentage}%({item[1]})
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PercentageTable;
