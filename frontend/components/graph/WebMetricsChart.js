import React from "react";
import { Doughnut } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Chart } from "chart.js";

/*const shadowPlugin = {
  id: "shadow",
  beforeDraw: (chart) => {
    const ctx = chart.ctx;
    ctx.save();

    chart.data.datasets.forEach((dataset, i) => {
      const meta = chart.getDatasetMeta(i);
      meta.data.forEach((element) => {
        const { x, y } = element.tooltipPosition();
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.beginPath();
        ctx.arc(
          x,
          y,
          element.outerRadius,
          element.startAngle,
          element.endAngle
        );
        ctx.closePath();
        ctx.fill();
      });
    });
  },
  afterDraw: (chart) => {
    chart.ctx.restore();
  },
};

Chart.register(shadowPlugin);*/

const shadowData = {
  labels: [""],
  datasets: [
    {
      data: [1],
      backgroundColor: ["rgba(0, 0, 0, 1)"],
      borderWidth: 0,
    },
  ],
};

const data1 = {
  labels: ["ページ閲覧数"],
  datasets: [
    {
      data: [5000],
      backgroundColor: ["rgba(135, 206, 250)"],
      borderWidth: 0,
    },
  ],
};

const data2 = {
  labels: ["お問い合わせ数"],
  datasets: [
    {
      data: [50],
      backgroundColor: ["rgba(173, 216, 230)"],
      borderWidth: 0,
    },
  ],
};

const options = {
  cutout: "60%",
  plugins: {
    legend: {
      display: false,
    },
    datalabels: {
      display: true,
      color: "white",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      borderRadius: 5,
      align: "center",
      anchor: "center",
      offset: 10,
      font: {
        size: 30,
        family: "Noto Sans JP",
        weight: "bold",
      },
      formatter: (value, context) => {
        const label = context.chart.data.labels[0];
        return `${label}:\n${value}件`;
      },
    },
  },
  interaction: { mode: "none" },
};

const WebMetricsChart = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "50%",
          height: "80%",
          transform: "scale(0.7,1)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            transform: "scale(1.1,1) translateY(0) translateX(2vw)",
          }}
        >
          <Doughnut
            data={shadowData}
            options={{
              cutout: "60%",
              plugins: {
                datalabels: { display: false },
                legend: { display: false, legend: { display: false } },
              },
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <Doughnut
            data={data1}
            options={options}
            plugins={[ChartDataLabels]}
          />
        </div>
      </div>
      <div
        style={{
          width: "30%",
          height: "50%",
          transform: "scale(0.7,1)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            transform: "scale(1.1,1) translateY(0vw) translateX(1vw)",
          }}
        >
          <Doughnut
            data={shadowData}
            options={{
              cutout: "60%",
              plugins: {
                datalabels: { display: false },
                legend: { display: false },
              },
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <Doughnut
            data={data1}
            options={options}
            plugins={[ChartDataLabels]}
          />
        </div>
      </div>
      <div
        style={{
          width: "30%",
          height: "30%",
          transform: "scale(0.7,1)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            transform: "scale(1.1,1) translateY(0) translateX(1vw)",
          }}
        >
          <Doughnut
            data={shadowData}
            options={{
              cutout: "60%",
              plugins: {
                datalabels: { display: false },
                legend: { display: false },
              },
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <Doughnut
            data={data1}
            options={options}
            plugins={[ChartDataLabels]}
          />
        </div>
      </div>
    </div>
  );
};

export default WebMetricsChart;
