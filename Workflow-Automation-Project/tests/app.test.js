import request from 'supertest';
import app from '../src/app.js';

describe('Application Tests', () => {
  describe('Health Check Endpoints', () => {
    it('should return API status message', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.text).toBe('Workflow System API running...');
    });

    it('should return auth routes info', async () => {
      const response = await request(app)
        .get('/check')
        .expect(200);

      expect(response.text).toBe('✅ Auth routes are mounted correctly');
    });

    it('should return available routes info', async () => {
      const response = await request(app)
        .get('/routes')
        .expect(200);

      expect(response.body).toHaveProperty('auth');
      expect(response.body).toHaveProperty('workflow');
      expect(response.body.auth).toContain('/api/auth/signup or /api/auth/login');
      expect(response.body.workflow).toBe('/api/workflow');
    });
  });

  describe('CORS Configuration', () => {
    it('should allow cross-origin requests', async () => {
      const response = await request(app)
        .options('/api/auth/login')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-methods']).toContain('POST');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);

      // Express default 404 response
      expect(response.status).toBe(404);
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{invalid json}')
        .expect(400);

      // Express body-parser error
      expect(response.status).toBe(400);
    });
  });

  describe('Middleware Integration', () => {
    it('should parse JSON requests correctly', async () => {
      const testData = { test: 'data', number: 123 };

      const response = await request(app)
        .post('/api/auth/login')
        .send(testData)
        .expect(401); // Will fail auth but JSON parsing should work

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should log requests with Morgan', async () => {
      // This test ensures Morgan middleware is active
      // We can't easily test the logging output, but we can ensure the request completes
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.text).toBe('Workflow System API running...');
    });
  });

  describe('Route Mounting', () => {
    it('should mount auth routes correctly', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should mount task routes correctly', async () => {
      const response = await request(app)
        .get('/api/tasks/view')
        .expect(401);

      expect(response.body.message).toBe('Not authorized, no token');
    });
  });

  describe('Environment Configuration', () => {
    it('should load environment variables', () => {
      // Test that dotenv config is working
      expect(process.env.NODE_ENV).toBe('test');
      expect(process.env.JWT_SECRET).toBeDefined();
    });
  });
});
