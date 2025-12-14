import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

// Setup before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// Cleanup after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Disconnect after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Mock environment variables
process.env.JWT_ACCESS_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.NODE_ENV = 'test';
process.env.FRONTEND_URL = 'http://localhost:5173';

// Mock external services
jest.mock('../services/emailService', () => ({
  emailService: {
    sendVerificationEmail: jest.fn().mockResolvedValue(true),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
    sendOrderConfirmation: jest.fn().mockResolvedValue(true),
    sendOrderStatusUpdate: jest.fn().mockResolvedValue(true),
  },
}));

jest.mock('../services/cloudinaryService', () => ({
  cloudinaryService: {
    uploadImage: jest.fn().mockResolvedValue({
      url: 'https://res.cloudinary.com/test/image.jpg',
      publicId: 'test-public-id',
    }),
    deleteImage: jest.fn().mockResolvedValue(true),
  },
}));

jest.mock('../services/paymentService', () => ({
  paymentService: {
    createOrder: jest.fn().mockResolvedValue({
      id: 'order_test123',
      amount: 10000,
      currency: 'INR',
    }),
    verifyPayment: jest.fn().mockReturnValue(true),
  },
}));
