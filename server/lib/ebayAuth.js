const crypto = require('crypto');
const fetch = require('node-fetch');

const EBAY_AUTH_URL = 'https://api.sandbox.ebay.com/identity/v1/oauth2/token';
const EBAY_API_BASE = 'https://api.sandbox.ebay.com';

class EbayAuth {
  constructor() {
    this.clientId = process.env.EBAY_CLIENT_ID;
    this.clientSecret = process.env.EBAY_CLIENT_SECRET;
    this.devId = process.env.EBAY_DEV_ID;
    this.ruName = process.env.EBAY_RU_NAME || 'BrianSon-sellshot-SBX-3dce64f37-fe9ab758';
  }

  getAuthUrl() {
    const scopes = [
      'https://api.ebay.com/oauth/api_scope',
      'https://api.ebay.com/oauth/api_scope/sell.inventory',
      'https://api.ebay.com/oauth/api_scope/sell.marketing',
      'https://api.ebay.com/oauth/api_scope/sell.account',
      'https://api.ebay.com/oauth/api_scope/sell.fulfillment'
    ].join(' ');

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.ruName,
      response_type: 'code',
      scope: scopes,
      state: crypto.randomBytes(16).toString('hex')
    });

    return `https://auth.sandbox.ebay.com/oauth2/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(authCode) {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const response = await fetch(EBAY_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: authCode,
        redirect_uri: this.ruName
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`eBay token exchange failed: ${data.error_description || data.error}`);
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      expiresAt: new Date(Date.now() + data.expires_in * 1000)
    };
  }

  async refreshAccessToken(refreshToken) {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const response = await fetch(EBAY_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        redirect_uri: this.ruName
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`eBay token refresh failed: ${data.error_description || data.error}`);
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      expiresAt: new Date(Date.now() + data.expires_in * 1000)
    };
  }

  async getValidAccessToken(userId, prisma) {
    const auth = await prisma.userMarketplaceAuth.findUnique({
      where: {
        userId_marketplaceId: {
          userId,
          marketplaceId: 'ebay'
        }
      }
    });

    if (!auth) {
      throw new Error('eBay not connected');
    }

    if (auth.expiresAt > new Date()) {
      return auth.accessToken;
    }

    const tokens = await this.refreshAccessToken(auth.refreshToken);

    await prisma.userMarketplaceAuth.update({
      where: { id: auth.id },
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt
      }
    });

    return tokens.accessToken;
  }
}

module.exports = new EbayAuth();