import { User, IUser } from '../../models/User';
import bcrypt from 'bcryptjs';

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'password123',
      };

      const user = await User.create(userData);

      expect(user).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe('user'); // default role
      expect(user.isVerified).toBe(false); // default
      expect(user.isActive).toBe(true); // default
    });

    it('should hash password before saving', async () => {
      const plainPassword = 'password123';
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: plainPassword,
      });

      expect(user.passwordHash).not.toBe(plainPassword);
      const isMatch = await bcrypt.compare(plainPassword, user.passwordHash);
      expect(isMatch).toBe(true);
    });

    it('should fail without required fields', async () => {
      await expect(User.create({})).rejects.toThrow();
    });

    it('should fail with invalid email format', async () => {
      await expect(
        User.create({
          name: 'Test User',
          email: 'invalid-email',
          passwordHash: 'password123',
        })
      ).rejects.toThrow();
    });

    it('should fail with duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'duplicate@example.com',
        passwordHash: 'password123',
      };

      await User.create(userData);
      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should fail with name shorter than 2 characters', async () => {
      await expect(
        User.create({
          name: 'A',
          email: 'test@example.com',
          passwordHash: 'password123',
        })
      ).rejects.toThrow();
    });
  });

  describe('comparePassword Method', () => {
    it('should return true for correct password', async () => {
      const password = 'correctPassword123';
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: password,
      });

      const isMatch = await user.comparePassword(password);
      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'correctPassword123',
      });

      const isMatch = await user.comparePassword('wrongPassword');
      expect(isMatch).toBe(false);
    });
  });

  describe('User Roles', () => {
    it('should accept valid role values', async () => {
      const adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        passwordHash: 'password123',
        role: 'admin',
      });

      expect(adminUser.role).toBe('admin');
    });

    it('should reject invalid role values', async () => {
      await expect(
        User.create({
          name: 'Test User',
          email: 'test@example.com',
          passwordHash: 'password123',
          role: 'superadmin' as any,
        })
      ).rejects.toThrow();
    });
  });

  describe('JSON Transformation', () => {
    it('should exclude sensitive fields from JSON output', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'password123',
      });

      const userJSON = user.toJSON();
      expect(userJSON.passwordHash).toBeUndefined();
      expect(userJSON.refreshTokenHash).toBeUndefined();
      expect(userJSON.__v).toBeUndefined();
    });
  });
});
