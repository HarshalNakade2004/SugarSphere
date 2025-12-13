import nodemailer from 'nodemailer';
import { config } from '../config';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.gmail.user,
      pass: config.gmail.appPassword,
    },
  });
};

export const emailService = {
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const transporter = createTransporter();
      
      await transporter.sendMail({
        from: `SugarSphere <${config.gmail.user}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      
      console.log(`Email sent to ${options.to}`);
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  },

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b9d, #c44569); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #eee; }
          .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .btn { display: inline-block; background: #ff6b9d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍬 Welcome to SugarSphere!</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Welcome to SugarSphere - your one-stop destination for delicious sweets and treats!</p>
            <p>We're thrilled to have you join our sweet community. Here's what you can do:</p>
            <ul>
              <li>Browse our extensive collection of sweets</li>
              <li>Place orders and track them in real-time</li>
              <li>Get notified about special offers and new arrivals</li>
            </ul>
            <a href="${config.clientUrl}" class="btn">Start Shopping</a>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} SugarSphere. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: '🍬 Welcome to SugarSphere!',
      html,
    });
  },

  async sendOrderConfirmation(
    email: string,
    name: string,
    orderId: string,
    items: Array<{ name: string; quantity: number; subtotal: number }>,
    totalAmount: number
  ): Promise<void> {
    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.subtotal.toFixed(2)}</td>
        </tr>
      `
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b9d, #c44569); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #eee; }
          .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #f8f8f8; padding: 10px; text-align: left; }
          .total { font-size: 18px; font-weight: bold; color: #ff6b9d; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Order Confirmed!</h1>
          </div>
          <div class="content">
            <h2>Thank you, ${name}!</h2>
            <p>Your order has been confirmed and is being processed.</p>
            <p><strong>Order ID:</strong> ${orderId}</p>
            
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 15px; text-align: right;"><strong>Total:</strong></td>
                  <td style="padding: 15px; text-align: right;" class="total">₹${totalAmount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
            
            <p>You can track your order status in your dashboard.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} SugarSphere. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: `🎉 Order Confirmed - #${orderId}`,
      html,
    });
  },

  async sendLowStockAlert(
    adminEmail: string,
    sweetName: string,
    currentQuantity: number
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ff4757; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #eee; }
          .alert { background: #fff5f5; border-left: 4px solid #ff4757; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Low Stock Alert</h1>
          </div>
          <div class="content">
            <div class="alert">
              <h3>${sweetName}</h3>
              <p>Current stock: <strong>${currentQuantity} units</strong></p>
            </div>
            <p>Please restock this item soon to avoid stockouts.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: adminEmail,
      subject: `⚠️ Low Stock Alert: ${sweetName}`,
      html,
    });
  },

  async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
    const verificationUrl = `${config.clientUrl}/verify-email?token=${token}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b9d, #c44569); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #eee; }
          .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .btn { display: inline-block; background: #ff6b9d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✉️ Verify Your Email</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Thank you for registering with SugarSphere. Please verify your email address to get started.</p>
            <p>Click the button below to verify your email:</p>
            <a href="${verificationUrl}" class="btn">Verify Email</a>
            <p style="margin-top: 20px; color: #666; font-size: 14px;">
              Or copy and paste this link in your browser:<br>
              ${verificationUrl}
            </p>
            <p style="margin-top: 20px; color: #666; font-size: 12px;">
              This link will expire in 24 hours.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} SugarSphere. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: '✉️ Verify Your Email - SugarSphere',
      html,
    });
  },

  async sendOrderStatusUpdate(
    email: string,
    name: string,
    orderId: string,
    status: string,
    statusMessage: string
  ): Promise<void> {
    const statusColors: Record<string, string> = {
      paid: '#4caf50',
      processing: '#2196f3',
      shipped: '#ff9800',
      delivered: '#4caf50',
      cancelled: '#f44336',
    };

    const statusEmojis: Record<string, string> = {
      paid: '✅',
      processing: '⏳',
      shipped: '🚚',
      delivered: '🎉',
      cancelled: '❌',
    };

    const color = statusColors[status] || '#666';
    const emoji = statusEmojis[status] || '📦';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${color}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #eee; }
          .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .status-box { background: #f5f5f5; padding: 20px; border-left: 4px solid ${color}; margin: 20px 0; }
          .btn { display: inline-block; background: #ff6b9d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${emoji} Order Status Updated</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Your order status has been updated.</p>
            
            <div class="status-box">
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Status:</strong> ${status.toUpperCase()}</p>
              <p>${statusMessage}</p>
            </div>
            
            <a href="${config.clientUrl}/orders/${orderId}" class="btn">View Order Details</a>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} SugarSphere. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: `${emoji} Order Status Update - #${orderId}`,
      html,
    });
  },

  async sendInvoiceEmail(
    email: string,
    name: string,
    orderId: string,
    razorpayPaymentId: string,
    items: Array<{ name: string; quantity: number; unitPrice: number; subtotal: number }>,
    totalAmount: number,
    orderDate: Date
  ): Promise<void> {
    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${item.unitPrice.toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${item.subtotal.toFixed(2)}</td>
        </tr>
      `
      )
      .join('');

    const formattedDate = orderDate.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 650px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b9d, #c44569); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #eee; }
          .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #ff6b9d; color: white; padding: 12px; text-align: left; }
          .invoice-header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #ff6b9d; padding-bottom: 20px; }
          .invoice-details { margin: 20px 0; }
          .invoice-details p { margin: 5px 0; }
          .total-row { background: #f8f8f8; font-weight: bold; }
          .total-row td { padding: 15px 12px; }
          .grand-total { font-size: 20px; color: #ff6b9d; }
          .payment-info { background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; }
          .stamp { text-align: center; color: #4caf50; font-size: 24px; font-weight: bold; border: 3px solid #4caf50; padding: 10px 20px; display: inline-block; transform: rotate(-5deg); margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🧾 Invoice</h1>
            <p>Thank you for your purchase!</p>
          </div>
          <div class="content">
            <div class="invoice-details">
              <table style="margin: 0;">
                <tr>
                  <td style="padding: 5px 0; border: none;"><strong>Invoice To:</strong></td>
                  <td style="padding: 5px 0; border: none; text-align: right;"><strong>Invoice Details:</strong></td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; border: none;">${name}</td>
                  <td style="padding: 5px 0; border: none; text-align: right;">Order ID: ${orderId}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; border: none;">${email}</td>
                  <td style="padding: 5px 0; border: none; text-align: right;">Date: ${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; border: none;"></td>
                  <td style="padding: 5px 0; border: none; text-align: right;">Payment ID: ${razorpayPaymentId}</td>
                </tr>
              </table>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td colspan="3" style="text-align: right; padding: 15px 12px;"><strong>Grand Total:</strong></td>
                  <td style="text-align: right;" class="grand-total">₹${totalAmount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

            <div class="payment-info">
              <p style="margin: 0;"><strong>✅ Payment Received</strong></p>
              <p style="margin: 5px 0 0 0;">Payment successfully processed via Razorpay</p>
            </div>

            <div style="text-align: center;">
              <div class="stamp">PAID</div>
            </div>

            <p style="text-align: center; color: #666; margin-top: 20px;">
              This is a computer-generated invoice and does not require a signature.
            </p>
          </div>
          <div class="footer">
            <p><strong>SugarSphere</strong></p>
            <p>Your favorite destination for delicious sweets!</p>
            <p>© ${new Date().getFullYear()} SugarSphere. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: `🧾 Invoice for Order #${orderId} - SugarSphere`,
      html,
    });
  },

  async sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
    const resetUrl = `${config.clientUrl}/reset-password?token=${token}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b9d, #c44569); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #eee; }
          .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .btn { display: inline-block; background: #ff6b9d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .warning { background: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Reset Your Password</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>We received a request to reset your password for your SugarSphere account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="btn">Reset Password</a>
            </div>
            <p style="margin-top: 20px; color: #666; font-size: 14px;">
              Or copy and paste this link in your browser:<br>
              ${resetUrl}
            </p>
            <div class="warning">
              <p style="margin: 0;"><strong>⚠️ Important:</strong></p>
              <ul style="margin: 5px 0 0 0; padding-left: 20px;">
                <li>This link will expire in 24 hours</li>
                <li>This link can only be used once</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} SugarSphere. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: '🔐 Reset Your Password - SugarSphere',
      html,
    });
  },
};
