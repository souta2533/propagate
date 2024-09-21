import React from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const LineChart = ({ data, dataKey }) => {
  const graphData = {
    labels: data.map((item) => item.date),
    datasets: [
      {
        label: dataKey,
        data: data.map((item) => item[dataKey]),
        borderColor: "#3399cc",
        backgroundColor: "rgba(64, 224,208,0.2 )",
        fill: true,
        tension: 0.1,
        borderWidth: 1,
        pointRadius: 0,
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
          maxTicksLimit: 5, //X軸のラベル表示
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
        enabled: true,
      },
      legend: {
        display: false, //凡例
      },
    },
  };

  const divStyle = {
    marginLeft: "auto",
    marginRight: "auto",
    margin: "0",
    width: "100%",
  };

  return (
    <div className="line-chart" style={divStyle}>
      <Line data={graphData} options={options} />
    </div>
  );
};

export default LineChart;
