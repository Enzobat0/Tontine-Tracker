const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: String,
  createdAt: { type: Date, default: Date.now },
});

const contributionSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId },
  amount: Number,
  date: { type: Date, default: Date.now },
  round: Number,
});

const payoutSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId },
  amount: Number,
  date: { type: Date, default: Date.now },
  round: Number,
});

const tontineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  contributionAmount: { type: Number, required: true },
  rotationLength: Number,
  members: [memberSchema],
  contributions: [contributionSchema],
  payouts: [payoutSchema],
  currentRound: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Tontine', tontineSchema);
