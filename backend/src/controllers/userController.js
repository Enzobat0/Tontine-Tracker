const { db, createId } = require('../db');

async function listUsers(req, res, next) {
  await db.read();
  res.json(db.data.users);
}

async function createUser(req, res, next) {
  try {
    const { name, email } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });

    await db.read();
    const user = { id: createId(), name, email: email || null, createdAt: new Date().toISOString() };
    db.data.users.push(user);
    await db.write();

    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers, createUser };
