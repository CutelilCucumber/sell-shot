const { Router } = require('express');
const { verifyToken } = require('../middleware/auth');
const db = require('../db');
const ebayAuth = require('../lib/ebayAuth');
const EbayApiClient = require('../lib/ebayApi');

const router = Router();

async function getEbayClient(req, res) {
  const ebayMarketplace = await db.getMarketplaceBySlug('ebay');
  if (!ebayMarketplace) {
    return res.status(404).json({ error: 'eBay marketplace not configured' });
  }

  const marketplaceAuth = await db.getUserMarketplaceAuth(req.user.id, ebayMarketplace.id);
  if (!marketplaceAuth) {
    return res.status(400).json({ error: 'eBay not connected' });
  }

  const accessToken = await ebayAuth.getValidAccessToken(req.user.id, db);
  return new EbayApiClient(accessToken);
}

router.get('/categories/suggest', verifyToken, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter q is required' });
    }

    const client = await getEbayClient(req, res);
    if (!client) return;

    const result = await client.suggestCategories(q);
    res.json({ categories: result.categorySuggestions || [] });
  } catch (err) {
    console.error('Category suggestion error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/categories/:categoryId/aspects', verifyToken, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const client = await getEbayClient(req, res);
    if (!client) return;

    const result = await client.getItemAspectsForCategory(categoryId);
    res.json({ aspects: result });
  } catch (err) {
    console.error('Get category aspects error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/shipping-policies', verifyToken, async (req, res) => {
  try {
    const client = await getEbayClient(req, res);
    if (!client) return;

    const result = await client.getShippingPolicies();
    res.json({ policies: result.shippingPolicies || [] });
  } catch (err) {
    console.error('Get shipping policies error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/shipping-policies', verifyToken, async (req, res) => {
  try {
    const client = await getEbayClient(req, res);
    if (!client) return;

    const result = await client.createShippingPolicy(req.body);
    res.status(201).json({ policy: result });
  } catch (err) {
    console.error('Create shipping policy error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/return-policies', verifyToken, async (req, res) => {
  try {
    const client = await getEbayClient(req, res);
    if (!client) return;

    const result = await client.getReturnPolicies();
    res.json({ policies: result.returnPolicies || [] });
  } catch (err) {
    console.error('Get return policies error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/return-policies', verifyToken, async (req, res) => {
  try {
    const client = await getEbayClient(req, res);
    if (!client) return;

    const result = await client.createReturnPolicy(req.body);
    res.status(201).json({ policy: result });
  } catch (err) {
    console.error('Create return policy error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/payment-policies', verifyToken, async (req, res) => {
  try {
    const client = await getEbayClient(req, res);
    if (!client) return;

    const result = await client.getPaymentPolicies();
    res.json({ policies: result.paymentPolicies || [] });
  } catch (err) {
    console.error('Get payment policies error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/payment-policies', verifyToken, async (req, res) => {
  try {
    const client = await getEbayClient(req, res);
    if (!client) return;

    const result = await client.createPaymentPolicy(req.body);
    res.status(201).json({ policy: result });
  } catch (err) {
    console.error('Create payment policy error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/upload-images', verifyToken, async (req, res) => {
  try {
    const { imageUrls } = req.body;
    if (!imageUrls || !Array.isArray(imageUrls)) {
      return res.status(400).json({ error: 'imageUrls array is required' });
    }

    const client = await getEbayClient(req, res);
    if (!client) return;

    const uploadedUrls = await client.uploadImages(imageUrls);
    res.json({ imageUrls: uploadedUrls });
  } catch (err) {
    console.error('Upload images error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;