const { Router } = require('express');
const ebayAuth = require('../lib/ebayAuth');
const { verifyToken } = require('../middleware/auth');
const db = require('../db');

const router = Router();

router.get('/connect', verifyToken, (req, res) => {
  const authUrl = ebayAuth.getAuthUrl();
  res.json({ authUrl });
});

router.get('/callback', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/settings?ebay_error=${encodeURIComponent(error_description || error)}`);
  }

  if (!code) {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/settings?ebay_error=missing_code`);
  }

  try {
    const tokens = await ebayAuth.exchangeCodeForToken(code);
    const ebayMarketplace = await db.getMarketplaceBySlug('ebay');

    if (!ebayMarketplace) {
      throw new Error('eBay marketplace not found');
    }

    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      throw new Error('No auth token in callback');
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await db.createUserMarketplaceAuth(decoded.id, ebayMarketplace.id, tokens);

    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/settings?ebay_connected=true`);
  } catch (err) {
    console.error('eBay callback error:', err);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/settings?ebay_error=${encodeURIComponent(err.message)}`);
  }
});

router.delete('/disconnect', verifyToken, async (req, res) => {
  try {
    const ebayMarketplace = await db.getMarketplaceBySlug('ebay');
    if (ebayMarketplace) {
      await db.deleteUserMarketplaceAuth(req.user.id, ebayMarketplace.id);
    }
    res.json({ message: 'eBay disconnected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/status', verifyToken, async (req, res) => {
  try {
    const ebayMarketplace = await db.getMarketplaceBySlug('ebay');
    if (!ebayMarketplace) {
      return res.json({ connected: false });
    }

    const auth = await db.getUserMarketplaceAuth(req.user.id, ebayMarketplace.id);
    res.json({ connected: !!auth, expiresAt: auth?.expiresAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;