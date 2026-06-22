import request from 'supertest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/config/prisma';

/**
 * Integration test for the auth flow. Requires a reachable Postgres test
 * database. It is skipped automatically unless RUN_DB_TESTS=1 so the unit
 * suite stays green on machines/CI without a database.
 *
 *   RUN_DB_TESTS=1 DATABASE_URL=postgres://... npm test
 */
const describeDb = process.env.RUN_DB_TESTS === '1' ? describe : describe.skip;

describeDb('Auth flow (integration)', () => {
  const app = createApp();
  const email = `test_${Date.now()}@vutto.local`;
  let accessToken = '';

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it('registers a new user and returns an access token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email, password: 'Password@123' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.body.data.user.email).toBe(email);
    accessToken = res.body.data.accessToken;
  });

  it('rejects duplicate registration with 409', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email, password: 'Password@123' });
    expect(res.status).toBe(409);
  });

  it('rejects invalid credentials with 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ email, password: 'wrong-password' });
    expect(res.status).toBe(401);
  });

  it('returns the current user with a valid token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(email);
  });

  it('blocks /me without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
