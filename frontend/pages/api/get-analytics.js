// // pages/api/get-analytics.js
// import { google } from 'googleapis';

// var START_DATE = '2024-08-01';
// var END_DATE = '2024-08-14';

// // 日付ごとにpagePathをキーとしてデータを初期化する関数
// /**
//  * 
//  *     const allDates = [];
//     for (let d = new Date(START_DATE); d <= new Date(END_DATE); d.setDate(d.getDate() + 1)) {
//       allDates.push(new Date(d).toISOString().split('T')[0].replace(/-/g, ''));
//     }
//  */
// function initialDateMapForNewPagePath(dateMap, allDates, newPagePath) {
//   allDates.forEach(date => {
//     if (!dateMap[date][newPagePath]) {
//       dateMap[date][newPagePath] = {
//         pageLocation: '',
//         pagePath: newPagePath,
//         date: date,
//         deviceCategory: '',
//         sessionSource: '',
//         city: '',
//         firstUserSourceMedium: '',
//         screenPageViews: 0,
//         conversions: 0,
//         activeUsers: 0,
//         sessions: 0,
//         engagedSessions: 0,
//       };
//     }
//   });
//   return dateMap;
// }

// /**
//  * 課題: 1つのpropertyIDからのみデータを取得しているため，複数のpropertyIDからデータを取得するように修正あり
//  */
// export default async function handler(req, res) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   // accountId: 各WebサイトのGoogle AnalyticsのアカウントID（Googleアカウントの1つ下位層），propertyId: 各WebサイトのGoogle AnalyticsのプロパティID（各Webサイト）
//   const { accessToken, accountId, propertyId } = req.body;

//   if (!accessToken || !accountId || !propertyId) {
//     return res.status(400).json({ error: 'Access token, accountId, and propertyId are required' });
//   }

//   try {
//     // Initialize the OAuth2 client with the access token
//     const auth = new google.auth.OAuth2();
//     auth.setCredentials({ access_token: accessToken });

//     // Create an instance of the Google Analytics Data API
//     const analyticsData = google.analyticsdata({
//       version: 'v1beta',
//       auth,
//     });

//     // 全てのデータを初期化
//     const allDates = [];
//     for (let d = new Date(START_DATE); d <= new Date(END_DATE); d.setDate(d.getDate() + 1)) {
//       allDates.push(new Date(d).toISOString().split('T')[0].replace(/-/g, ''));
//     }

//     // 初期データを反映
//     let initialDateMap = allDates.reduce((acc, date)=> {
//       acc[date] = {};
//       acc[date]['/'] = {
//         pageLocation: '',
//         pagePath: '/',
//         date: date,
//         deviceCategory: '',
//         sessionSource: '',
//         city: '',
//         firstUserSourceMedium: '',
//         screenPageViews: 0,
//         conversions: 0,
//         activeUsers: 0,
//         sessions: 0,
//         engagedSessions: 0,
//       };
//       return acc;
//     }, {});

//     // Make a request to fetch the analytics data
//     const response = await analyticsData.properties.runReport({
//       property: `properties/${propertyId}`, // properties/452842721
//       requestBody: {
//         dateRanges: [
//           {
//             startDate: START_DATE,
//             endDate: END_DATE,
//           },
//         ],
//         dimensions: [
//           { name: 'pageLocation' },
//           { name: 'pagePath' },
//           { name: 'date' },
//           { name: 'deviceCategory' },
//           { name: 'sessionSource' },  
//           { name: 'city' },
//           { name: 'firstUserSourceMedium' },
//         ],
//         metrics: [
//           { name: 'screenPageViews' },
//           { name: 'conversions' },
//           { name: 'activeUsers' },
//           { name: 'sessions' },
//           { name: 'engagedSessions' },
//         ],
//       },
//     });

//     if (response.data.rows && Array.isArray(response.data.rows)){
//       // console.log("\nResponse Data:");
//       // console.log(JSON.stringify(response.data, null, 2)); // JSON形式で整形して出力
//       // console.log(response.data.rows)
//       // console.log("\n");
//     }
//     else{
//       console.log("\nResponse Data: Row is not found\n");
//     }

//     if(response.data.rows && Array.isArray(response.data.rows)){
//       response.data.rows.forEach(row => {
//         const dimensions = row.dimensionValues.map(dim => dim.value);
//         const metrics = row.metricValues.map(metric => Number(metric.value));
//         const pagePath = dimensions[1];
//         const date = dimensions[2];
//         // console.log(dimensions);

//         // console.log(dimensions[1]);
        
//         // 初見のpagePathだった場合，初期データを反映
//         if (!initialDateMap[date][pagePath]) {
//           initialDateMap = initialDateMapForNewPagePath(initialDateMap, allDates, pagePath);
//         }

//         initialDateMap[date][pagePath] = {
//           pageLocation: dimensions[0],
//           pagePath: dimensions[1],
//           date: date,  
//           deviceCategory: dimensions[3],
//           sessionSource: dimensions[4],
//           city: dimensions[5],
//           firstUserSourceMedium: dimensions[6],
//           screenPageViews: metrics[0],
//           conversions: metrics[1],
//           activeUsers: metrics[2],
//           sessions: metrics[3],
//           engagedSessions: metrics[4],
//         };
//       });
//     }

//     const data = Object.values(initialDateMap);
//     // console.log(data);
  
//     res.status(200).json(data);
//   } catch (error) {
//     console.error('Error fetching analytics data:', error);
//     res.status(500).json({ error: 'Failed to fetch analytics data' });
//   }
// }