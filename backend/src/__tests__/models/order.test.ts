import { Order } from '../../models/Order';
import { User } from '../../models/User';
import { Sweet } from '../../models/Sweet';
import mongoose from 'mongoose';

describe('Order Model', () => {
  let testUser: any;
  let testSweet: any;

  beforeEach(async () => {
    testUser = await User.create({
      name: 'Test Customer',
      email: 'customer@example.com',
      passwordHash: 'password123',
    });

    testSweet = await Sweet.create({
      name: 'Test Sweet',
      category: 'Indian',
      description: 'Test description',
      price: 200,
      quantity: 100,
    });
  });

  describe('Order Creation', () => {
    it('should create an order with valid data', async () => {
      const orderData = {
        userId: testUser._id,
        items: [
          {
            sweetId: testSweet._id,
            name: testSweet.name,
            unitPrice: testSweet.price,
            quantity: 2,
            subtotal: testSweet.price * 2,
          },
        ],
        totalAmount: testSweet.price * 2,
        currency: 'INR',
        status: 'created',
      };

      const order = await Order.create(orderData);

      expect(order).toBeDefined();
      expect(order.userId.toString()).toBe(testUser._id.toString());
      expect(order.items.length).toBe(1);
      expect(order.totalAmount).toBe(400);
      expect(order.status).toBe('created');
    });

    it('should fail without required fields', async () => {
      await expect(Order.create({})).rejects.toThrow();
    });

    it('should fail without items', async () => {
      await expect(
        Order.create({
          userId: testUser._id,
          items: [],
          totalAmount: 0,
          currency: 'INR',
          status: 'created',
        })
      ).rejects.toThrow();
    });
  });

  describe('Order Status', () => {
    it('should accept valid status values', async () => {
      const validStatuses = ['created', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

      for (const status of validStatuses) {
        const order = await Order.create({
          userId: testUser._id,
          items: [
            {
              sweetId: testSweet._id,
              name: testSweet.name,
              unitPrice: testSweet.price,
              quantity: 1,
              subtotal: testSweet.price,
            },
          ],
          totalAmount: testSweet.price,
          currency: 'INR',
          status,
        });

        expect(order.status).toBe(status);
        await Order.deleteOne({ _id: order._id });
      }
    });

    it('should reject invalid status values', async () => {
      await expect(
        Order.create({
          userId: testUser._id,
          items: [
            {
              sweetId: testSweet._id,
              name: testSweet.name,
              unitPrice: testSweet.price,
              quantity: 1,
              subtotal: testSweet.price,
            },
          ],
          totalAmount: testSweet.price,
          currency: 'INR',
          status: 'invalid_status' as any,
        })
      ).rejects.toThrow();
    });
  });

  describe('Order with Payment', () => {
    it('should store Razorpay order and payment IDs', async () => {
      const order = await Order.create({
        userId: testUser._id,
        items: [
          {
            sweetId: testSweet._id,
            name: testSweet.name,
            unitPrice: testSweet.price,
            quantity: 1,
            subtotal: testSweet.price,
          },
        ],
        totalAmount: testSweet.price,
        currency: 'INR',
        status: 'paid',
        razorpayOrderId: 'order_test123456',
        razorpayPaymentId: 'pay_test789012',
      });

      expect(order.razorpayOrderId).toBe('order_test123456');
      expect(order.razorpayPaymentId).toBe('pay_test789012');
    });
  });

  describe('Order Population', () => {
    it('should populate user details', async () => {
      const order = await Order.create({
        userId: testUser._id,
        items: [
          {
            sweetId: testSweet._id,
            name: testSweet.name,
            unitPrice: testSweet.price,
            quantity: 1,
            subtotal: testSweet.price,
          },
        ],
        totalAmount: testSweet.price,
        currency: 'INR',
        status: 'created',
      });

      const populatedOrder = await Order.findById(order._id).populate('userId', 'name email');
      expect(populatedOrder?.userId).toBeDefined();
    });
  });

  describe('Order Queries', () => {
    beforeEach(async () => {
      await Order.create([
        {
          userId: testUser._id,
          items: [{ sweetId: testSweet._id, name: 'Sweet 1', unitPrice: 100, quantity: 1, subtotal: 100 }],
          totalAmount: 100,
          currency: 'INR',
          status: 'delivered',
        },
        {
          userId: testUser._id,
          items: [{ sweetId: testSweet._id, name: 'Sweet 2', unitPrice: 200, quantity: 1, subtotal: 200 }],
          totalAmount: 200,
          currency: 'INR',
          status: 'processing',
        },
        {
          userId: testUser._id,
          items: [{ sweetId: testSweet._id, name: 'Sweet 3', unitPrice: 150, quantity: 1, subtotal: 150 }],
          totalAmount: 150,
          currency: 'INR',
          status: 'cancelled',
        },
      ]);
    });

    it('should find orders by user', async () => {
      const userOrders = await Order.find({ userId: testUser._id });
      expect(userOrders.length).toBe(3);
    });

    it('should find orders by status', async () => {
      const deliveredOrders = await Order.find({ status: 'delivered' });
      expect(deliveredOrders.length).toBe(1);
    });

    it('should calculate total revenue from delivered orders', async () => {
      const deliveredOrders = await Order.find({ status: 'delivered' });
      const totalRevenue = deliveredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      expect(totalRevenue).toBe(100);
    });
  });
});
