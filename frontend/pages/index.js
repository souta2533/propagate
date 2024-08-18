import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
import dynamic from 'next/dynamic';
require('dotenv').config({ path: '.env.local' });
// import { start } from 'repl';


const DynamicAnalyticsChart = dynamic(() => import('../components/AnalyticsChart'), { ssr: false });

const LoadingSpinner = () => (
  <div className="spinner">
    <div className="double-bounce1"></div>
    <div className="double-bounce2"></div>
  </div>
);

export default function Home() {
  const { data: session } = useSession();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsProperties, setAnalyticsProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pathList, setPathList] = useState([]); // pathListの状態を管理
  const [selectedPagePath, setSelectedPagePath] = useState(''); // 選択されたpagePathの状態を管理

  useEffect(() => {
    if (session) fetchAnalyticsProperties();
  }, [session]);

  const fetchAnalyticsProperties = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      
      const response = await fetch(`${apiUrl}/get-properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: session.accessToken })
      });

      // console.log(response.json());

      const properties = await response.json();
      setAnalyticsProperties(properties);
      if (properties.length > 0) {
        setSelectedProperty(properties[0]);
      }
    } catch (error) {
      console.error('Error fetching analytics properties:', error);
      alert('Failed to fetch analytics properties. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalyticsData = async () => {
    if (!selectedProperty) return;
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${apiUrl}/get-analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          accessToken: session.accessToken,
          accountId: selectedProperty.accountId,
          propertyId: selectedProperty.propertyId
        })
      });
      
      const json_data = await response.json();
      // console.log(data);

      // pagePathのリストを取得(ここ無駄)
      const pathList = Array.from(new Set(
        json_data.map(entry => entry.pagePath)
      ));
      setPathList(pathList);
      setSelectedPagePath(pathList[0]);

      setAnalyticsData(json_data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      alert('Failed to fetch analytics data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // 特定の条件を満たした際に，呼び出される
  // 第2引数（[selectedProperty]）に指定した変数が変更された際に，呼び出される
  useEffect(() => {
    if (selectedProperty) fetchAnalyticsData();
  }, [selectedProperty]);

  if (!session) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-3xl font-semibold mb-4">Sign In</h1>
        <p className="text-gray-600 mb-6">Please sign in with your Google account to view analytics data.</p>
        <button 
          onClick={() => signIn('google')} 
          className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      {pathList.length > 0 && (
        <div className="page-path-section bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-4">Page Paths:</h2>
          <div className="relative">
            <select 
              value={selectedPagePath}
              onChange={(e) => setSelectedPagePath(e.target.value)}
              className="block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {pathList.map(path => (
                <option key={path} value={path}>
                  {path}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
  
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome, {session.user.email}</h1>
        <button 
          onClick={() => signOut()} 
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Sign out
        </button>
      </header>
      
      {analyticsProperties.length > 0 ? (
        <div className="analytics-section bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-4">Analytics Properties:</h2>
          <div className="relative">
            <select 
              value={selectedProperty ? `${selectedProperty.accountId}|${selectedProperty.propertyId}` : ''}
              onChange={(e) => {
                const [accountId, propertyId] = e.target.value.split('|');
                const property = analyticsProperties.find(p => p.accountId === accountId && p.propertyId === propertyId);
                setSelectedProperty(property);
              }}
              className="block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {analyticsProperties.map(prop => (
                <option key={`${prop.accountId}|${prop.propertyId}`} value={`${prop.accountId}|${prop.propertyId}`}>
                  {prop.accountName} - {prop.propertyName}
                </option>
              ))}
            </select>
          </div>
          
          {selectedProperty && (
            <div className="mt-4">
              <p><strong>Selected Account ID:</strong> {selectedProperty.accountId}</p>
              <p><strong>Selected Property ID:</strong> {selectedProperty.propertyId}</p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-600">No Analytics properties found for this account.</p>
      )}
      
      {loading ? (
        <LoadingSpinner />
      ) : analyticsData ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <DynamicAnalyticsChart 
            data={analyticsData}
            selectedPagePath={selectedPagePath}
          />
        </div>
      ) : (
        <p className="text-gray-600">No analytics data available</p>
      )}
    </div>
  );  
}