import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { Sweet } from '../../models/Sweet';
import { User } from '../../models/User';
import sweetsRoutes from '../../routes/sweets';
import { errorHandler, auth } from '../../middleware';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use('/api/sweets', sweetsRoutes);
app.use(errorHandler);

describe('Sweets Routes', () => {
  let adminUser: any;
  let adminToken: string;
  let testSweet: any;

  beforeEach(async () => {
    // Create admin user
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: 'password123',
      role: 'admin',
      isActive: true,
      isVerified: true,
    });

    adminToken = jwt.sign(
      { userId: adminUser._id, role: 'admin' },
      process.env.JWT_SECRET || 'test-secret'
    );

    // Create test sweet
    testSweet = await Sweet.create({
      name: 'Test Sweet',
      description: 'A delicious test sweet',
      price: 99.99,
      category: 'cakes',
      images: ['https://example.com/image.jpg'],
      stock: 50,
      isActive: true,
    });
  });

  describe('GET /api/sweets', () => {
    it('should get all active sweets', async () => {
      const res = await request(app).get('/api/sweets');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.sweets)).toBe(true);
      expect(res.body.data.sweets.length).toBeGreaterThan(0);
    });

    it('should filter sweets by category', async () => {
      await Sweet.create({
        name: 'Cookie Sweet',
        description: 'Test cookie',
        price: 49.99,
        category: 'cookies',
        images: ['https://example.com/cookie.jpg'],
        stock: 20,
        isActive: true,
      });

      const res = await request(app)
        .get('/api/sweets')
        .query({ category: 'cookies' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.sweets.forEach((sweet: any) => {
        expect(sweet.category).toBe('cookies');
      });
    });

    it('should search sweets by name', async () => {
      const res = await request(app)
        .get('/api/sweets')
        .query({ search: 'Test' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sweets.length).toBeGreaterThan(0);
    });

    it('should paginate results', async () => {
      // Create multiple sweets
      for (let i = 0; i < 15; i++) {
        await Sweet.create({
          name: `Sweet ${i}`,
          description: `Description ${i}`,
          price: 10 + i,
          category: 'candies',
          images: ['https://example.com/image.jpg'],
          stock: 10,
          isActive: true,
        });
      }

      const res = await request(app)
        .get('/api/sweets')
        .query({ page: 1, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.data.sweets.length).toBeLessThanOrEqual(10);
      expect(res.body.data.pagination).toBeDefined();
    });

    it('should not return inactive sweets for regular users', async () => {
      await Sweet.create({
        name: 'Inactive Sweet',
        description: 'This is inactive',
        price: 25.99,
        category: 'cakes',
        images: ['https://example.com/inactive.jpg'],
        stock: 10,
        isActive: false,
      });

      const res = await request(app).get('/api/sweets');

      expect(res.status).toBe(200);
      const inactiveSweet = res.body.data.sweets.find(
        (s: any) => s.name === 'Inactive Sweet'
      );
      expect(inactiveSweet).toBeUndefined();
    });
  });

  describe('GET /api/sweets/:id', () => {
    it('should get a sweet by id', async () => {
      const res = await request(app).get(`/api/sweets/${testSweet._id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(testSweet._id.toString());
      expect(res.body.data.name).toBe('Test Sweet');
    });

    it('should return 404 for non-existent sweet', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/sweets/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid id format', async () => {
      const res = await request(app).get('/api/sweets/invalid-id');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/sweets', () => {
    it('should create a new sweet as admin', async () => {
      const newSweet = {
        name: 'New Sweet',
        description: 'Brand new sweet',
        price: 75.00,
        category: 'chocolates',
        images: ['https://example.com/new.jpg'],
        stock: 100,
      };

      const res = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newSweet);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('New Sweet');
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/sweets')
        .send({
          name: 'Unauthorized Sweet',
          description: 'Should fail',
          price: 50.00,
          category: 'candies',
          images: ['https://example.com/unauth.jpg'],
          stock: 10,
        });

      expect(res.status).toBe(401);
    });

    it('should fail with invalid data', async () => {
      const res = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '',
          price: -10,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/sweets/:id', () => {
    it('should update a sweet as admin', async () => {
      const res = await request(app)
        .put(`/api/sweets/${testSweet._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Sweet',
          price: 149.99,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated Sweet');
      expect(res.body.data.price).toBe(149.99);
    });

    it('should return 404 for non-existent sweet', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/sweets/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/sweets/:id', () => {
    it('should delete a sweet as admin', async () => {
      const res = await request(app)
        .delete(`/api/sweets/${testSweet._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify deletion
      const deletedSweet = await Sweet.findById(testSweet._id);
      expect(deletedSweet).toBeNull();
    });

    it('should return 404 for non-existent sweet', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/sweets/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });
});
