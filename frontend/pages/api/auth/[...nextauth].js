import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"


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

/**
 * NextAuthを用いてGoogleをプロバイダーとして認証を設定
 */

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/webmasters https://www.googleapis.com/auth/webmasters.readonly",
          access_type: "offline",
          prompt: "consent",
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.accessTokenExpires = account.expires_at * 1000  // expires_atは秒なのでミリ秒に変換
        // token.accessTokenExpires = Date.now() + 60 * 1000
      }

      // アクセストークンが有効な場合，そのまま返す
      if (Date.now() < token.accessTokenExpires) {
        return token
      }

      // アクセストークンが期限切れの場合はリフレッシュ
      return await refreshAccessToken(token)
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      return session
    }
  },
  // session: {
    // maxAge: 60 * 60 * 24 * 7,  // 7 days
    // maxAge: 60 * 1,
  // }
})