const { refreshAccessToken } = require('./utils.js');

const { fstat } = require('fs');
const { google } = require('googleapis');
const { json } = require('stream/consumers');
const fs = require('fs');
const { start } = require('repl');

// var START_DATE = '2024-07-30';
// var END_DATE = '2024-08-26';

// 日付ごとにpagePathをキーとしてデータを初期化する関数
function initialDateMapForNewPagePath(dateMap, allDates, newPagePath) {
  allDates.forEach(date => {
    if (!dateMap[date][newPagePath]) {
      dateMap[date][newPagePath] = {
        page_location: '',
        page_path: newPagePath,
        date: date,
        device_category: '',
        session_source: '',
        city: '',
        first_user_source_medium: '',
        screen_page_views: 0,
        conversions: 0,
        active_users: 0,
        sessions: 0,
        engaged_sessions: 0,
        total_users: 0,
        // gender: '',
        // age: '',
      };
    }
  });
  return dateMap;
}

/*
    Jsonに対応するデータ構造にする関数
    {date: {pagePath: {pageData}}} -> [{pageData}]
*/
function flattenDateMap(initialDateMap) {
    const json_data = [];

    for (const [date, pages] of Object.entries(initialDateMap)) {
        for (const [pagePath, pageData] of Object.entries(pages)) {
            json_data.push(pageData);
        }
    }

    return json_data;
}

