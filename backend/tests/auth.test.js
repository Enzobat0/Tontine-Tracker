const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/Users.js'); 

describe('Auth API (MongoDB)', () => {
  beforeAll(async () => {
    // Connect to test database
    process.env.MONGO_URI = 'mongodb://localhost:27017/tontine_test';
    await connectDB();
  });

  beforeEach(async () => {
    // Clear users before each test
    await User.deleteMany({});
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'secret123',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('email', 'alice@example.com');
    expect(res.body).toHaveProperty('name', 'Alice');
    expect(res.body).not.toHaveProperty('password');

    const userInDb = await User.findOne({ email: 'alice@example.com' });
    expect(userInDb).toBeTruthy(); // ✅ confirms it’s saved
  });

  it('should reject registration with missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: '', email: '', password: '' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
