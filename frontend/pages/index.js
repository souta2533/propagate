import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
import dynamic from 'next/dynamic';
require('dotenv').config({ path: '.env.local' });
import { supabase } from '../lib/supabaseClient';
import { registerAccountId, registerPropertyId } from '../lib/submitHandler';
// import { url } from 'inspector';


const PROPAGATE_EMAIL = "propagate1@gmail.com";  // 事前に作成しておくPropagateのメールアドレス
const EMAIL_PROPAGATE_ID = 35;  // 事前に作成しておくPropagateのメールアドレス
const EMAIL_CUSTOMER = "egnpropagate85@gmail.com";    // 顧客が入力するメールアドレス


const DynamicAnalyticsChart = dynamic(() => import('../components/AnalyticsChart'), { ssr: false });

const LoadingSpinner = () => (
  <div className="spinner">
    <div className="double-bounce1"></div>
    <div className="double-bounce2"></div>
  </div>
);

export default function Home() {
  const { data: session, status } = useSession();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsProperties, setAnalyticsProperties] = useState([]);
  const [propertyList, setPropertyList] = useState([]); // accountId, propertyId, propertyNameをリスト形式で格納
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [loading, setLoading] = useState(false);  // データ取得中かどうかを管理
  const [pathList, setPathList] = useState([]); // pathListの状態を管理
  const [selectedPagePath, setSelectedPagePath] = useState(''); // 選択されたpagePathの状態を管理

  const [customerInfo, setCustomerInfo] = useState([]); // email: (updated_at, urls)
  const [isAnalyticsFetched, setIsAnalyticsFetched] = useState(false);  // Analyticsデータが取得されたかどうかを管理
  const [isSearchConsoleFetched, setIsSearchConsoleFetched] = useState(false);    // Search Consoleデータが取得されたかどうかを管理

  const [unregisteredCustomers, setUnregisteredCustomer] = useState([]);  // 未登録のCustomer EmailとURLを格納  

  useEffect(() => {
    if (status === 'loading') {
      console.log("Loading session data ...");
    }
    // sessionが存在する場合にのみ実行
    if (session) {
      fetchAnalyticsProperties();
    } else {
      console.log("No session");
    }
  }, [session, status]);

  /**
   * コンポーネントがマウントされたときに
   * 1. CustomerEmailからすべてのURLを取得
   * 2. データの更新日時を取得
   */
  useEffect(() => {
    getCustomerEmailsAndUpdatedAtAndUrls();
  }, []);
  
  const fetchAnalyticsProperties = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      
      const response = await fetch(`${apiUrl}/get-properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: session.accessToken })
      });

      const properties = await response.json();
      setAnalyticsProperties(properties);

      if (properties.length > 0) {
        setSelectedProperty(properties[0]);
      }

      console.log("Properties: ", properties);  

      // 全てのプロパティをまとめる
      const propertiesList = properties.map(property => ({
        accountId: property.accountId,
        propertyId: property.propertyId,
        propertyName: property.propertyName
      }));

      console.log("PropertiesList: ", propertiesList);

      // バックエンドにデータを送信
      sendInfoToBackend(propertiesList);

      // プロパティリストを更新
      setPropertyList(propertiesList);
    } catch (error) {
      console.error('Error fetching analytics properties:', error);
      // alert('Failed to fetch analytics properties. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Email, accountId, propertyIdをバックエンドに送信
  const sendInfoToBackend = async (properties) => {
    try {
      // console.log(properties);
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${apiUrl}/send-info`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          properties: properties, 
          email_propagate_id: EMAIL_PROPAGATE_ID,
          email_customer: EMAIL_CUSTOMER,
         }),
      });

      if (!response.ok){
        throw new Error('Failed to send information to backend');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchAnalyticsData = async () => {
    // if (!selectedProperty) return;
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

      // 全てのaccountIDとpropertyIDでAnalyticsのデータを取得
      const results = await Promise.all(
        propertyList.map(async (property) => {

          // PropertyListに対して，propertyIDに対応するupdated_atを取得
          const matchedCustomer = customerInfo.find(customer =>
            customer.urls.some(urlObj => urlObj.propertyId === property.propertyId)
          );

          // 更新日時を取得できている場合はそれを使い，取得できていない場合は現在より1年前の日付を取得
          const startDate = matchedCustomer
            ? new Date(matchedCustomer.updated_at).toISOString().split('T')[0]
            : new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0];

          const response = await fetch(`${apiUrl}/get-analytics`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              accessToken: session.accessToken,
              accountId: property.accountId,
              propertyId: property.propertyId,
              startDate: startDate,
              endDate: new Date().toISOString().split('T')[0]
            })
          });

          if (response.ok) {
            const data = await response.json();
            return { propertyName: property.propertyName, data: data };
          } else {
            console.error(`Failed to fetch analytics data. Status: ${response.status}`);
            return { propertyName: property.propertyName, data: null };
          }
        })
      );

      console.log("AnalyticsData: ", results);

      setAnalyticsData(results);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // alert('Failed to fetch analytics data. Please try again later.');
    } finally {
      // setLoading(false);
    }
  };

  const sendAnalyticsData = async (analyticsJsonData) => {
    if (!selectedProperty) return;

    try {      
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${apiUrl}/send-analytics/${selectedProperty.propertyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analyticsData: analyticsJsonData,
        })
      });

      if (!response.ok) {
        // throw new Error('Failed to send analutics data');
      }

      const result = await response.json();
      // console.log(result);
    } catch (error) {
      console.log('Error sending analytics data:', error);
    }
  };

  // CustomerEmailsTableからemail_customerを取得し，CustomerUrlTableからURLを取得
  const getCustomerEmailsAndUpdatedAtAndUrls = async () => {
    // 1. CustomerEmailsTableからemail_customer, updated_atを取得
    const { data: customerEmailsAndUpdatedAt, error: customerEmailsAndUpdatedAtError } = await supabase
      .from('CustomerEmailsTable')
      .select('email_customer, updated_at');

    if (customerEmailsAndUpdatedAtError) {
      console.error('Error fetching customer emails:', customerEmailsAndUpdatedAtError);
      return;
    } else {
      const customerInfoWithUpdatedAt = customerEmailsAndUpdatedAt.map((customer) => ({
        email: customer.email_customer,
        updated_at: customer.updated_at,
        urls: [],
      }));

      // 2. CustomerUrlTableからemail_customerに一致するpropertyIDとURLを取得
      const udpateCusotmerInfo = await Promise.all(
        customerInfoWithUpdatedAt.map(async (customer) => {
          const { data: propertyIdsAndUrls, error: urlsError } = await supabase
            .from('CustomerUrlTable')
            .select('property_id, customer_url')
            .eq('email_customer', customer.email);

            if (urlsError) {
              console.error('Error fetching customer urls:', urlsError);
              return {...customer, urls: []};
            }

            // PropertyIDとURLをcustomerInfoに追加
            const urls = propertyIdsAndUrls.map(propertyIdAndUrlObj => ({
              propertyId: propertyIdAndUrlObj.property_id,
              url: propertyIdAndUrlObj.customer_url
            }));

            return {
              ...customer,    // 既存のcustomer情報を保持
              urls: urls      // 取得したURLを追加
            }
        })
      );

      console.log("UpdateCustomerInfo: ", udpateCusotmerInfo);
      setCustomerInfo(udpateCusotmerInfo);
    }
  };

  const fetchSearchConsoleData = async () => {
    setLoading(true);

    try {
      // console.log("CustomerUrls: ", customerUrls);  
      
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

      // 全てのEmailとURLでSearch Consoleのデータを取得
      const results = await Promise.all(
        customerInfo.map(async (customer) => {
          // Emailに対するすべてのURLに対してAPIリクエストを送る
          const urlsData = await Promise.all(
            customer.urls.map(async (urlObj) => {
              // 更新日時を取得できている場合はそれを使い，取得できていない場合は現在より1年前の日付を取得
              const startDate = customer.updated_at
                ? new Date(customer.updated_at).toISOString().split('T')[0]
                : new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0];

              // URLに対してSearch Consoleのデータを取得
              const response = await fetch(`${apiUrl}/get-search-console`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  accessToken: session.accessToken,
                  url: urlObj.url,
                  startDate: startDate,
                  endDate: new Date().toISOString().split('T')[0]
                })
              });

              // レスポンスの確認
              if (response.ok) {
                if (response.status === 204) {
                  console.warn("No data available from Search Console. URL: ", url);
                  alert("No data available from Search Console");
                  return { url: urlObj.url, data: null};
                } else {
                  const data = await response.json();
                  // console.log(`Success! Received data:${data}\nURL: ${url}`);
                  return { url: urlObj.url, data: data };
                }
              } else {
                console.error(`Failed to fetch search console data. Status: ${response.status}  \nURL: ${url}`);
                return { url: urlObj.url, data: null};
              }
            })
          );
          return { email: customer.email, urlsData: urlsData};
        })
      );

      console.log('Search Console : ', results);
    } catch (error) {
      console.error('Error fetching search console data:', error);
      // alert('Failed to fetch search console data. Please try again later.');
    } finally {
      // setLoading(false);
    }
  };

  // 特定の条件を満たした際に，呼び出される
  // 第2引数（[selectedProperty]）に指定した変数が変更された際に，呼び出される
  useEffect(() => {
    let timeout;
    if (propertyList.length > 1 && customerInfo && !isAnalyticsFetched) {
      const fetchAnalytics = async () => {
        await fetchAnalyticsData(); // fetchAnalyticsDataが完了するまで待機
        setIsAnalyticsFetched(true); // 完了後にフラグをtrueに設定
        console.log("Analytics fetched successfully");
        timeout = setTimeout(() => setIsAnalyticsFetched(false), 5 * 60 * 1000); // 5分後にリセット
      };
  
      fetchAnalytics();
    }
  
    // クリーンアップ処理
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [propertyList, customerInfo, isAnalyticsFetched]);

  useEffect(() => {
    let timeout;
    if (customerInfo.length > 1 && !isSearchConsoleFetched) {
      const fetchSearchConsole = async () => {
        await fetchSearchConsoleData(); // fetchSearchConsoleDataが完了するまで待機
        setIsSearchConsoleFetched(true); // 完了後にフラグをtrueに設定
        console.log("Search Console fetched successfully");
        timeout = setTimeout(() => setIsSearchConsoleFetched(false), 5 * 60 * 1000); // 5分後にリセット
      };
  
      fetchSearchConsole();
    }
    // クリーンアップ処理
  return () => {
    if (timeout) clearTimeout(timeout);
  };
}, [customerInfo, isSearchConsoleFetched]);

  // AnlyticsとSearch Consoleのデータを取得したら，データの更新日時をDBに保存
  useEffect(() => {
    if (isAnalyticsFetched && isSearchConsoleFetched) {
      updateCustomerEmailUpdateAt();
      setLoading(false);
    }
    else{
      console.log("Analytics Fetch: ", isAnalyticsFetched); 
      console.log("Search Console Fetch: ", isSearchConsoleFetched);
    }
  }, [isAnalyticsFetched, isSearchConsoleFetched]);

  // CustomerEmailsTableのupdatedAtを更新
  const updateCustomerEmailUpdateAt = async () => {
    try {
      // JSTの現在の時刻を取得
      const currentTime = new Date();
      const jstTime = new Date(currentTime.getTime() + 9 * 60 * 60 * 1000);

      // すべての顧客のemail
      console.log("CustomerInfo: ", customerInfo);
      for (let customer of customerInfo) {
        const email = customer.email;
        const { data, error } = await supabase
          .from('CustomerEmailsTable')
          .update({ updated_at: jstTime })
          .eq('email_customer', email);

          if (error) {
            console.error("Error updating updatedAt:", error);
          }
      }
      console.log("Updated updatedAt for all customers");
    } catch (error) {
      console.error('Error updating updatedAt:', error);
    }
  }

  // 未登録のCustomer EmailをUnregisteredTableから取得
  const getUnregisteredCustomer = async () => {
    try {
      // UnregisteredTableから未登録のEmailとURLを取得
      const { data, error } = await supabase 
        .from('UnregisteredTable')
        .select('email, url');

      if (error) {
        console.error('Error fetching unregistered customers:', error); 
        return;
      }

      // データを保存するための構造を作成
      const unregisteredCustomersInfo = data.map((customer) => ({
        email: customer.email,
        url: customer.url,
        accountId: null,   // accountIDはこの後取得するため，初期値としてnull
        isSentAccountId: false,     // データを送信したかどうかを管理
        isSentUrl: false
      }));

      setUnregisteredCustomer(unregisteredCustomersInfo);

      console.log("UnregisteredCustomers: ", unregisteredCustomersInfo);
    } catch (error) {
      console.error('Error fetching unregistered customers:', error);
    }
  };

  // 未登録のCustomer EmailがaccountIDを持つかを確認
  const checkUnregisteredCustomer = async () => {
    try {
      const { data, error } = await supabase
        .from('CustomerDetailsTable')
        .select('email_customer, accounts_id')

      if (error) {
        console.error('Error fetching unregistered customers:', error);
        return;
      }

      // accountIDが存在するか確認し，unregisteredCustomersに反映
      // console.log("Before", unregisteredCustomers);
      const updateUnregisteredCustomers = unregisteredCustomers.map((customer) => {
        const matchedCustomer = data.find((item) => item.email_customer === customer.email);
        if (matchedCustomer && matchedCustomer.accounts_id) {
          return {
            ...customer,
            accountId: matchedCustomer.accounts_id,
            isSentAccountId: true
          };
        }
        return customer;    // account_idがない場合はnullのまま，元のデータを返す
      });
      
      console.log("Update Unregistered Customers: ", updateUnregisteredCustomers);

      // 実際に更新があった場合のみstateを更新
      if (JSON.stringify(unregisteredCustomers) !== JSON.stringify(updateUnregisteredCustomers)) {
        setUnregisteredCustomer(updateUnregisteredCustomers);
        console.log("Updated Unregistered Customers: ", updateUnregisteredCustomers);
      }
    } catch (error) {
      console.error('Error checking unregistered customers: ', error);
    }
  };

  useEffect(() => {
      // 1. 未登録のDBに含まれるEmailを全て取得（accountIDがない + URLの登録がまだの両方を含む）
      getUnregisteredCustomer();
  }, []);

  useEffect(() => {
    // 2. 未登録のEmailからaccountIDがあるかを確認
    checkUnregisteredCustomer();
  }, [unregisteredCustomers]);

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

  // 入力されたAccountID, PropertyID, PropertyNameを制御
  const handleAccountIdChange = (email, newAccountId) => {
    setUnregisteredCustomer((prevCustomers) => 
      prevCustomers.map((customer) =>
        customer.email == email ? {...customer, accountId: newAccountId } : customer
      )
    );
  }

  const handlePropertyIdChange = (email, url, newPropertyId) => {
    setUnregisteredCustomer((prevCustomers) => 
      prevCustomers.map((customer) =>
        customer.email == email && customer.url === url
          ? {...customer, propertyId: newPropertyId } 
          : customer
      )
    );
  };

  const handlePropertyNameChange = (email, url, newPropertyName) => {
    setUnregisteredCustomer((prevCustomers) => 
      prevCustomers.map((customer) =>
        customer.email == email && customer.url === url
          ? { ...customer, propertyName: newPropertyName } 
          : customer
      )
    );
  };

  const handleSentStatusChange = (email, type, value) => {
    setUnregisteredCustomer((prevCustomers) =>
      prevCustomers.map((customer) =>
        customer.email == email
        ? { 
            ...customer, 
            isSentAccountId: type === 'accountId' ? value : customer.isSentAccountId,
            isSentUrl: type === 'url' ? value : customer.isSentUrl,
          } 
        : customer
      )
    );
  };

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

      <div>
        {loading ? (
          <p>ロード中...</p>  // ローディング中のメッセージ
        ) : (
          <div>
            {/* 他のコンテンツ */}
            <p>データの取得が完了しました。</p>

            {unregisteredCustomers.length > 0 ? (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">未登録の顧客リスト:</h2>
              <table className="table-auto w-full bg-white shadow-md rounded-lg">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Account ID</th>
                    <th className="px-4 py-2">URL</th>
                    <th className="px-4 py-2">Property ID</th>
                    <th className="px-4 py-2">Property Name</th>
                    <th className="px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                {unregisteredCustomers.map((customer) => (
                    <tr key={customer.email} className="border-b">
                      <td className="px-4 py-2">{customer.email}</td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          placeholder="Enter Account ID"
                          className="px-4 py-2 border border-gray-300 rounded"
                          value={customer.accountId || ""}
                          onChange={(e) =>
                            handleAccountIdChange(customer.email, e.target.value)
                          }
                        />
                      </td>
                      <td className="px-4 py-2">{customer.url}</td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          placeholder="Enter Property ID"
                          className="px-4 py-2 border border-gray-300 rounded"
                          value={customer.propertyId || ""}
                          onChange={(e) =>
                            handlePropertyIdChange(customer.email, customer.url, e.target.value)
                          }
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          placeholder="Enter Property Name"
                          className="px-4 py-2 border border-gray-300 rounded"
                          value={customer.propertyName || ""}
                          onChange={(e) =>
                            handlePropertyNameChange(customer.email, customer.url, e.target.value)
                          }
                        />
                      </td>
                      <td className="px-4 py-2">
                        {customer.accountId === null || !customer.isSentAccountId ? (
                          <button
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            onClick={() =>
                              registerAccountId(
                                PROPAGATE_EMAIL, 
                                customer.email, 
                                customer.accountId
                              )
                            }
                          >
                            RegisterAccountID
                          </button>
                        ) : (
                          <button
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                            onClick={() => {
                              registerPropertyId(
                                customer.email,
                                customer.propertyId,
                                customer.propertyName,
                                customer.url
                              )
                              handleSentStatusChange(customer.email, 'url', true) 
                            }}
                          >
                            RegisterPropertyID
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>未登録の顧客データがありません。</p>
              )}
              </div>
            )}
    </div>
      
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