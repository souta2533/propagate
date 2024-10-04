// pages/api/get-analytics-properties.js
// import { google } from 'googleapis'
const { google } = require('googleapis');
const fs = require('fs');

async function handler(req, res) {
  const { accessToken } = req.body

  if (!accessToken) {
    console.error('Access token is required');
    return;
  }

  try {
    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: accessToken })

    const analyticsAdmin = google.analyticsadmin({ version: 'v1alpha', auth })  

    // まずアカウントを取得
    const accountsResponse = await analyticsAdmin.accounts.list()
    const accounts = accountsResponse.data.accounts

    // アカウントごとにプロパティを取得
    const properties = []
    for (const account of accounts) {
      const propertiesResponse = await analyticsAdmin.properties.list({
        filter: `parent:${account.name}`
      })
      properties.push(...propertiesResponse.data.properties.map(property => ({
        accountId: account.name.split('/')[1], // "accounts/ACCOUNT_ID"からIDを抽出
        accountName: account.displayName,
        propertyId: property.name.split('/')[1], // "properties/PROPERTY_ID"からIDを抽出
        propertyName: property.displayName,
        websiteUrl: property.siteName // websiteUrlがある場合は使用
      })))
    }
    // console.log(properties)

    console.log(JSON.stringify(properties));
    fs.writeFileSync('properties.json', JSON.stringify(properties));
  } catch (error) {
    console.error('Error fetching Google Analytics properties:', error);
  }
}

if (require.main === module) {
  process.stdin.on('data', async (input) => {
    const data = JSON.parse(input.toString());
    await handler({ body: data }, null);
  });
}

module.exports = handler;