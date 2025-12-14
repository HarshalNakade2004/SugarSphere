import { authService } from '../../services/authService';
import { User } from '../../models/User';
import jwt from 'jsonwebtoken';

describe('AuthService', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123';
      const hash = await authService.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should produce different hashes for same password', async () => {
      const password = 'testPassword123';
      const hash1 = await authService.hashPassword(password);
      const hash2 = await authService.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'testPassword123';
      const hash = await authService.hashPassword(password);
      const isMatch = await authService.comparePassword(password, hash);

      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'testPassword123';
      const hash = await authService.hashPassword(password);
      const isMatch = await authService.comparePassword('wrongPassword', hash);

      expect(isMatch).toBe(false);
    });
  });

  describe('generateTokens', () => {
    let testUser: any;

    beforeEach(async () => {
      testUser = await User.create({
        name: 'Token User',
        email: 'token@example.com',
        passwordHash: 'password123',
        role: 'customer',
        isActive: true,
      });
    });

    it('should generate access and refresh tokens', () => {
      const tokens = authService.generateTokens(testUser);

      expect(tokens).toBeDefined();
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
    });

    it('should generate valid JWT tokens', () => {
      const tokens = authService.generateTokens(testUser);

      const decodedAccess = jwt.verify(
        tokens.accessToken,
        process.env.JWT_SECRET || 'test-secret'
      ) as any;

      expect(decodedAccess.userId).toBe(testUser._id.toString());
      expect(decodedAccess.role).toBe('customer');
    });

    it('should include correct user info in token', () => {
      const adminUser = {
        _id: 'test-id',
        role: 'admin',
      };

      const tokens = authService.generateTokens(adminUser as any);
      const decoded = jwt.verify(
        tokens.accessToken,
        process.env.JWT_SECRET || 'test-secret'
      ) as any;

      expect(decoded.role).toBe('admin');
    });
  });

  describe('verifyAccessToken', () => {
    let testUser: any;
    let tokens: any;

    beforeEach(async () => {
      testUser = await User.create({
        name: 'Verify User',
        email: 'verify@example.com',
        passwordHash: 'password123',
        role: 'customer',
        isActive: true,
      });
      tokens = authService.generateTokens(testUser);
    });

    it('should verify a valid access token', () => {
      const decoded = authService.verifyAccessToken(tokens.accessToken);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(testUser._id.toString());
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        authService.verifyAccessToken('invalid-token');
      }).toThrow();
    });

    it('should throw error for expired token', () => {
      const expiredToken = jwt.sign(
        { userId: testUser._id, role: 'customer' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '-1h' }
      );

      expect(() => {
        authService.verifyAccessToken(expiredToken);
      }).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    let testUser: any;
    let tokens: any;

    beforeEach(async () => {
      testUser = await User.create({
        name: 'Refresh User',
        email: 'refreshverify@example.com',
        passwordHash: 'password123',
        isActive: true,
      });
      tokens = authService.generateTokens(testUser);
    });

    it('should verify a valid refresh token', () => {
      const decoded = authService.verifyRefreshToken(tokens.refreshToken);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(testUser._id.toString());
    });

    it('should throw error for invalid refresh token', () => {
      expect(() => {
        authService.verifyRefreshToken('invalid-refresh-token');
      }).toThrow();
    });
  });

  describe('User registration flow', () => {
    it('should create user with hashed password', async () => {
      const password = 'securePassword123';
      const hash = await authService.hashPassword(password);

      const user = await User.create({
        name: 'New User',
        email: 'newuser@example.com',
        passwordHash: hash,
        isActive: true,
      });

      expect(user).toBeDefined();
      expect(user.passwordHash).not.toBe(password);
      
      const isMatch = await authService.comparePassword(
        password,
        user.passwordHash
      );
      expect(isMatch).toBe(true);
    });
  });

  describe('User authentication flow', () => {
    let user: any;
    const password = 'testPassword123';

    beforeEach(async () => {
      const hash = await authService.hashPassword(password);
      user = await User.create({
        name: 'Auth Flow User',
        email: 'authflow@example.com',
        passwordHash: hash,
        role: 'customer',
        isActive: true,
        isVerified: true,
      });
    });

    it('should authenticate user with correct credentials', async () => {
      const foundUser = await User.findOne({ email: 'authflow@example.com' });
      expect(foundUser).toBeDefined();

      const isValid = await authService.comparePassword(
        password,
        foundUser!.passwordHash
      );
      expect(isValid).toBe(true);

      const tokens = authService.generateTokens(foundUser!);
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
    });

    it('should reject authentication with wrong credentials', async () => {
      const foundUser = await User.findOne({ email: 'authflow@example.com' });
      const isValid = await authService.comparePassword(
        'wrongPassword',
        foundUser!.passwordHash
      );

      expect(isValid).toBe(false);
    });
  });
});
