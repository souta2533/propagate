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

const CustomLineChart = ({ data = [], dataKeys = [] }) => {
  if (!data || data.length === 0) {
    console.warn("Data is empty or null");
    return (
      <dev>
        <h1>Please set your URL & PagePath!</h1>
      </dev>
    );
  }

  // データの形式を確認
  console.log("Data:", data);
  console.log("Data Keys:", dataKeys);

  const graphData = {
    labels: data.map((item) => item.date),
    datasets: dataKeys.map((key, index) => {
      let borderColor;

      if (key === "PV") {
        borderColor = "#0000ff";
      } else if (key === "UU") {
        borderColor = "#ff8800";
      } else if (key === "CVR") {
        borderColor = "#ff0000";
      } else if (key === "CV") {
        borderColor = "#ee00ff";
      }

      return {
        label: key,
        data: data.map((item) => item[key]),
        borderColor: borderColor,
        fill: false,
        tension: 0.1,
        borderWidth: 2,
        pointRadius: 0,
        pointHitRadius: 20,
        yAxisID: `y-axis-${index}`,
      };
    }),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, //元の比を守る
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxTicksLimit: 7, //X軸のラベル表示
        },
        grid: {
          display: false,
        },
      },
      "y-axis-0": {
        type: "linear",
        position: "left",
        beginAtZero: true, //Y軸を０に設定
      },
      "y-axis-1": {
        type: "linear",
        position: "right",
        beginAtZero: true, //Y軸を０に設定
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      tooltip: {
        enabled: true, //ツールチップを有効にする
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || "";
            const value = context.raw;
            return `${label}: ${value}`;
          },
        },
      },
      legend: {
        display: true, //凡例
        align: "end",
        labels: {
          usePointStyle: true,
          pointStyle: "line",
          font: {
            size: 12,
          },
        },
      },
    },
  };

  const divStyle = {
    height: "27vw",
    "@media (max-width: 768px)": {
      height: "400vw",
    },
  };

  return (
    <div className="line-chart" style={divStyle}>
      <Line data={graphData} options={options} />
    </div>
  );
};

export default CustomLineChart;
