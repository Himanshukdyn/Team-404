import User from '../src/models/userModel.js';
import Task from '../src/models/taskModel.js';

describe('Model Tests', () => {
  describe('User Model', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'employee'
      };

      const user = new User(userData);
      await user.save();

      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe(userData.role);
      expect(user).toHaveProperty('_id');
      expect(user).toHaveProperty('createdAt');
      expect(user).toHaveProperty('updatedAt');
    });

    it('should hash password before saving', async () => {
      const userData = {
        name: 'Test User',
        email: 'hash@example.com',
        password: 'password123',
        role: 'employee'
      };

      const user = new User(userData);
      await user.save();

      // Password should be hashed, not plain text
      expect(user.password).not.toBe(userData.password);
      expect(user.password).toHaveLength(60); // bcrypt hash length
    });

    it('should validate required fields', async () => {
      const user = new User({});

      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.name).toBe('ValidationError');
    });

    it('should enforce unique email', async () => {
      const userData1 = {
        name: 'User 1',
        email: 'unique@example.com',
        password: 'password123',
        role: 'employee'
      };

      const userData2 = {
        name: 'User 2',
        email: 'unique@example.com',
        password: 'password456',
        role: 'manager'
      };

      await new User(userData1).save();

      let error;
      try {
        await new User(userData2).save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // MongoDB duplicate key error
    });

    it('should validate role enum values', async () => {
      const userData = {
        name: 'Test User',
        email: 'role@example.com',
        password: 'password123',
        role: 'invalid-role'
      };

      const user = new User(userData);

      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.name).toBe('ValidationError');
    });

    it('should match password correctly', async () => {
      const userData = {
        name: 'Test User',
        email: 'match@example.com',
        password: 'password123',
        role: 'employee'
      };

      const user = new User(userData);
      await user.save();

      const isMatch = await user.matchPassword('password123');
      const isNotMatch = await user.matchPassword('wrongpassword');

      expect(isMatch).toBe(true);
      expect(isNotMatch).toBe(false);
    });

    it('should default role to employee', async () => {
      const userData = {
        name: 'Test User',
        email: 'default@example.com',
        password: 'password123'
        // No role specified
      };

      const user = new User(userData);
      await user.save();

      expect(user.role).toBe('employee');
    });
  });

  describe('Task Model', () => {
    let testUser;

    beforeAll(async () => {
      testUser = await User.create({
        name: 'Task Creator',
        email: 'creator@example.com',
        password: 'password123',
        role: 'admin'
      });
    });

    it('should create a task with valid data', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'This is a test task',
        createdBy: testUser._id,
        assignedTo: testUser._id,
        metadata: { priority: 'high', deadline: '2024-12-31' }
      };

      const task = new Task(taskData);
      await task.save();

      expect(task.title).toBe(taskData.title);
      expect(task.description).toBe(taskData.description);
      expect(task.state).toBe('Pending'); // Default state
      expect(task.createdBy.toString()).toBe(testUser._id.toString());
      expect(task.assignedTo.toString()).toBe(testUser._id.toString());
      expect(task.metadata.priority).toBe('high');
      expect(task).toHaveProperty('_id');
      expect(task).toHaveProperty('createdAt');
      expect(task).toHaveProperty('updatedAt');
    });

    it('should validate required fields', async () => {
      const task = new Task({});

      let error;
      try {
        await task.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.name).toBe('ValidationError');
      expect(error.errors.title).toBeDefined();
    });

    it('should validate state enum values', async () => {
      const taskData = {
        title: 'Test Task',
        createdBy: testUser._id,
        state: 'Invalid State'
      };

      const task = new Task(taskData);

      let error;
      try {
        await task.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.name).toBe('ValidationError');
    });

    it('should accept valid state values', async () => {
      const validStates = ['Pending', 'Approved', 'Rejected', 'In Progress', 'Completed', 'Cancelled'];

      for (const state of validStates) {
        const taskData = {
          title: `Task with state ${state}`,
          createdBy: testUser._id,
          state: state
        };

        const task = new Task(taskData);
        await task.save();

        expect(task.state).toBe(state);
      }
    });

    it('should handle transitions array', async () => {
      const taskData = {
        title: 'Task with Transitions',
        createdBy: testUser._id,
        assignedTo: testUser._id,
        transitions: [
          {
            from: 'Pending',
            to: 'In Progress',
            by: testUser._id,
            byRole: 'admin',
            comment: 'Starting work',
            snapshot: { previousState: 'Pending' }
          }
        ]
      };

      const task = new Task(taskData);
      await task.save();

      expect(task.transitions).toHaveLength(1);
      expect(task.transitions[0].from).toBe('Pending');
      expect(task.transitions[0].to).toBe('In Progress');
      expect(task.transitions[0].by.toString()).toBe(testUser._id.toString());
      expect(task.transitions[0].byRole).toBe('admin');
      expect(task.transitions[0].comment).toBe('Starting work');
      expect(task.transitions[0]).toHaveProperty('at');
    });

    it('should handle notifications array', async () => {
      const taskData = {
        title: 'Task with Notifications',
        createdBy: testUser._id,
        notifications: [
          {
            type: 'assignment',
            message: 'Task assigned to you',
            sent: false
          }
        ]
      };

      const task = new Task(taskData);
      await task.save();

      expect(task.notifications).toHaveLength(1);
      expect(task.notifications[0].type).toBe('assignment');
      expect(task.notifications[0].message).toBe('Task assigned to you');
      expect(task.notifications[0].sent).toBe(false);
      expect(task.notifications[0]).toHaveProperty('createdAt');
    });

    it('should handle mixed data types in metadata', async () => {
      const taskData = {
        title: 'Task with Mixed Metadata',
        createdBy: testUser._id,
        metadata: {
          priority: 'high',
          estimatedHours: 8,
          tags: ['urgent', 'backend'],
          completed: false,
          dueDate: new Date('2024-12-31')
        }
      };

      const task = new Task(taskData);
      await task.save();

      expect(task.metadata.priority).toBe('high');
      expect(task.metadata.estimatedHours).toBe(8);
      expect(task.metadata.tags).toEqual(['urgent', 'backend']);
      expect(task.metadata.completed).toBe(false);
      expect(task.metadata.dueDate).toBeInstanceOf(Date);
    });
  });
});
