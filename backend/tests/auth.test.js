const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
let mongoServer;
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/Users.js'); 

describe('Auth API (MongoDB)', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongoServer.getUri();
    await connectDB();
});


  beforeEach(async () => {
    
    await User.deleteMany({});
  });

  afterAll(async () => {
    await disconnectDB();
    await mongoServer.stop();
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
    expect(userInDb).toBeTruthy();
  });

  it('should reject registration with missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: '', email: '', password: '' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
