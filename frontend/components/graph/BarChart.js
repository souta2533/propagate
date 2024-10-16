import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// 必要なコンポーネントを登録
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({ data }) => {
  if (!data || data.length === 0) {
    console.warn("Data is empty or null");
    return null;
  }

  // dataをchart.jsが必要とする形式に変換
  const chartData = {
    labels: data.map((item) => item[0]), // X軸のラベル
    datasets: [
      {
        label: "Value", // データセット名
        data: data.map((item) => item[1]), // Y軸のデータ
        backgroundColor: "#8884d8", // 棒グラフの色
        borderColor: "#8884d8", // 境界線の色
        borderWidth: 1, // 境界線の幅
      },
    ],
  };

  const options = {
    indexAxis: "y",
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
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || "";
            const value = context.raw;
            return `${value}`;
          },
        },
      },
      legend: {
        display: false, // 凡例を非表示にする
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default BarChart;
