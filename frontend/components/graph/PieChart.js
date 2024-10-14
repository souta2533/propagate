import React from "react";
import { Pie } from "react-chartjs-2";

const PieChart = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  const labels = data.map((item) => {
    switch (item[0]) {
      case "desktop":
        return "デスクトップ";
      case "tablet":
        return "タブレット";
      case "mobile":
        return "モバイル";
      case "smart tv":
        return "スマートテレビ";
      default:
        return item[0]; // その他はそのまま
    }
  });
  const values = data.map((item) => item[1]);
  const totalValue = values.reduce((acc, value) => acc + value, 0);

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: values,
        backgroundColor: ["#25DFBB", "#00C49F", "#4154A7", "#AA70A7"],
        borderColor: ["#ffffff"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        enabled: true,
      },
      legend: {
        display: false, // カスタム凡例を使用するため、デフォルトの凡例を無効化
      },
    },
  };

  // カスタムHTML凡例を生成
  const customLegend = () => {
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        {data.map((item, index) => {
          const percentage = ((item[1] / totalValue) * 100).toFixed(1);
          return (
            <div key={index} style={{ marginBottom: "10px", display: "flex" }}>
              {/* カスタムの色付き丸アイコン */}
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  backgroundColor: chartData.datasets[0].backgroundColor[index],
                  borderRadius: "50%",
                  marginRight: "10px",
                }}
              ></div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {/* ラベル */}
                <span style={{ fontSize: "12px" }}>{labels[index]}</span>
                {/* パーセンテージ（大きく、グレーに） */}
                <span style={{ fontSize: "20px", color: "gray" }}>
                  {percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* 円グラフのコンテナ */}
        <div
          style={{
            width: "130px",
            height: "130px",
          }}
        >
          <Pie data={chartData} options={options} />
        </div>
        {/* カスタム凡例を右側に表示 */}
        <div
          style={{
            marginLeft: "10px",
          }}
        >
          {customLegend()}
        </div>
      </div>
    </div>
  );
};

export default PieChart;
