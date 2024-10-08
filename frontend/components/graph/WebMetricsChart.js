import React from "react";
import { Doughnut } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import "../../styles/components/webMetrics.css";

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
  labels: ["クリック数"],
  datasets: [
    {
      data: [500],
      backgroundColor: ["rgba(93, 160, 199)"],
      borderWidth: 0,
    },
  ],
};

const data3 = {
  labels: ["お問い合わせ数"],
  datasets: [
    {
      data: [50],
      backgroundColor: ["rgba(80, 137, 170)"],
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
      display: false,
      color: "white",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      borderRadius: 5,
      anchor: "center",
      align: "center",
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      },
      font: {
        size: "25",
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
          width: "35%",
          height: "100%",
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
        <div>
          <div
            style={{
              position: "absolute",
              top: "30%",
              left: "0",
              color: "white",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              textAlign: "center",
              fontSize: "2vw",
              fontWeight: "bold",
              zIndex: 100,
              borderRadius: "10px",
              padding: "10px",
            }}
          >
            ページ閲覧数<br></br>5000件
          </div>
        </div>
      </div>
      <div
        style={{
          width: "30%",
          height: "85%",
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
            transform: "scale(1.1,1) translateY(0vw) translateX(1.5vw)",
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
            data={data2}
            options={options}
            plugins={[ChartDataLabels]}
          />
        </div>
        <div>
          <div
            style={{
              position: "absolute",
              top: "30%",
              left: "0",
              color: "white",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              textAlign: "center",
              fontSize: "1.75vw",
              fontWeight: "bold",
              zIndex: 100,
              borderRadius: "10px",
              padding: "10px",
            }}
          >
            クリック数<br></br>500件
          </div>
        </div>
      </div>
      <div
        style={{
          width: "25%",
          height: "75%",
          transform: "scale(0.7,1)",
          position: "relative",
          overflow: "visible",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            overflow: "visible",
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
            overflow: "visible",
          }}
        >
          <Doughnut
            data={data3}
            options={options}
            plugins={[ChartDataLabels]}
          />
        </div>
        <div>
          <div
            style={{
              position: "absolute",
              top: "30%",
              left: "0",
              color: "white",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              textAlign: "center",
              fontSize: "1.5vw",
              fontWeight: "bold",
              zIndex: 100,
              borderRadius: "10px",
              padding: "10px",
            }}
          >
            お問い合わせ数<br></br>50件
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebMetricsChart;
