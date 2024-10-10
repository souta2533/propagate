import React from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const LineChart = () => {
  const data = {
    labels: [],
    datasets: [
      {
        label: [1, 2],
        data: [3, 2, 1],
        borderColor: "#70ddd4",
        fill: true,
        backgroundColor: "#70ddd4",
        tension: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true, //元の比を守る
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      //"y-axis-0": {
      //  beginAtZero: true, //Y軸を０に設定
      //},
      //"y-axis-1": {
      //  beginAtZero: true, //Y軸を０に設定
      //  grid: {
      //    drawOnChartArea: false,
      //  },
      //},
    },
  };

  const divStyle = {
    width: "100%",
    height: "100%",
  };

  return (
    <div className="line-chart" style={divStyle}>
      <Line data={data} options={options} />
    </div>
  );
};

export default LineChart;
