import React from "react";
import { Pie } from "react-chartjs-2";

const PieChart = ({ data }) => {
  console.log("PieData:", data);
  if (!data || data.length === 0) {
    return null;
  }

  const labels = data.map((item) => item[0]);
  const values = data.map((item) => item[1]);

  const chartData = {
    labels: labels, // ラベル（セクション名）
    datasets: [
      {
        data: values, // 各セクションの値
        backgroundColor: ["#25DFBB", "#00C49F", "#4154A7", "#AA70A7"], // セクションの色
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
        position: "right", // 凡例の位置
      },
    },
  };

  return <Pie data={chartData} options={options} />;
};

export default PieChart;
