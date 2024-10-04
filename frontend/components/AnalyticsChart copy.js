import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import PropTypes from 'prop-types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Dynamic import with SSR disabled
const ResponsiveContainer = dynamic(
  () => import('recharts').then(mod => mod.ResponsiveContainer),
  { ssr: false }
);

const AnalyticsChart = ({ data }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    console.log('Analytics Data:', data);
  }, []);

  // Check if data is valid and has required keys
  const hasValidData = (key) => data && data.length > 0 && data.some(item => item[key] && typeof item[key] === 'number');

  if (!isClient) {
    return null; // SSR時は何も表示しない
  }

  return (
    <div>
      <h2>Analytics Data</h2>

      {/* Screen Page Views Section */}
      <div>
        <h3>Screen Page Views</h3>
        {hasValidData('screenPageViews') ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
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
            <LineChart data={data}>
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
            <LineChart data={data}>
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
            <LineChart data={data}>
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
            <LineChart data={data}>
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
