const { db, createId } = require('../db');

/**
 * Helper: find tontine by id
 */
async function findTontine(id) {
  await db.read();
  return db.data.tontines.find(t => t.id === id);
}

/**
 * List all tontines
 */
async function listTontines(req, res, next) {
  try {
    await db.read();
    const items = db.data.tontines.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      contributionAmount: t.contributionAmount,
      memberCount: t.members.length,
      createdAt: t.createdAt
    }));
    res.json(items);
  } catch (err) {
    next(err);
  }
}

/**
 * Get full tontine by id
 */
async function getTontine(req, res, next) {
  try {
    const { id } = req.params;
    const tontine = await findTontine(id);
    if (!tontine) return res.status(404).json({ error: 'Tontine not found' });
    res.json(tontine);
  } catch (err) {
    next(err);
  }
}

/**
 * Create a tontine
 * Protected: owner comes from req.user
 */
async function createTontine(req, res, next) {
  try {
    const { name, description, contributionAmount, rotationLength } = req.body;
    if (!name || !contributionAmount) return res.status(400).json({ error: 'name and contributionAmount required' });

    await db.read();
    const tontine = {
      id: createId(),
      name,
      description: description || null,
      ownerId: req.user && req.user.id ? req.user.id : null,
      contributionAmount: Number(contributionAmount),
      rotationLength: rotationLength || null,
      members: [],
      contributions: [],
      payouts: [],
      createdAt: new Date().toISOString(),
      currentRound: 1
    };

    db.data.tontines.push(tontine);
    await db.write();
    res.status(201).json(tontine);
  } catch (err) {
    next(err);
  }
}

/**
 * Add a member to a tontine
 * Only owner can add members
 */
async function addMember(req, res, next) {
  try {
    const { id } = req.params;
    const { name, contact } = req.body;
    if (!name) return res.status(400).json({ error: 'member name required' });

    await db.read();
    const tontine = db.data.tontines.find(t => t.id === id);
    if (!tontine) return res.status(404).json({ error: 'Tontine not found' });

    // check ownership
    if (tontine.ownerId !== req.user.id) return res.status(403).json({ error: 'Forbidden: only owner can add members' });

    const member = { id: createId(), name, contact: contact || null, createdAt: new Date().toISOString() };
    tontine.members.push(member);

    await db.write();
    res.status(201).json(member);
  } catch (err) {
    next(err);
  }
}

/**
 * Record a contribution
 * Body: { memberId, amount (optional, default to contributionAmount), date (optional) }
 */
async function recordContribution(req, res, next) {
  try {
    const { id } = req.params;
    const { memberId, amount, date } = req.body;

    if (!memberId) return res.status(400).json({ error: 'memberId required' });

    await db.read();
    const tontine = db.data.tontines.find(t => t.id === id);
    if (!tontine) return res.status(404).json({ error: 'Tontine not found' });

    if (tontine.ownerId !== req.user.id) return res.status(403).json({ error: 'Forbidden: only owner can record contributions' });

    const member = tontine.members.find(m => m.id === memberId);
    if (!member) return res.status(404).json({ error: 'Member not found in this tontine' });

    const contribution = {
      id: createId(),
      memberId,
      amount: amount ? Number(amount) : Number(tontine.contributionAmount),
      date: date || new Date().toISOString(),
      round: tontine.currentRound
    };

    tontine.contributions.push(contribution);
    await db.write();
    res.status(201).json(contribution);
  } catch (err) {
    next(err);
  }
}

/**
 * Record a payout for current round
 * Body: { memberId }
 * This will:
 *  - create a payout record with amount = contributionAmount * members.length (pooled amount)
 *  - increment currentRound
 */
async function recordPayout(req, res, next) {
  try {
    const { id } = req.params;
    const { memberId } = req.body;

    if (!memberId) return res.status(400).json({ error: 'memberId required' });

    await db.read();
    const tontine = db.data.tontines.find(t => t.id === id);
    if (!tontine) return res.status(404).json({ error: 'Tontine not found' });

    if (tontine.ownerId !== req.user.id) return res.status(403).json({ error: 'Forbidden: only owner can record payouts' });

    // verify member exists
    const member = tontine.members.find(m => m.id === memberId);
    if (!member) return res.status(404).json({ error: 'Member not found in this tontine' });

    const pooledAmount = Number(tontine.contributionAmount) * Math.max(1, tontine.members.length);

    const payout = {
      id: createId(),
      memberId,
      amount: pooledAmount,
      date: new Date().toISOString(),
      round: tontine.currentRound
    };

    tontine.payouts.push(payout);

    // Move to next round
    tontine.currentRound = (tontine.currentRound || 1) + 1;

    await db.write();
    res.status(201).json(payout);
  } catch (err) {
    next(err);
  }
}

/**
 * Get a ledger summary for a tontine
 * returns per-member totals, current round totals, payouts history, next payout (simple rotation-based)
 */
async function getLedger(req, res, next) {
  try {
    const { id } = req.params;
    await db.read();
    const tontine = db.data.tontines.find(t => t.id === id);
    if (!tontine) return res.status(404).json({ error: 'Tontine not found' });

    // compute per-member totals
    const members = tontine.members.map(m => {
      const totalContributed = tontine.contributions
        .filter(c => c.memberId === m.id)
        .reduce((sum, c) => sum + Number(c.amount), 0);

      const contributedThisRound = tontine.contributions
        .filter(c => c.memberId === m.id && c.round === tontine.currentRound)
        .reduce((sum, c) => sum + Number(c.amount), 0);

      return {
        id: m.id,
        name: m.name,
        contact: m.contact || null,
        totalContributed,
        contributedThisRound
      };
    });

    const totalCollectedThisRound = tontine.contributions
      .filter(c => c.round === tontine.currentRound)
      .reduce((sum, c) => sum + Number(c.amount), 0);

    const totalPot = tontine.contributions.reduce((sum, c) => sum + Number(c.amount), 0);

    // Simple next payout: pick according to rotation order and number of completed payouts
    const completedRounds = tontine.payouts.length;
    let nextPayoutMember = null;
    if (tontine.members.length > 0) {
      const idx = completedRounds % tontine.members.length;
      nextPayoutMember = tontine.members[idx];
    }

    res.json({
      id: tontine.id,
      name: tontine.name,
      contributionAmount: tontine.contributionAmount,
      currentRound: tontine.currentRound,
      members,
      totalCollectedThisRound,
      totalPot,
      payouts: tontine.payouts,
      nextPayoutMember
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listTontines,
  getTontine,
  createTontine,
  addMember,
  recordContribution,
  recordPayout,
  getLedger
};
