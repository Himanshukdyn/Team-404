import generateToken from '../src/utils/generateToken.js';
import jwt from 'jsonwebtoken';

describe('Utility Functions', () => {
  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const userId = '507f1f77bcf86cd799439011';
      const role = 'admin';

      const token = generateToken(userId, role);

      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts separated by dots
    });

    it('should contain correct payload', () => {
      const userId = '507f1f77bcf86cd799439011';
      const role = 'manager';

      const token = generateToken(userId, role);

      // Decode token without verification for testing
      const decoded = jwt.decode(token);

      expect(decoded.id).toBe(userId);
      expect(decoded.role).toBe(role);
      expect(decoded).toHaveProperty('iat'); // issued at
      expect(decoded).toHaveProperty('exp'); // expiration
    });

    it('should set correct expiration time', () => {
      const userId = '507f1f77bcf86cd799439011';
      const role = 'employee';

      const token = generateToken(userId, role);
      const decoded = jwt.decode(token);

      // Should expire in 1 day (24 hours)
      const expectedExp = decoded.iat + (24 * 60 * 60); // 1 day in seconds
      expect(decoded.exp).toBe(expectedExp);
    });

    it('should use JWT_SECRET from environment', () => {
      const userId = '507f1f77bcf86cd799439011';
      const role = 'admin';

      const token = generateToken(userId, role);

      // Should be able to verify with the test secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      expect(decoded.id).toBe(userId);
      expect(decoded.role).toBe(role);
    });

    it('should handle different user IDs and roles', () => {
      const testCases = [
        { id: '507f1f77bcf86cd799439011', role: 'admin' },
        { id: '507f1f77bcf86cd799439012', role: 'manager' },
        { id: '507f1f77bcf86cd799439013', role: 'employee' }
      ];

      testCases.forEach(({ id, role }) => {
        const token = generateToken(id, role);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        expect(decoded.id).toBe(id);
        expect(decoded.role).toBe(role);
      });
    });
  });
});
