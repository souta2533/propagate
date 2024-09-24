import React from "react";
import { Pie } from "react-chartjs-2";

const PieChart = ({ data }) => {
  const chartData = {
    labels: data.map((item) => item[0]), // ラベル（セクション名）
    datasets: [
      {
        data: data.map((item) => item[1]), // 各セクションの値
        backgroundColor: ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"], // セクションの色
        borderColor: ["#ffffff"], // 境界線の色
        borderWidth: 1, // 境界線の幅
      },
    ],
  };

  const options = {
    responsive: true, // レスポンシブ対応
    plugins: {
      tooltip: {
        enabled: true, // ツールチップを表示
      },
      legend: {
        display: true, // 凡例の表示
        position: "bottom", // 凡例の位置
      },
    },
  };

  return <Pie data={chartData} options={options} />;
};

export default PieChart;
