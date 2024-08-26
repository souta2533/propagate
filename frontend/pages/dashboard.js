import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

const Dashboard = () => {
    const router = useRouter();
    const [session, setSession] = useState(null);
    const [accountIds, setAccountIds] = useState([]);
    const [propertyIds, setPropertyIds] = useState([]);
    const [filteredProperties, setFilteredProperties] = useState([]);
    const [analyticsData, setAnalyticsData]= useState([]);

    const [selectedAccountId, setSelectedAccountId] = useState(null);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [pathList, setPathList] = useState([]); // pathListの状態を管理
    const [selectedPagePath, setSelectedPagePath] = useState('');

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
            setAccountIds(accountIds);      // ['1', '2']
            console.log('AccountIds: ', accountIds);

            if (accountIds.length > 0) {
                setSelectedAccountId(accountIds[0]);
            }

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

            setPropertyIds(allProperties);      // [{account_id, properties_id, properties_name}]

            // 最初のaccountIdに紐づくpropertyIdを取得
            if (accountIds.length > 0) {
                const initialFilteredProperties = allProperties.filter(
                    p => p.account_id === accountIds[0]
                );
                setFilteredProperties(initialFilteredProperties);   
                if (initialFilteredProperties.length > 0) {
                    setSelectedProperty(initialFilteredProperties[0]);     // {account_id, properties_id, properties_name}   
                }
            }

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

            // pagePathのリストを取得
            const pathList = new Set(allAnalytics.map(item => item.page_path));
            console.log("PathList: ", pathList);
        };

        fetchUserData();
    }, [router]);

    const handleAccountChange = (e) => {
        const selectedAccountId = e.target.value;
        setSelectedAccountId(selectedAccountId);

        // 選択されたaccountIdに紐づくpropertyIdを取得
        const newFilteredProperties = propertyIds.filter(property => property.account_id === selectedAccountId);
        setFilteredProperties(newFilteredProperties);

        if (newFilteredProperties.length > 0) {
            setSelectedProperty(newFilteredProperties[0]);
        } else {
            setSelectedProperty(null);
        }
    };

    const handlePropertyChange = (e) => {
        const selectedPropertyId = e.target.value;
        const property = filteredProperties.find(p => p.properties_id === selectedPropertyId);
        setSelectedProperty(property);
    }

    // ダッシュボードの内容を記載
    return (
        <div>
            <h1>Dashboard</h1>

            {/* Account ID の選択ドロップダウン */}
            {accountIds.length > 0 && (
                <div className="mb-4">
                    <label htmlFor="accountId" className="block text-gray-700">Select Account ID</label>
                    <select 
                        id="accountId"
                        value={selectedAccountId || ''}
                        onChange={handleAccountChange}
                        className="block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {accountIds.map(accountId => (
                            <option key={accountId} value={accountId}>
                                {accountId}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Property ID の選択ドロップダウン */}
            {filteredProperties.length > 0 ? (
                <div className="analytics-section bg-white p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-lg font-semibold mb-4">Analytics Properties:</h2>
                    <div className="relative">
                        <label htmlFor="propertyId" className="block text-gray-700">Select Property ID</label>
                        <select 
                            id="propertyId"
                            value={selectedProperty ? selectedProperty.properties_id : ''}
                            onChange={handlePropertyChange}
                            className="block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {filteredProperties.map(prop => (
                                <option key={prop.properties_id} value={prop.properties_id}>
                                    {prop.properties_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    {selectedProperty && (
                        <div className="mt-4">
                            <p><strong>Selected Account ID:</strong> {selectedProperty.account_id}</p>
                            <p><strong>Selected Property ID:</strong> {selectedProperty.properties_id}</p>
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-gray-600">No Analytics properties found for this account.</p>
            )}
        </div>
    );
}


export default Dashboard;