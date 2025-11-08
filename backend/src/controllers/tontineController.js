const Tontine = require('../models/Tontines.js');

async function listTontines(req, res, next) {
  try {
    const tontines = await Tontine.find();
    const items = tontines.map(t => ({
      id: t._id,
      name: t.name,
      description: t.description,
      contributionAmount: t.contributionAmount,
      memberCount: t.members.length,
      createdAt: t.createdAt,
    }));
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function getTontine(req, res, next) {
  try {
    const tontine = await Tontine.findById(req.params.id);
    if (!tontine) return res.status(404).json({ error: 'Tontine not found' });
    res.json(tontine);
  } catch (err) {
    next(err);
  }
}

async function createTontine(req, res, next) {
  try {
    const { name, description, contributionAmount, rotationLength } = req.body;
    if (!name || !contributionAmount)
      return res.status(400).json({ error: 'name and contributionAmount required' });

    const tontine = await Tontine.create({
      name,
      description,
      ownerId: req.user?.id || null,
      contributionAmount,
      rotationLength,
    });

    res.status(201).json(tontine);
  } catch (err) {
    next(err);
  }
}

async function addMember(req, res, next) {
  try {
    const tontine = await Tontine.findById(req.params.id);
    if (!tontine) return res.status(404).json({ error: 'Tontine not found' });
    if (tontine.ownerId.toString() !== req.user.id)
      return res.status(403).json({ error: 'Forbidden: only owner can add members' });

    tontine.members.push({
      name: req.body.name,
      contact: req.body.contact || null,
    });
    await tontine.save();

    res.status(201).json(tontine.members[tontine.members.length - 1]);
  } catch (err) {
    next(err);
  }
}

async function recordContribution(req, res, next) {
  try {
    const { id } = req.params;
    const { memberId, amount, date } = req.body;

    const tontine = await Tontine.findById(id);
    if (!tontine) return res.status(404).json({ error: 'Tontine not found' });

    if (tontine.ownerId.toString() !== req.user.id)
      return res.status(403).json({ error: 'Forbidden' });

    const member = tontine.members.id(memberId);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    tontine.contributions.push({
      memberId,
      amount: amount || tontine.contributionAmount,
      date,
      round: tontine.currentRound,
    });
    await tontine.save();

    res.status(201).json(tontine.contributions[tontine.contributions.length - 1]);
  } catch (err) {
    next(err);
  }
}

async function recordPayout(req, res, next) {
  try {
    const { id } = req.params;
    const { memberId } = req.body;

    const tontine = await Tontine.findById(id);
    if (!tontine) return res.status(404).json({ error: 'Tontine not found' });

    const member = tontine.members.id(memberId);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    const pooledAmount = tontine.contributionAmount * tontine.members.length;

    tontine.payouts.push({
      memberId,
      amount: pooledAmount,
      round: tontine.currentRound,
    });
    tontine.currentRound += 1;

    await tontine.save();
    res.status(201).json(tontine.payouts[tontine.payouts.length - 1]);
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
};
