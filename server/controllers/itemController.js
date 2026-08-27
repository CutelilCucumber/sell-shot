const db = require('../db');
const { identifyItem } = require('../utils/opencodeIdentify');

async function getItems(req, res) {
  try {
    const items = await db.getItemsByUser(req.user.id);
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getItem(req, res) {
  try {
    const item = await db.getItemById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (item.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorised' });
    }
    res.json({ item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createItem(req, res) {
  try {
    const item = await db.createItem(req.user.id, req.body);
    if (req.body.tags?.length) {
      await db.upsertItemTags(item.id, req.body.tags);
    }
    const full = await db.getItemById(item.id);
    res.status(201).json({ item: full });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateItem(req, res) {
  try {
    const existing = await db.getItemById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Item not found' });
    if (existing.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorised' });
    }

    await db.updateItem(req.params.id, req.body);
    if (req.body.tags) {
      await db.upsertItemTags(req.params.id, req.body.tags);
    }

    const item = await db.getItemById(req.params.id);
    res.json({ item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteItem(req, res) {
  try {
    const existing = await db.getItemById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Item not found' });
    if (existing.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorised' });
    }

    await db.deleteItem(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function identifyImage(req, res) {
  const { imageUrls } = req.body;

  try {
    const identified = await identifyItem(imageUrls);
    
    await db.updateItem(req.params.id, {
      title:          identified.title?.value || null,
      description:    identified.description?.value || null,
      brand:          identified.brand?.value || null,
      category:       identified.category?.value || null,
      color:          identified.color?.value || null,
      material:       identified.material?.value || null,
      condition:      identified.condition?.value || null,
      estimatedPrice: identified.estimatedPrice?.value || null,
      aiIdentified:   true,
      aiData:         identified,
    });
    await db.upsertItemTags(req.params.id, identified.tags?.value || []);
    

    const item = await db.getItemById(req.params.id);

    res.json({ item });
  } catch (err) {
    console.error('identify controller error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { 
    getItems, 
    getItem, 
    createItem, 
    updateItem, 
    deleteItem,
    identifyImage
};