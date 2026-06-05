const db = require('../db');

async function getMarketplaces(req, res) {
  try {
    const marketplaces = await db.getAllMarketplaces();
    res.json({ marketplaces });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getMarketplace(req, res) {
  try {
    const marketplace = await db.getMarketplaceById(req.params.id);
    if (!marketplace) return res.status(404).json({ error: 'Marketplace not found' });
    res.json({ marketplace });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createMarketplace(req, res) {
  const { name, slug } = req.body;
  if (!name || !slug) {
    return res.status(400).json({ error: 'name and slug are required' });
  }

  try {
    const marketplace = await db.createMarketplace(name, slug);
    res.status(201).json({ marketplace });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteMarketplace(req, res) {
  try {
    await db.deleteMarketplace(req.params.id);
    res.json({ message: 'Marketplace deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { 
    getMarketplaces, 
    getMarketplace, 
    createMarketplace, 
    deleteMarketplace 
};