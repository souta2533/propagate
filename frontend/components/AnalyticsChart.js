// frontend/components/AnalyticsChart.js
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import PropTypes from 'prop-types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';

// Dynamic import with SSR disabled
const ResponsiveContainer = dynamic(
  () => import('recharts').then(mod => mod.ResponsiveContainer),
  { ssr: false }
);

/**
  * data: data = {date: {pagePath: (pageLocation, pagePath, ...)}, {pagePath2: (...)}, .... }
  * pagePathのフィルタリング
  * グラフ描画に必要なデータ形式に変換
 */
const filteringAndTransformDataForChart = (data, selectedPagePath) => {
  // console.log(data);
  // console.log("selectedPagePath: " + selectedPagePath); 
  const transformedData = [];

  data.forEach(entry => {
    // console.log(entry.pagePath);
    // console.log(selectedPagePath);
    if (entry.pagePath === selectedPagePath) {
        transformedData.push({
        pageLocation: entry.pageLocation,
        pagePath: entry.pagePath,
        date: entry.date,
        deviceCategory: entry.deviceCategory,
        sessionSource: entry.sessionSource,
        city: entry.city,
        firstUserSourceMedium: entry.firstUserSourceMedium,
        screenPageViews: entry.screenPageViews,
        conversions: entry.conversions,
        activeUsers: entry.activeUsers,
        sessions: entry.sessions,
        engagedSessions: entry.engagedSessions,
      });
    }
  });

  // console.log(transformedData);
  return transformedData
};

const AnalyticsChart = ({ data, selectedPagePath }) => {
  const [isClient, setIsClient] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredData, setFilteredData] = useState(data);

  // console.log(data);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // pagePathでデータをフィルタリング
    // const filterDataByPagePath = (data) => {
    //   if (!selectedPagePath) return data;
    //   return data.filter(item => item.pagePath === selectedDataPath);
    // };

    // データを日付範囲でフィルタリング
    const filterDataByDateRange = (data) => {
      // console.log(data);
      if (!startDate || !endDate) return data;
  
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
  
      return data.filter(item => {
        const itemDateStr = item.date;
        const year = parseInt(itemDateStr.substring(0, 4), 10);   // (0, 4)は先頭から何文字目までを取得するかを指定
        const month = parseInt(itemDateStr.substring(4, 6), 10) - 1;
        const day = parseInt(itemDateStr.substring(6, 8), 10);
        const itemDate = new Date(year, month, day);

        return itemDate >= start && itemDate <= end;
      });
    };
    // pagePathでデータをフィルタリングとグラフ用にデータを変換
    let filteredAndTransformed = filteringAndTransformDataForChart(data, selectedPagePath);
    setFilteredData(filterDataByDateRange(filteredAndTransformed));
    // console.log(filteredAndTransformed);  
    // console.log(filterDataByDateRange(filteredAndTransformed));
    
  }, [selectedPagePath, startDate, endDate, data]);

  // デバイスごとのデータを集計
  // useEffect(() => {
  //   const groupedData = filteredData.reduce((acc, cur) => {
  //     const date = cur.date;
  //     const deviceCategory = cur.deviceCategory;

  //     if (!acc[date]) {
  //       acc[date] = { date, mobile: 0, tablet: 0, desktop: 0};
  //     }

  //     if (deviceCategory === 'mobile') acc[date].mobile += cur.screenPageViews || 0;
  //     else if (deviceCategory === 'tablet') acc[date].tablet += cur.screenPageViews || 0;
  //     else if (deviceCategory === 'desktop') acc[date].desktop += cur.screenPageViews || 0;
  //     else acc[date].unknown += cur.screenPageViews || 0;

  //     return acc;
  //   }, {});

  //   setFilteredData(Object.values(groupedData));
  // }, [filteredData]);

  // Check if data is valid and has required keys
  const hasValidData = (key) => filteredData && filteredData.length > 0 && filteredData.some(item => typeof item[key] === 'number' && !isNaN(item[key]));

  if (!isClient) {
    return null; // SSR時は何も表示しない
  } 
  // console.log(filteredData);
  return (
    <div>
      <h2>Analytics Data</h2>

      <div className="date-filter-section mb-4">
        <label>
          Start Date:
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            className="ml-2 p-2 border rounded"
          />
        </label>
        <label className="ml-4">
          End Date:
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
            className="ml-2 p-2 border rounded"
          />
        </label>
      </div>

      {/* Screen Page Views Section */}
      <div>
        <h3>Screen Page Views</h3>
        {hasValidData('screenPageViews') ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="screenPageViews" stroke="#8884d8" name="Screen Page Views" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>No Screen Page Views data available</p>
        )}
      </div>

      {/* Active Users Section */}
      <div>
        <h3>Active Users</h3>
        {hasValidData('activeUsers') ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="activeUsers" stroke="#82ca9d" name="Active Users" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>No Active Users data available</p>
        )}
      </div>

      {/* Conversions Section */}
      <div>
        <h3>Conversions</h3>
        {hasValidData('conversions') ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="conversions" stroke="#FF6347" name="Conversions" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>No Conversions data available</p>
        )}
      </div>

      {/* Sessions Section */}
      <div>
        <h3>Sessions</h3>
        {hasValidData('sessions') ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sessions" stroke="#4682B4" name="Sessions" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>No Sessions data available</p>
        )}
      </div>

      {/* Engaged Sessions Section */}
      <div>
        <h3>Engaged Sessions</h3>
        {hasValidData('engagedSessions') ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="engagedSessions" stroke="#32CD32" name="Engaged Sessions" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>No Engaged Sessions data available</p>
        )}
      </div>

    </div>
  );
};

AnalyticsChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      screenPageViews: PropTypes.number,
      conversions: PropTypes.number,
      activeUsers: PropTypes.number,
      sessions: PropTypes.number,
      engagedSessions: PropTypes.number
    })
  ).isRequired
};

export default AnalyticsChart;
