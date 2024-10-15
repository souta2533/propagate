async function refreshAccessToken(token) {
    try {
      const url = 'https://oauth2.googleapis.com/token'
      const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken
      })
  
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });
  
      const refreshedTokens = await response.json()
  
      if (!response.ok) {
        throw new Error(refreshedTokens.error || 'Failed to refresh access token')
      }
  
      return {
        ...token,
        accessToken: refreshedTokens.access_token,
        accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
        refreshToken: refreshedTokens.refresh_token ?? token.refreshToken
      }
    } catch (error) {
      console.error('Failed to refresh access token:', error)
      return {
        ...token,
        error: 'Failed to refresh access token'
      }
    }
  }