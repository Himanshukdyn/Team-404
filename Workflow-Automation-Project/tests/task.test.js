import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/userModel.js';
import Task from '../src/models/taskModel.js';

describe('Task Management Endpoints', () => {
  let adminToken, managerToken, employeeToken;
  let adminUser, managerUser, employeeUser;

  beforeEach(async () => {
    // Clean up database
    await User.deleteMany({});
    await Task.deleteMany({});

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

    // Get tokens by simulating login
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

  describe('POST /api/tasks/create', () => {
    it('should create a task successfully (admin)', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'This is a test task',
        assignedTo: employeeUser._id,
        metadata: { priority: 'high' }
      };

      const response = await request(app)
        .post('/api/tasks/create')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.task).toHaveProperty('_id');
      expect(response.body.task.title).toBe(taskData.title);
      expect(response.body.task.state).toBe('Pending');

      testTask = response.body.task; // Store for later tests
    });

    it('should create a task successfully (manager)', async () => {
      const taskData = {
        title: 'Manager Task',
        description: 'Task created by manager',
        assignedTo: employeeUser._id
      };

      const response = await request(app)
        .post('/api/tasks/create')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.task.title).toBe(taskData.title);
    });

    it('should return 403 for employee trying to create task', async () => {
      const taskData = {
        title: 'Employee Task',
        description: 'Should not be allowed',
        assignedTo: employeeUser._id
      };

      const response = await request(app)
        .post('/api/tasks/create')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(taskData)
        .expect(403);

      expect(response.body.message).toContain('insufficient permissions');
    });

    it('should return 401 without authentication', async () => {
      const taskData = {
        title: 'Unauthorized Task',
        assignedTo: employeeUser._id
      };

      const response = await request(app)
        .post('/api/tasks/create')
        .send(taskData)
        .expect(401);

      expect(response.body.message).toBe('Not authorized, no token');
    });
  });

  describe('GET /api/tasks/view', () => {
    it('should return tasks assigned to the user', async () => {
      const response = await request(app)
        .get('/api/tasks/view')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.tasks)).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/tasks/view')
        .expect(401);

      expect(response.body.message).toBe('Not authorized, no token');
    });
  });

  describe('PUT /api/tasks/:id/transition', () => {
    let transitionTask;

    beforeEach(async () => {
      // Create a task for transition tests
      const taskData = {
        title: 'Transition Task',
        description: 'Task for state transition',
        assignedTo: employeeUser._id
      };

      const createResponse = await request(app)
        .post('/api/tasks/create')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(taskData);

      transitionTask = createResponse.body.task;
    });

    it('should update task state successfully (admin)', async () => {
      const updateData = { state: 'In Progress' };

      const response = await request(app)
        .put(`/api/tasks/${transitionTask._id}/transition`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('✅ Task state updated');
      expect(response.body.task.state).toBe('In Progress');
    });

    it('should update task state successfully (manager)', async () => {
      const updateData = { state: 'Completed' };

      const response = await request(app)
        .put(`/api/tasks/${transitionTask._id}/transition`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.task.state).toBe('Completed');
    });

    it('should return 403 for employee trying to update task', async () => {
      const updateData = { state: 'Approved' };

      const response = await request(app)
        .put(`/api/tasks/${transitionTask._id}/transition`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.message).toContain('insufficient permissions');
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = { state: 'Completed' };

      const response = await request(app)
        .put(`/api/tasks/${fakeId}/transition`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.message).toBe('Task not found');
    });
  });

  describe('GET /api/tasks/all', () => {
    it('should return all tasks (admin only)', async () => {
      const response = await request(app)
        .get('/api/tasks/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.tasks)).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });

    it('should return 403 for manager trying to access all tasks', async () => {
      const response = await request(app)
        .get('/api/tasks/all')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(403);

      expect(response.body.message).toContain('insufficient permissions');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let taskToDelete;

    beforeEach(async () => {
      // Create a task to delete
      const taskData = {
        title: 'Task to Delete',
        description: 'This task will be deleted',
        assignedTo: employeeUser._id
      };

      const createResponse = await request(app)
        .post('/api/tasks/create')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(taskData);

      taskToDelete = createResponse.body.task;
    });

    it('should delete task successfully (admin only)', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${taskToDelete._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('🗑 Task deleted successfully');
    });

    it('should return 403 for manager trying to delete task', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${taskToDelete._id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(403);

      expect(response.body.message).toContain('insufficient permissions');
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.message).toBe('Task not found');
    });
  });

  describe('GET /api/tasks/summary', () => {
    it('should return task summary (admin)', async () => {
      const response = await request(app)
        .get('/api/tasks/summary')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.summary).toHaveProperty('total');
      expect(response.body.summary).toHaveProperty('pending');
      expect(response.body.summary).toHaveProperty('inProgress');
      expect(response.body.summary).toHaveProperty('completed');
      expect(response.body.summary).toHaveProperty('completionRate');
    });

    it('should return task summary (manager)', async () => {
      const response = await request(app)
        .get('/api/tasks/summary')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.summary).toHaveProperty('total');
    });

    it('should return 403 for employee trying to access summary', async () => {
      const response = await request(app)
        .get('/api/tasks/summary')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(403);

      expect(response.body.message).toContain('insufficient permissions');
    });
  });

  describe('GET /api/tasks/user-stats', () => {
    it('should return user task statistics (admin)', async () => {
      const response = await request(app)
        .get('/api/tasks/user-stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.stats)).toBe(true);
    });

    it('should return user task statistics (manager)', async () => {
      const response = await request(app)
        .get('/api/tasks/user-stats')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.stats)).toBe(true);
    });

    it('should return 403 for employee trying to access user stats', async () => {
      const response = await request(app)
        .get('/api/tasks/user-stats')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(403);

      expect(response.body.message).toContain('insufficient permissions');
    });
  });
});
