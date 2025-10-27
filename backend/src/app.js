const express = require('express');
const cors = require('cors');

const usersRouter = require('./routes/users');
const tontinesRouter = require('./routes/tontines');

const app = express();
const authRouter = require('./routes/auth');


app.use(cors());
app.use(express.json());

// health
app.get('/', (req, res) => res.json({ status: 'ok', app: 'TontineTracker Backend' }));

// API routers
app.use('/api/users', usersRouter);
app.use('/api/tontines', tontinesRouter);
app.use('/api/auth', authRouter);

// simple error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;
