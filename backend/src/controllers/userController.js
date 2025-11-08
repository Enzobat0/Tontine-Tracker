const User = require('../models/Users.js');

async function listUsers(req, res, next) {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    next(err);
  }
}

async function createUser(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });

    const user = await User.create({
      name,
      email,
      password: password || 'changeme',
    });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers, createUser };
