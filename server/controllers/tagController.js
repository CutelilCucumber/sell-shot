const db = require('../db');

async function getTags(req, res) {
  try {
    const tags = await db.getAllTags();
    res.json({ tags });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteTag(req, res) {
  try {
    await db.deleteTag(req.params.id);
    res.json({ message: 'Tag deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { 
    getTags, 
    deleteTag 
};