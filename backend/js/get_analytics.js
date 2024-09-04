// pages/api/get-analytics.js
// import { google } from 'googleapis';
const { fstat } = require('fs');
const { google } = require('googleapis');
const { json } = require('stream/consumers');
const fs = require('fs');

var START_DATE = '2024-07-30';
var END_DATE = '2024-08-26';

// 日付ごとにpagePathをキーとしてデータを初期化する関数
function initialDateMapForNewPagePath(dateMap, allDates, newPagePath) {
  allDates.forEach(date => {
    if (!dateMap[date][newPagePath]) {
      dateMap[date][newPagePath] = {
        pageLocation: '',
        pagePath: newPagePath,
        date: date,
        deviceCategory: '',
        sessionSource: '',
        city: '',
        firstUserSourceMedium: '',
        screenPageViews: 0,
        conversions: 0,
        activeUsers: 0,
        sessions: 0,
        engagedSessions: 0,
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
//   console.log("handler");
  // accountId: 各WebサイトのGoogle AnalyticsのアカウントID（Googleアカウントの1つ下位層），propertyId: 各WebサイトのGoogle AnalyticsのプロパティID（各Webサイト）
  const { accessToken, accountId, propertyId } = req.body;

  if (!accessToken || !accountId || !propertyId) {
    console.error('Access token, accountID, and propertyID are required');
    return;
  }

  try {
    // Initialize the OAuth2 client with the access token
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    // Create an instance of the Google Analytics Data API
    const analyticsData = google.analyticsdata({
      version: 'v1beta',
      auth,
    });

    // 全てのデータを初期化
    const allDates = [];
    for (let d = new Date(START_DATE); d <= new Date(END_DATE); d.setDate(d.getDate() + 1)) {
      allDates.push(new Date(d).toISOString().split('T')[0].replace(/-/g, ''));
    }

    // 初期データを反映
    let initialDateMap = allDates.reduce((acc, date)=> {
      acc[date] = {};
      acc[date]['/'] = {
        pageLocation: '',
        pagePath: '/',
        date: date,
        deviceCategory: '',
        sessionSource: '',
        city: '',
        firstUserSourceMedium: '',
        screenPageViews: 0,
        conversions: 0,
        activeUsers: 0,
        sessions: 0,
        engagedSessions: 0,
      };
      return acc;
    }, {});

    // Make a request to fetch the analytics data
    const response = await analyticsData.properties.runReport({
      property: `properties/${propertyId}`, // properties/452842721
      requestBody: {
        dateRanges: [
          {
            startDate: START_DATE,
            endDate: END_DATE,
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
        ],
      },
    });

    if (response.data.rows && Array.isArray(response.data.rows)){
      // console.log("\nResponse Data:");
      // console.log(JSON.stringify(response.data, null, 2)); // JSON形式で整形して出力
      // console.log(response.data.rows)
      // console.log("\n");
    }
    else{
    //   console.log("\nResponse Data: Row is not found\n");
    }

    let json_data = []; // JSON形式で整形するための変数
    if(response.data.rows && Array.isArray(response.data.rows)){
      response.data.rows.forEach(row => {
        const dimensions = row.dimensionValues.map(dim => dim.value);
        const metrics = row.metricValues.map(metric => Number(metric.value));
        const pagePath = dimensions[1];
        const date = dimensions[2];
        // console.log(dimensions);

        // console.log(dimensions[1]);
        
        // 初見のpagePathだった場合，初期データを反映
        if (!initialDateMap[date][pagePath]) {
          initialDateMap = initialDateMapForNewPagePath(initialDateMap, allDates, pagePath);
        }

        initialDateMap[date][pagePath] = {
          pageLocation: dimensions[0],
          pagePath: dimensions[1],
          date: date,  
          deviceCategory: dimensions[3],
          sessionSource: dimensions[4],
          city: dimensions[5],
          firstUserSourceMedium: dimensions[6],
          screenPageViews: metrics[0],
          conversions: metrics[1],
          activeUsers: metrics[2],
          sessions: metrics[3],
          engagedSessions: metrics[4],
        };
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
    json_data = flattenDateMap(initialDateMap);

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