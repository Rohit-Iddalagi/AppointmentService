const request = require('supertest');
const app = require('../src/index');

describe('Health Endpoint', () => {
  it('should return 200 and status success', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.service).toBe('appointment-service');
  });

  it('should return 404 for unknown route', async () => {
    const res = await request(app).get('/api/v1/unknown');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('not found');
  });
});

describe('App Middleware', () => {
  it('should parse JSON body', async () => {
    const res = await request(app)
      .post('/api/v1/health')
      .send({ foo: 'bar' })
      .set('Accept', 'application/json');
    // Should still 404, but middleware should not error
    expect([200, 404]).toContain(res.statusCode);
  });

  it('should handle invalid JSON gracefully', async () => {
    const res = await request(app)
      .post('/api/v1/health')
      .set('Content-Type', 'application/json')
      .send('invalid-json');
    // Should return 400 or 500 depending on Express version
    expect([400, 500]).toContain(res.statusCode);
  });
});
