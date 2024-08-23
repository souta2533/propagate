import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

const Dashboard = () => {
    const router = useRouter();
    const [session, setSession] = useState(null);
    const [accountIds, setAccountIds] = useState(null);
    const [propertyIds, setPropertyIds] = useState([]);
    const [analyticsData, setAnalyticsData]= useState([]);

    useEffect(() => {
        const fetchUserData = async () => {
            // 1. localStorageからセッションを取得
            // const {data: session } = await supabase.auth.getSession();
            const storedSession = localStorage.getItem('supabaseSession');
            const sessionData = storedSession ? JSON.parse(storedSession) : null;
            // console.log("session: ", sessionData);

            if (!sessionData) {
                // router.push('/auth/login');
            } else {
                setSession(sessionData);
            }

            // 2. Userのemailを取得
            const email_customer = sessionData.user.email;

            // 3. CustomerDetailsTableからaccountIdを取得
            const {data: customerDetailsData, error: customerDetailsError } = await supabase
                .from('CustomerDetailsTable')
                .select('accounts_id')
                .eq('email_customer', email_customer);

            if (customerDetailsError) {
                console.error('Error fetching accountIds:', customerDetailsError);
                return;
            }

            const accountIds = customerDetailsData.map(item => item.accounts_id);
            setAccountIds(accountIds);
            // console.log('AccountIds: ', accountIds);

            // 4. PropertyTableからpropertyIdを取得
            const {data: allProperties, error: propertyError } = await supabase
                .from('PropertyTable')
                .select('properties_id, properties_name, account_id')
                .in('account_id', accountIds);

            if (propertyError) {
                console.error('Error fetching property ids:', propertyError);
                return;
            }
            console.log('Properties: ', allProperties);

            setPropertyIds(allProperties);

            // 5. GoogleAnalyticsDataのデータを取得
            const propertyIds = allProperties.map(p => p.properties_id);
            const { data: allAnalytics, error: analyticsError } = await supabase
                .from('AnalyticsData')
                .select('*')
                .in('property_id', propertyIds);

            if (analyticsError) {
                console.error('Error fetching analytics data:', analyticsError);
                return;
            }

            setAnalyticsData(allAnalytics);
            console.log("Analytics: ", allAnalytics);
        };

        fetchUserData();
    }, [router]);

    // ダッシュボードの内容を記載
    
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
                <h1 className="text-2xl font-bold">Welcome, {session?.user?.email}</h1>
                <button 
                    onClick={() => supabase.auth.signOut()} 
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                    Sign out
                </button>
            </header>
            
            {propertyData.length > 0 ? (
                <div className="analytics-section bg-white p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-lg font-semibold mb-4">Analytics Properties:</h2>
                    <div className="relative">
                        <select 
                            value={selectedProperty ? `${selectedProperty.accountId}|${selectedProperty.propertyId}` : ''}
                            onChange={(e) => {
                                const [accountId, propertyId] = e.target.value.split('|');
                                const property = propertyData.find(p => p.accountId === accountId && p.propertyId === propertyId);
                                setSelectedProperty(property);
                            }}
                            className="block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {propertyData.map(prop => (
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
                <LoadingSpinner />  // 読み込み中に表示するスピナー（仮）
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


export default Dashboard;