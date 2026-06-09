const jwt = require('jsonwebtoken');
const { genPassword, validPassword } = require('../lib/passwordUtils');
const db = require('../db');

async function register(req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email and password are required' });
  }

  try {
    const existingEmail = await db.getUserByEmail(email);
    if (existingEmail) return res.status(409).json({ error: 'Email already registered' });

    const existingUsername = await db.getUserByUsername(username);
    if (existingUsername) return res.status(409).json({ error: 'Username already taken' });

    const { hash, salt } = genPassword(password);
    const user = await db.createUser(username, email, hash, salt);

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const user = await db.getUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isValid = validPassword(password, user.hash, user.salt);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getMe(req, res) {
  try {
    const user = await db.getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { 
  register,
  login,
  getMe
};