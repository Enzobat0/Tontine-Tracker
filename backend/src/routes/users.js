const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /api/users
router.get('/', userController.listUsers);

// POST /api/users  (simple user creation for now)
router.post('/', userController.createUser);

module.exports = router;
