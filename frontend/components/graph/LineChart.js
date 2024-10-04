import React from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

// データを日付で昇順にソートする関数
const sortDataByDate = (data) => {
  if (!Array.isArray(data)) {
    console.error("Data is not an array", data);
    return [];
  }
  return data.sort((a, b) => new Date(a.date) - new Date(b.date));
};

const LineChart = ({ data = [], dataKey }) => {
  if (!data || data.length === 0) {
    console.warn("Data is empty or null");
    return (
      <dev>
        <h1>Please set your URL & PagePath!</h1>
      </dev>
    );
  }

  // 日付順にソート
  const sortedData = sortDataByDate(data);

  const graphData = {
    labels: data.map((item) => item.date),
    datasets: [
      {
        label: dataKey,
        data: sortedData.map((item) => item[dataKey]),
        borderColor: "#00ccff",
        backgroundColor: "rgba(32, 178,255 ,0.1 )",
        fill: true,
        tension: 0.1,
        borderWidth: 2,
        pointRadius: 0,
        pointHitRadius: 20,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, //元の比を守る
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxTicksLimit: 20, //X軸のラベル表示
        },
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true, //Y軸を０に設定
      },
    },
    plugins: {
      tooltip: {
        enabled: true, //ツールチップを有効にする
        callbacks: {
          function(context) {
            const label = context.dataset.label || "";
            const value = context.raw;
            return `${label}: ${value}`;
          },
        },
      },
      legend: {
        display: false, //凡例
      },
    },
  };

  const divStyle = {
    height: "350px",
  };

  return (
    <div className="line-chart" style={divStyle}>
      <Line data={graphData} options={options} />
    </div>
  );
};

export default LineChart;
