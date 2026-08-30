const db = require('../db');
const EbayApiClient = require('../lib/ebayApi');
const ebayAuth = require('../lib/ebayAuth');

async function getAllListings(req, res) {
  try {
    const items = await db.getItemsByUser(req.user.id);
    const listings = items.flatMap(item =>
      (item.listings || []).map(l => ({ ...l, item }))
    );
    res.json({ listings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getListings(req, res) {
  try {
    const listings = await db.getListingsByItem(req.params.itemId);
    res.json({ listings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getListing(req, res) {
  try {
    const listing = await db.getListingById(req.params.listingId);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json({ listing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createListing(req, res) {
  const { itemId } = req.params;
  const { marketplaceId, title, description, listingPrice } = req.body;

  if (!marketplaceId || !title || !description) {
    return res.status(400).json({ error: 'marketplaceId, title and description are required' });
  }

  try {
    const item = await db.getItemById(itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (item.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorised' });
    }

    const marketplace = await db.getMarketplaceById(marketplaceId);
    if (!marketplace) return res.status(404).json({ error: 'Marketplace not found' });

    let listing;
    let externalId = null;
    let externalUrl = null;
    let offerId = null;
    let sku = null;

    if (marketplace.type === 'API' && marketplace.slug === 'ebay') {
      const marketplaceAuth = await db.getUserMarketplaceAuth(req.user.id, marketplaceId);
      if (!marketplaceAuth) {
        return res.status(400).json({ error: 'eBay not connected. Please connect your eBay account first.' });
      }

      const accessToken = await ebayAuth.getValidAccessToken(req.user.id, db);
      const ebayClient = new EbayApiClient(accessToken);
      const result = await ebayClient.createListingFromItem(item, marketplaceAuth, db);

      listing = await db.createListing(itemId, {
        marketplaceId,
        title,
        description,
        listingPrice,
        externalId: result.externalId,
        externalUrl: result.externalUrl,
        offerId: result.offerId,
        sku: result.sku,
        status: 'ACTIVE',
        listedAt: new Date()
      });
    } else {
      listing = await db.createListing(itemId, { marketplaceId, title, description, listingPrice });
    }

    res.status(201).json({ listing });
  } catch (err) {
    console.error('Create listing error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function updateListing(req, res) {
  try {
    const listing = await db.getListingById(req.params.listingId);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.item.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorised' });
    }

    const marketplace = await db.getMarketplaceById(listing.marketplaceId);
    const updateData = { ...req.body };

    if (marketplace && marketplace.type === 'API' && marketplace.slug === 'ebay') {
      const marketplaceAuth = await db.getUserMarketplaceAuth(req.user.id, marketplace.id);
      if (!marketplaceAuth) {
        return res.status(400).json({ error: 'eBay not connected' });
      }

      const accessToken = await ebayAuth.getValidAccessToken(req.user.id, db);
      const ebayClient = new EbayApiClient(accessToken);
      await ebayClient.updateListing(listing.item, listing, marketplaceAuth, db);
    }

    const updated = await db.updateListing(req.params.listingId, updateData);
    res.json({ listing: updated });
  } catch (err) {
    console.error('Update listing error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function updateStatus(req, res) {
  const { status } = req.body;
  const validStatuses = ['DRAFT', 'PENDING', 'ACTIVE', 'SOLD', 'EXPIRED', 'REMOVED'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const listing = await db.getListingById(req.params.listingId);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.item.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorised' });
    }

    const marketplace = await db.getMarketplaceById(listing.marketplaceId);

    if (marketplace && marketplace.type === 'API' && marketplace.slug === 'ebay') {
      const marketplaceAuth = await db.getUserMarketplaceAuth(req.user.id, marketplace.id);
      if (!marketplaceAuth) {
        return res.status(400).json({ error: 'eBay not connected' });
      }

      const accessToken = await ebayAuth.getValidAccessToken(req.user.id, db);
      const ebayClient = new EbayApiClient(accessToken);

      if (status === 'ACTIVE' && listing.status !== 'ACTIVE') {
        if (listing.offerId) {
          await ebayClient.publishOffer(listing.offerId);
        }
      } else if (status === 'SOLD' || status === 'REMOVED' || status === 'EXPIRED') {
        if (listing.offerId) {
          await ebayClient.endOffer(listing.offerId);
        }
      }
    }

    const updateData = { status };
    if (status === 'ACTIVE') updateData.listedAt = new Date();
    if (status === 'SOLD') updateData.soldAt = new Date();

    const updated = await db.updateListingStatus(req.params.listingId, status);
    res.json({ listing: updated });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function deleteListing(req, res) {
  try {
    const listing = await db.getListingById(req.params.listingId);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.item.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorised' });
    }

    const marketplace = await db.getMarketplaceById(listing.marketplaceId);

    if (marketplace && marketplace.type === 'API' && marketplace.slug === 'ebay') {
      const marketplaceAuth = await db.getUserMarketplaceAuth(req.user.id, marketplace.id);
      if (marketplaceAuth && listing.offerId) {
        const accessToken = await ebayAuth.getValidAccessToken(req.user.id, db);
        const ebayClient = new EbayApiClient(accessToken);
        await ebayClient.endListing(listing, marketplaceAuth, db);
      }
    }

    await db.deleteListing(req.params.listingId);
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    console.error('Delete listing error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { 
    getAllListings,
    getListings, 
    getListing, 
    createListing, 
    updateListing, 
    updateStatus, 
    deleteListing 
};