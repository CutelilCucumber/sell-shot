const db = require('../db');
const { uploadFile, deleteFile } = require('../utils/storage');

async function getImages(req, res) {
  try {
    const images = await db.getImagesByItem(req.params.itemId);
    res.json({ images });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function addImages(req, res) {
  const { itemId } = req.params;

  try {
    const item = await db.getItemById(itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (item.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorised' });
    }
    if (!req.files?.length) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const existing = await db.getImagesByItem(itemId);
    const images = [];

    for (const [i, file] of req.files.entries()) {
      const url = await uploadFile(file, req.user.id, itemId);
      const isPrimary = existing.length === 0 && i === 0;
      const image = await db.addImage(itemId, {
        url,
        fileName: file.originalname,
        isPrimary
      });
      images.push(image);
    }

    res.status(201).json({ images });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function setPrimary(req, res) {
  const { itemId, imageId } = req.params;

  try {
    const item = await db.getItemById(itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (item.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorised' });
    }

    const image = await db.setPrimaryImage(imageId, itemId);
    res.json({ image });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteImage(req, res) {
  const { itemId, imageId } = req.params;

  try {
    const item = await db.getItemById(itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (item.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorised' });
    }

    const images = await db.getImagesByItem(itemId);
    const target = images.find(img => img.id === imageId);
    if (!target) return res.status(404).json({ error: 'Image not found' });

    await deleteFile(target.url);
    await db.deleteImage(imageId);

    // if deleted image was primary, promote next image
    if (target.isPrimary) {
      const remaining = images.filter(img => img.id !== imageId);
      if (remaining.length > 0) {
        await db.setPrimaryImage(remaining[0].id, itemId);
      }
    }

    res.json({ message: 'Image deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function identifyImage(req, res) {
  const { imageUrl } = req.body;

  try {
    
    // placeholder for actual identification logic
    const identified = {
      title: 'Identified Item',
      description: 'This is a placeholder description for the identified item.',
      tags: ['example', 'identified']
    };

    res.json({ identified });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { 
    getImages, 
    addImages, 
    setPrimary, 
    deleteImage,
    identifyImage
};