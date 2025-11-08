const express = require('express');
const router = express.Router();
const tontineController = require('../controllers/tontineController');
const authMiddleware = require('../middleware/auth');

// Public: list tontines
router.get('/', tontineController.listTontines);
// Public: get a single tontine
router.get('/:id', tontineController.getTontine);

// Protected: create tontine (owner = req.user.id)
router.post('/', authMiddleware, tontineController.createTontine);

// Protected: add member
router.post('/:id/members', authMiddleware, tontineController.addMember);

// Protected: record a contribution
router.post('/:id/contributions', authMiddleware, tontineController.recordContribution);

// Protected: record a payout (mark a member as paid for current round and move to next round)
router.post('/:id/payouts', authMiddleware, tontineController.recordPayout);

// Protected: (optional) delete tontine or update - left out for now

module.exports = router;
