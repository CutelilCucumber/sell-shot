const db = require('../db');

async function getUsers(req, res) {
  try {
    const users = await db.getAllUsers();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateRole(req, res) {
  const { role } = req.body;
  const validRoles = ['GUEST', 'MEMBER', 'ADMIN'];

  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const user = await db.updateUserRole(req.params.id, role);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteItem(req, res) {
  try {
    const item = await db.getItemById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    await db.deleteItem(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteListing(req, res) {
  try {
    const listing = await db.getListingById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    await db.deleteListing(req.params.id);
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { 
    getUsers, 
    updateRole, 
    deleteItem, 
    deleteListing 
};