async function handler(req, res) {
  // accountId: 各WebサイトのGoogle AnalyticsのアカウントID（Googleアカウントの1つ下位層），propertyId: 各WebサイトのGoogle AnalyticsのプロパティID（各Webサイト）
  const { accessToken, refreshToken, accountId, propertyId, startDate, endDate } = req.body;

  if (!accessToken || !refreshToken || !accountId || !propertyId) {
    console.error('Access token, accountID, refreshToken and propertyID are required');
    return;
  }

  try {
    // Initialize the OAuth2 client with the access token
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken, refresh_token: refreshToken });

    // Create an instance of the Google Analytics Data API
    const analyticsData = google.analyticsdata({
      version: 'v1beta',
      auth,
    });

    // 全てのデータを初期化
    const allDates = [];
    for (let d = new Date(startDate); d <= new Date(endDate); d.setDate(d.getDate() + 1)) {
      allDates.push(new Date(d).toISOString().split('T')[0].replace(/-/g, ''));
    }

    // 初期データを反映
    let initialDateMap = allDates.reduce((acc, date)=> {
      acc[date] = {};
      acc[date]['/'] = {
        page_location: '',
        page_path: '/',
        date: date,
        device_category: '',
        session_source: '',
        city: '',
        first_user_source_medium: '',
        screen_page_views: 0,
        conversions: 0,
        active_users: 0,
        sessions: 0,
        engaged_sessions: 0,
        total_users: 0,
        // gender: '',
        // age: '',
      };
      return acc;
    }, {});

    // 以下では，Google Analyticsのデータを取得する
    let startRow = 0;
    let allRows = [];
    let hasMoreData = true;

    while (hasMoreData) {
      try {
        // Analytics APIのリクエストを作成
        const response = await analyticsData.properties.runReport({
          property: `properties/${propertyId}`, // properties/452842721
          requestBody: {
            dateRanges: [
              {
                startDate: startDate,
                endDate: endDate,
              },
            ],
            dimensions: [
              { name: 'pageLocation' },
              { name: 'pagePath' },
              { name: 'date' },
              { name: 'deviceCategory' },
              { name: 'sessionSource' },  
              { name: 'city' },
              { name: 'firstUserSourceMedium' },
            ],
            metrics: [
              { name: 'screenPageViews' },
              { name: 'conversions' },
              { name: 'activeUsers' },
              { name: 'sessions' },
              { name: 'engagedSessions' },
              { name: 'totalUsers' },
              // { name: 'userGender'},
              // { name: 'userAgeBracket'},
            ],
            limit: 1000,   // 1回のリクエストで取得する行数
            offset: startRow,   // 取得する行の開始位置
          },
        });

        // レスポンスの確認
        if (response && response.data && response.data.rows && Array.isArray(response.data.rows)) {
          allRows = allRows.concat(response.data.rows);

          // データが1000行未満の場合は，これ以上データがないことを確認
          if (response.data.rows.length < 1000) {
            hasMoreData = false;
          } else {
            // データが1000行以上ある場合，次の1000行を取得するためにstartRowを更新
            startRow += 1000;
          }
        } else {
          // データが取得できていない場合はループを終了
          hasMoreData = false;
        }
      } catch (error) {
        if (error.code === 401 || (error.response && error.response.status === 401)) {
          try {
            // アクセストークン切れの場合，トークンをリフレッシュして再試行
            const newToken = await refreshAccessToken(refreshToken);
            auth.setCredentials({ access_token: newToken.accessToken, refresh_token: newToken.refreshToken });
            accessToken = newToken.accessToken;
    
            // 再試行
            continue;
          } catch (refreshError) {
            console.error('Error refreshing access token:', refreshError);
            throw refreshError;
          }
        } else {
          console.error('Error fetching analytics data:', error);
          throw error;
        }
      }
    }    

    let json_data = []; // JSON形式で整形するための変数
    const dataMap = {};
    if(allRows && Array.isArray(allRows)){
      allRows.forEach(row => {
        const dimensions = row.dimensionValues.map(dim => dim.value);
        const metrics = row.metricValues.map(metric => Number(metric.value));

        // const pagePath = dimensions[1];
        // const date = dimensions[2];
        
        const page_location = dimensions[0];
        const pagePath = dimensions[1];
        const date = dimensions[2];
        const device_category = dimensions[3];
        const session_source = dimensions[4];
        const city = dimensions[5];
        const first_user_source_medium = dimensions[6];
        
        const screen_page_views = metrics[0];
        const conversions = metrics[1];
        const active_users = metrics[2];
        const sessions = metrics[3];
        const engaged_sessions = metrics[4];
        const total_users = metrics[5];

        const key = `${date}-${page_location}-${device_category}-${session_source}-${city}-${first_user_source_medium}`;
        if (!dataMap[key]) {
          dataMap[key] = {
            page_location: page_location,
            pagePath: pagePath,
            date: date,
            device_category: device_category,
            session_source: session_source,
            city: city,
            first_user_source_medium: first_user_source_medium,
            screen_page_views: 0,
            conversions: 0,
            active_users: 0,
            sessions: 0,
            engaged_sessions: 0,
            total_users: 0,
          }
        }

        // データの更新
        dataMap[key].screen_page_views += screen_page_views;
        dataMap[key].conversions += conversions;
        dataMap[key].active_users += active_users;
        dataMap[key].sessions += sessions;
        dataMap[key].engaged_sessions += engaged_sessions;
        dataMap[key].total_users += total_users;


        // // 初見のpagePathだった場合，初期データを反映
        // if (!initialDateMap[date][pagePath]) {
        //   initialDateMap = initialDateMapForNewPagePath(initialDateMap, allDates, pagePath);
        // }

        // // すでにデータが存在する場合，データをかさん
        // const existingData = initialDateMap[date][pagePath];
        
        // if (existingData){
        //   initialDateMap[date][pagePath] = {
        //     page_location: dimensions[0],
        //     page_path: dimensions[1],
        //     date: date,  
        //     device_category: dimensions[3],
        //     session_source: dimensions[4],
        //     city: dimensions[5],
        //     first_user_source_medium: dimensions[6],
        //     screen_page_views: existingData.screen_page_views + metrics[0],
        //     conversions: existingData.conversions + metrics[1], 
        //     active_users: existingData.active_users + metrics[2], 
        //     sessions: existingData.sessions + metrics[3], 
        //     engaged_sessions: existingData.engaged_sessions + metrics[4], 
        //     total_users: existingData.total_users + metrics[5],
        //     // gender: metrics[6],
        //     // age: metrics[7],
        //   };
        // }
      });
    } else {
        // データがない場合，全て初期化されたデータが戻り値
        json_data = flattenDateMap(initialDateMap);
        console.log(JSON.stringify(json_data, null, 2));
        // console.log("No data");
        // res.status(200).json(Object.values(initialDateMap)); 
        return;
    }

    // Json形式で整形
    // json_data = flattenDateMap(initialDateMap);
    json_data = Object.values(dataMap);

    // const data = Object.values(initialDateMap);
    // return json_data;
    console.log(JSON.stringify(json_data, null, 2));
    // res.status(200).json(Object.values(json_data));
  
  } catch (error) {
    console.error('Error fetching analytics data:', error);
  }
}

// ファイルの最後に追加
if (require.main === module) {
    process.stdin.on('data', async (input) => {
      const data = JSON.parse(input.toString());
      await handler({ body: data }, null);
    });
  }
  
  module.exports = handler;