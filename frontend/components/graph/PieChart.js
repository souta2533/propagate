import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import '../../styles/components/PieChart.css';

const PieChart = ({ data }) => {
  const [legendSize, setLegendSize] = useState("1vw");

  useEffect(() => {
    const updateLegendSize = () => {
      if (window.innerWidth <= 768) {  // スマホサイズ
        setLegendSize("3vw");
      } else {  // デスクトップ・タブレットサイズ
        setLegendSize("1vw");
      }
    };

    // 初期化
    updateLegendSize();
    // ウィンドウリサイズ時にサイズを更新
    window.addEventListener("resize", updateLegendSize);

    return () => {
      window.removeEventListener("resize", updateLegendSize);
    };
  }, []);

  if (!data || data.length === 0) {
    return null;
  }

  // 上位3つのデータとそれ以外を "その他" としてまとめる
  const top3 = data.slice(0, 3);
  const others = data.slice(3);
  // その他を表示する場合
  // const othersTotal = others.length > 0 ? others.reduce((acc, item) => acc + item[1], 0) : 0;

  const othersTotal = others.reduce((acc, item) => acc + item[1], 0);

  const filteredData = [...top3, ["others", othersTotal]];

  const labels = filteredData.map((item) => {
    switch (item[0]) {
      case "desktop":
        return "デスクトップ";
      case "tablet":
        return "タブレット";
      case "mobile":
        return "モバイル";
      case "smart tv":
        return "スマートテレビ";
      case "others":
        return "その他";
      default:
        return item[0];
    }
  });
  const values = filteredData.map((item) => item[1]);
  const totalValue = values.reduce((acc, value) => acc + value, 0);

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: values,
        backgroundColor: ["#25DFBB", "#00C49F", "#4154A7", "#AA70A7", "#FF6384"],
        borderColor: ["#ffffff"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        enabled: true,
      },
      legend: {
        display: false,
      },
    },
  };

  const customLegend = () => {
    return (
      <div className="legend-grid">
        {filteredData.map((item, index) => {

          const percentage = ((item[1] / totalValue) * 100).toFixed(1);
          // その他を表示する場合
          // const percentage = totalValue > 0 ? ((item[1] / totalValue) * 100).toFixed(1) : 0;

          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: legendSize,  // vwの値を使用
              }}
            >
              {/* カスタムの色付き丸アイコン */}
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  backgroundColor: chartData.datasets[0].backgroundColor[index],
                  borderRadius: "50%",
                  marginRight: "10px",
                }}
              ></div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {/* ラベル */}
                <span style={{ fontSize: `calc(${legendSize})` }}>{labels[index]}</span>
                {/* パーセンテージ */}
                <span style={{ fontSize: `calc(${legendSize} * 1.5)` , color: "black" }}>
                  {percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className="chart-container">
        <Pie data={chartData} options={options} />
      </div>
      <div
        style={{
          marginLeft: "2vw",
        }}
      >
        {customLegend()}
      </div>
    </div>
  );
};

export default PieChart;
