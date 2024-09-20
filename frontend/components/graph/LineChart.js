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
        borderColor: "#000000",
        backgroundColor: "rgba(136, 132,216,0.2 )",
        fill: true,
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true, //元の比を守る
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        title: {
          display: true,
          text: "Value",
        },
        beginAtZero: true, //Y軸を０に設定
      },
    },
    plugins: {
      tooltip: {
        enabled: true,
      },
      legend: {
        display: false,
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
    <div className="App" style={divStyle}>
      <Line data={graphData} options={options} />
    </div>
  );
};

export default LineChart;
