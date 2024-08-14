// pages/api/get-analytics.js
import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { accessToken, accountId, propertyId } = req.body;

  if (!accessToken || !accountId || !propertyId) {
    return res.status(400).json({ error: 'Access token, accountId, and propertyId are required' });
  }

  try {
    // Initialize the OAuth2 client with the access token
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    // Create an instance of the Google Analytics Reporting API
    const analytics = google.analyticsreporting({
      version: 'v4',
      auth,
    });

    // Make a request to fetch the analytics data
    const response = await analytics.reports.batchGet({
      requestBody: {
        reportRequests: [
          {
            viewId: propertyId, // The propertyId serves as the view ID in GA
            dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }], // Last 30 days
            metrics: [
              { expression: 'ga:sessions' }, // Number of sessions
              { expression: 'ga:pageviews' } // Number of pageviews
            ],
            dimensions: [
              { name: 'ga:date' } // Break down by date
            ]
          }
        ]
      }
    });

    // Process the response data
    const data = response.data.reports[0].data.rows.map(row => ({
      date: row.dimensions[0],
      sessions: row.metrics[0].values[0],
      pageviews: row.metrics[0].values[1],
    }));

    // Return the processed data
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
}
