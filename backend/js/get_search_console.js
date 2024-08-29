const { google } = require('googleapis');
const fs = require('fs');

const START_DATE = '2024-08-20';
const END_DATE = '2024-08-21';

// Goolge Search Console APIからデータを取得する関数AIzaSyBrwNVHmybwm13OieTTbLcn9xAKbNQE6IA
async function getSearchConsoleData(auth, siteURL) {
    const webmasters = google.webmasters({
        version: 'v3',
        auth
    });

    try {
        const response = await webmasters.searchanalytics.query({
            siteUrl: siteURL,
            requestBody: {
                startDate: START_DATE,
                endDate: END_DATE,
                dimensions: ['date', 'query', 'page', 'country', 'device'],
                rowLimit: 1000
            }
        });
        // const response = await fetch('https://www.googleapis.com/webmasters/v3/sites/https://www.example.com/searchAnalytics/query', {
        //     method: 'POST',
        //     headers: {
        //       'Authorization': `Bearer ${session.accessToken}`,
        //       'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({
        //       startDate: '2024-08-20',
        //       endDate: '2024-08-21',
        //       dimensions: ['date', 'query', 'page', 'country', 'device'],
        //       rowLimit: 1000
        //     })
        //   });
          
        // console.log('Full API Response:', response.data);

        if (response.data.rows && Array.isArray(response.data.rows)) {
            return response.data.rows;
        } else {
            console.log("No data of Search Console");
            return [];
        }
    } catch (error) {
        console.error('Error fetching Search Console data:', error);
        throw error;
    }
}

// データをフラットなJSON形式に変換する関数
function flattenData(dataMap) {
    const jsonData = [];

    for (const [date, queries] of Object.entries(dataMap)) {
        jsonData.push(queries);
    }
    return jsonData;
}

// メインの関数
async function handler(req, res) {
    const { accessToken, url } = req.body;
    if (!accessToken || !url) {
        console.log('AccesToken: ', accessToken, '\nSiteURL: ', url);
        console.error('Access token and site URL are required');
        return;
    }

    try {
        // OAuth2クライアントを初期化
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        // Google Search Consoleからデータを取得
        const rows = await getSearchConsoleData(auth, url);
        // console.log('Rows: ', rows);

        const dataMap = {};
        rows.forEach(row => {
            const [date, query, page, country, device] = row.keys;
            const { clicks, impressions, ctr, position } = row;

            const key = `${date}-${query}-${page}-${country}-${device}`;
            if (!dataMap[key]) {
                dataMap[key] = {
                    date: date,
                    query: query,
                    page: page,
                    country: country,
                    device: device,
                    clicks: 0,
                    impressions: 0,
                    ctr: 0,
                    position: 0
                };
            }

            // データの更新
            dataMap[key].clicks += clicks;
            dataMap[key].impressions += impressions;
            dataMap[key].ctr += ctr;
            dataMap[key].position += position;
        });

        // json形式に変換
        const jsonData = Object.values(dataMap);
        console.log(JSON.stringify(jsonData, null, 2));
    } catch (error) {
        console.error('Error fetching Search Console data:', error);
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