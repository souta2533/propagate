import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// 青基調のカラーパレットを定義
const blueColorPalette = [
    'rgba(0, 63, 92, 1)',     // ダークブルー
    'rgba(73, 190, 183, 1)',  // ターコイズ
    'rgba(0, 119, 182, 1)',   // ミディアムブルー
    'rgba(144, 224, 239, 1)', // ライトブルー
    'rgba(202, 240, 248, 1)', // ペールブルー
    'rgba(51, 103, 153, 1)',  // スチールブルー
    'rgba(70, 130, 180, 1)'   // スチールブルー（やや明るい）
  ];

function aggregateDevicesByDate(data, dataKey) {
    const aggregated = {};
    const categories = new Set();
  
    data.forEach(item => {
      const date = item.date;
      const categoryData = item[dataKey];
  
      if (typeof categoryData === 'object' && categoryData !== null) {
        Object.entries(categoryData).forEach(([category, value]) => {
          if (!aggregated[date]) {
            aggregated[date] = {};
          }
          if (!aggregated[date][category]) {
            aggregated[date][category] = 0;
          }
          aggregated[date][category] += typeof value === 'number' ? value : 0;
          categories.add(category);
        });
      }
    });

    const topCategories = Array.from(categories).slice(0,7);
  
    return { aggregated : Object.entries(aggregated).sort(([a], [b]) => a.localeCompare(b)) , categories:topCategories };
  }

const MultiLineChart = ({ data, dataKey }) => {
  const { aggregated, categories } = aggregateDevicesByDate(data, dataKey);

  const chartData = {
    labels: aggregated.map(([date]) => date),
    datasets: categories.map((category, index) => ({
        label: category,
        data: aggregated.map(([, values]) => values[category] || 0),
        borderColor: blueColorPalette[index % blueColorPalette.length],
        backgroundColor: blueColorPalette[index % blueColorPalette.length].replace('1)', '0.2)'),
        tension: 0.1,
        pointRadius: 4,
        pointHoverRadius: 6,
    }))
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'デバイスカテゴリー別の日毎の集計',
      },
    },
    scales: {
        x : {
            ticks:{
                autoSkip:true,
                maxTicksLimit:20,
            }
        },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        },
      },
    },
    plugins:{
        tooltip:{
            enabled:true,
            function(context) {
                const label = context.dataset.label || "";
                const value = context.raw;
                return `${label}: ${value}`;
            },
        },
        legend:{
            display:false,
        }
    }
  };
  const divStyle = {
    height: '350px',
    width: '100%',
  }

  return(<div className='multi-line-chart' style={divStyle}><Line options={options} data={chartData} /></div>);
};

export default MultiLineChart;