const { db, createId } = require('../db');

async function listTontines(req, res, next) {
  await db.read();
  res.json(db.data.tontines);
}

async function createTontine(req, res, next) {
  try {
    const { name, contributionAmount, rotationLength } = req.body;
    if (!name || !contributionAmount) return res.status(400).json({ error: 'name and contributionAmount required' });

    await db.read();
    const tontine = {
      id: createId(),
      name,
      contributionAmount,
      rotationLength: rotationLength || null,
      members: [],          // we will push member objects later
      rounds: [],           // record of contributions/payouts
      createdAt: new Date().toISOString()
    };
    db.data.tontines.push(tontine);
    await db.write();
    res.status(201).json(tontine);
  } catch (err) {
    next(err);
  }
}

module.exports = { listTontines, createTontine };
