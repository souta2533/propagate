const { google } = require('googleapis');
const fs = require('fs');
const { refreshAccessToken } = require('./utils');


// Goolge Search Console APIからデータを取得する関数
async function getSearchConsoleData(auth, siteURL, startDate, endDate) {
    let webmasters = google.webmasters({
        version: 'v3',
        auth
    });

    let startRow = 0;
    let allRows = [];
    let hasMoreData = true;

    try {
        while(hasMoreData){
            try {
                const response = await webmasters.searchanalytics.query({
                    siteUrl: siteURL,
                    requestBody: {
                        startDate: startDate,
                        endDate: endDate,
                        dimensions: ['date', 'query', 'page', 'country', 'device'],
                        rowLimit: 1000,
                        startRow: startRow
                    }
                });
            
                if (response && response.data && response.data.rows && Array.isArray(response.data.rows)) {
                    allRows = allRows.concat(response.data.rows);
    
                    if (response.data.rows.length < 1000) {
                        hasMoreData = false;
                    } else {
                        startRow += 1000;
                    }
                } else {
                    hasMoreData = false;
                }
            } catch (error) {
                if (error.code == 401 || (error.response && error.response.status === 401)) {
                    try {
                        // アクセストークン切れの場合，トークンをリフレッシュして再試行
                        const newToken = await refreshAccessToken(auth.refreshToken);
                        auth.setCredentials({ access_token: newToken.accessToken });
                        webmasters = google.webmasters({
                            version: 'v3',
                            auth
                        });

                        continue;
                    } catch (error) {
                        console.error('Error refreshing access token:', error);
                        throw error;
                    }
                }
            }
        }
        return allRows;
    } catch (error) {
        // 403 Forbidden エラー処理
        if (error.response && error.response.status === 403) {
            console.log('403: Access denied for URL: ', siteURL);
            throw new Error('403: Acess denied for URL: ', siteURL);
        } else {
            console.error('Error fetching Search Console data:', error);
            throw error;
        }
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
    const { accessToken, refreshToken, url, startDate, endDate } = req.body;
    if (!accessToken || !refreshToken || !url) {
        console.log('AccesToken: ', accessToken, '\nSiteURL: ', url);
        console.error('Access token and site URL are required');
        return;
    }

    try {
        // OAuth2クライアントを初期化
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken, refresh_token: refreshToken });

        // Google Search Consoleからデータを取得
        const rows = await getSearchConsoleData(auth, url, startDate, endDate);

        // データが空だった場合，終了
        if (rows.length == 0) {
            console.log("NoData");
            return;
        }

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