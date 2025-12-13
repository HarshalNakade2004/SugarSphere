import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config';
import { emailService } from '../services';

const connection = new IORedis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  username: config.redis.username,
  tls: config.redis.tls,
  maxRetriesPerRequest: null,
});

// Email Queue
export const emailQueue = new Queue('email', { connection });

interface EmailJobData {
  type: 'welcome' | 'order_confirmation' | 'low_stock';
  to: string;
  name?: string;
  orderId?: string;
  items?: Array<{ name: string; quantity: number; subtotal: number }>;
  totalAmount?: number;
  sweetName?: string;
  currentQuantity?: number;
}

// Email Worker
const emailWorker = new Worker<EmailJobData>(
  'email',
  async (job: Job<EmailJobData>) => {
    const { type, to, name, orderId, items, totalAmount, sweetName, currentQuantity } = job.data;
    
    console.log(`Processing email job: ${type} to ${to}`);
    
    switch (type) {
      case 'welcome':
        await emailService.sendWelcomeEmail(to, name || 'User');
        break;
        
      case 'order_confirmation':
        if (orderId && items && totalAmount !== undefined) {
          await emailService.sendOrderConfirmation(to, name || 'User', orderId, items, totalAmount);
        }
        break;
        
      case 'low_stock':
        if (sweetName && currentQuantity !== undefined) {
          await emailService.sendLowStockAlert(to, sweetName, currentQuantity);
        }
        break;
    }
    
    console.log(`Email sent successfully: ${type} to ${to}`);
  },
  {
    connection,
    concurrency: 5,
  }
);

emailWorker.on('failed', (job, err) => {
  console.error(`Email job ${job?.id} failed:`, err);
});

emailWorker.on('completed', (job) => {
  console.log(`Email job ${job.id} completed`);
});

// Helper functions to add jobs
export const queueWelcomeEmail = async (email: string, name: string): Promise<void> => {
  await emailQueue.add('welcome', { type: 'welcome', to: email, name }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  });
};

export const queueOrderConfirmationEmail = async (
  email: string,
  name: string,
  orderId: string,
  items: Array<{ name: string; quantity: number; subtotal: number }>,
  totalAmount: number
): Promise<void> => {
  await emailQueue.add('order_confirmation', {
    type: 'order_confirmation',
    to: email,
    name,
    orderId,
    items,
    totalAmount,
  }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  });
};

export const queueLowStockAlert = async (
  adminEmail: string,
  sweetName: string,
  currentQuantity: number
): Promise<void> => {
  await emailQueue.add('low_stock', {
    type: 'low_stock',
    to: adminEmail,
    sweetName,
    currentQuantity,
  }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  });
};

// Graceful shutdown
export const closeQueues = async (): Promise<void> => {
  await emailWorker.close();
  await emailQueue.close();
  await connection.quit();
};
