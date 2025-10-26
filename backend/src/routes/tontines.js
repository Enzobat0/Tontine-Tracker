const express = require('express');
const router = express.Router();
const tontineController = require('../controllers/tontineController');

// basic endpoints for prototyping
router.get('/', tontineController.listTontines);
router.post('/', tontineController.createTontine);

module.exports = router;
