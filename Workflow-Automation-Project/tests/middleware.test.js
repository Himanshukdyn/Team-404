import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/userModel.js';

describe('Middleware Tests', () => {
  let adminToken, managerToken, employeeToken;
  let adminUser, managerUser, employeeUser;

  beforeEach(async () => {
    // Create test users
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'admin123',
      role: 'admin'
    });

    managerUser = await User.create({
      name: 'Manager User',
      email: 'manager@test.com',
      password: 'manager123',
      role: 'manager'
    });

    employeeUser = await User.create({
      name: 'Employee User',
      email: 'employee@test.com',
      password: 'employee123',
      role: 'employee'
    });

    // Get tokens
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'admin123' });

    const managerLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@test.com', password: 'manager123' });

    const employeeLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'employee@test.com', password: 'employee123' });

    adminToken = adminLogin.body.token;
    managerToken = managerLogin.body.token;
    employeeToken = employeeLogin.body.token;
  });

  describe('Authentication Middleware (protect)', () => {
    it('should allow access with valid token', async () => {
      const response = await request(app)
        .get('/api/tasks/view')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 401 without authorization header', async () => {
      const response = await request(app)
        .get('/api/tasks/view')
        .expect(401);

      expect(response.body.message).toBe('Not authorized, no token');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/tasks/view')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.message).toBe('Not authorized, token failed');
    });

    it('should return 401 with malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/tasks/view')
        .set('Authorization', 'InvalidFormat')
        .expect(401);

      expect(response.body.message).toBe('Not authorized, no token');
    });
  });

  describe('Authorization Middleware (authorizeRoles)', () => {
    it('should allow admin to access admin-only endpoint', async () => {
      const response = await request(app)
        .get('/api/tasks/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should deny manager access to admin-only endpoint', async () => {
      const response = await request(app)
        .get('/api/tasks/all')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(403);

      expect(response.body.message).toBe('Access denied: insufficient permissions');
    });

    it('should deny employee access to admin-only endpoint', async () => {
      const response = await request(app)
        .get('/api/tasks/all')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(403);

      expect(response.body.message).toBe('Access denied: insufficient permissions');
    });

    it('should allow admin and manager to access manager-level endpoint', async () => {
      // Test admin access
      const adminResponse = await request(app)
        .get('/api/tasks/summary')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(adminResponse.body.success).toBe(true);

      // Test manager access
      const managerResponse = await request(app)
        .get('/api/tasks/summary')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(managerResponse.body.success).toBe(true);
    });

    it('should deny employee access to manager-level endpoint', async () => {
      const response = await request(app)
        .get('/api/tasks/summary')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(403);

      expect(response.body.message).toBe('Access denied: insufficient permissions');
    });

    it('should allow all authenticated users to access employee-level endpoint', async () => {
      // Test admin access
      const adminResponse = await request(app)
        .get('/api/tasks/view')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(adminResponse.body.success).toBe(true);

      // Test manager access
      const managerResponse = await request(app)
        .get('/api/tasks/view')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(managerResponse.body.success).toBe(true);

      // Test employee access
      const employeeResponse = await request(app)
        .get('/api/tasks/view')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(200);

      expect(employeeResponse.body.success).toBe(true);
    });
  });

  describe('Combined Middleware (protect + authorizeRoles)', () => {
    it('should handle authentication and authorization together', async () => {
      // Valid admin request
      const validResponse = await request(app)
        .get('/api/tasks/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(validResponse.body.success).toBe(true);

      // Invalid role request
      const invalidRoleResponse = await request(app)
        .get('/api/tasks/all')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(403);

      expect(invalidRoleResponse.body.message).toContain('insufficient permissions');

      // No auth request
      const noAuthResponse = await request(app)
        .get('/api/tasks/all')
        .expect(401);

      expect(noAuthResponse.body.message).toBe('Not authorized, no token');
    });
  });
});
