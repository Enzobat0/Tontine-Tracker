const { db, createId } = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'temporary_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email, and password are required' });

    await db.read();
    const exists = db.data.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
    if (exists) return res.status(409).json({ error: 'A user with this email already exists' });

    const hashed = bcrypt.hashSync(password, 10);
    const user = {
      id: createId(),
      name,
      email: email.toLowerCase(),
      password: hashed,
      createdAt: new Date().toISOString()
    };

    db.data.users.push(user);
    await db.write();

    // return user without password
    const { password: _, ...safe } = user;
    res.status(201).json(safe);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

    await db.read();
    const user = db.data.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = bcrypt.compareSync(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const payload = { id: user.id, name: user.name, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // return token + user (without password)
    const { password: _, ...safe } = user;
    res.json({ token, user: safe });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    // auth middleware sets req.user
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    await db.read();
    const user = db.data.users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password: _, ...safe } = user;
    res.json(safe);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me };