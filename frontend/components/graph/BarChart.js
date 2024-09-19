import React from "react";
import { Bar } from "react-chartjs-2";

const BarChart = ({ data }) => {
  // dataをchart.jsが必要とする形式に変換
  const chartData = {
    labels: Object.keys(data), // X軸のラベル
    datasets: [
      {
        label: "Value", // データセット名
        data: Object.values(data), // Y軸のデータ
        backgroundColor: "#8884d8", // 棒グラフの色
        borderColor: "#8884d8", // 境界線の色
        borderWidth: 1, // 境界線の幅
      },
    ],
  };

  const options = {
    scales: {
      x: {
        beginAtZero: true, // X軸の開始点をゼロにする
      },
      y: {
        beginAtZero: true, // Y軸の開始点をゼロにする
      },
    },
    responsive: true, // グラフをレスポンシブにする
    plugins: {
      tooltip: {
        enabled: true, // ツールチップを有効化
      },
      legend: {
        display: false, // 凡例を非表示にする
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default BarChart;
