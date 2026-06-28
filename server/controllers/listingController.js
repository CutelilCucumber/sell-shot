const db = require('../db');

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

    const listing = await db.createListing(itemId, { marketplaceId, title, description, listingPrice });
    res.status(201).json({ listing });
  } catch (err) {
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

    const updated = await db.updateListing(req.params.listingId, req.body);
    res.json({ listing: updated });
  } catch (err) {
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

    const updated = await db.updateListingStatus(req.params.listingId, status);
    res.json({ listing: updated });
  } catch (err) {
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

    await db.deleteListing(req.params.listingId);
    res.json({ message: 'Listing deleted' });
  } catch (err) {
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