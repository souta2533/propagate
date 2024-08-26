const { google } = require('googleapis');
const fs = require('fs');

const START_DATE = '2024-07-30';
const END_DATE = '2024-08-26';

// Goolge Search Console APIからデータを取得する関数
async function getSearchConsoleData(auth, siteURL) {
    const webmasters = google.webmasters({
        version: 'v3',
        auth
    });

    try {
        const response = await searchconsole.searchanalytics.query({
            siteUrl: siteURL,
            requestBody: {
                startDate: START_DATE,
                endDate: END_DATE,
                dimensions: ['date', 'query'],
                rowLimit: 1000
            }
        });

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

// データを初期化する関数
function initializeDataStructure(dates, queries) {
    const dataMap = {};
    dates.forEach(date => {
        dataMap[date] = {};
        queries.forEach(query => {
            dataMap[date] = {
                date: date,
                query: query,
                clicks: 0,
                impressions: 0,
                ctr: 0,
                position: 0
            };
        });
    });
    return dataMap;
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
    const { accessToken, siteUrl } = req.body;

    if (!accessToken || !siteUrl) {
        console.error('Access token and site URL are required');
        return;
    }

    try {
        // OAuth2クライアントを初期化
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        // 全ての日付を初期化
        const allDate = [];
        for (let d = new Date(START_DATE); d <= new Date(END_DATE); d.setDate(d.getDate() + 1)) {
            allDate.push(new Date(d).toISOString().split('T')[0]);
        }

        const allQueries = [];
        let dataMap = initializeDataStructure(allDate, allQueries);

        // Google Search Consoleからデータを取得
        const rows = await getSearchConsoleData(auth, siteUrl);

        rows.forEach(row => {
            const query = row.keys[0];
            const clicks = row.clicks;
            const impressions = row.impressions;
            const ctr = row.ctr;
            const position = row.position;
            const date = row.date;

            if (!dataMap[date]) {
                dataMap[date] = {
                    date: date,
                    query: query,
                    clicks: 0,
                    impressions: 0,
                    ctr: 0,
                    position: 0
                };
            }

            dataMap[date] = {
                date: date,
                query: query,
                clicks: clicks,
                impressions: impressions,
                ctr: ctr,
                position: position
            };
        });

        // json形式に変換
        jsonData = flattenData(dataMap);
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