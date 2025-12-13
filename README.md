# SugarSphere - Sweet Shop Management System

A full-stack e-commerce platform for selling traditional Indian sweets with JWT authentication, Razorpay payments, real-time notifications, and comprehensive admin dashboard.

## 🍬 Features

### Customer Features

- **Browse & Search**: Explore sweets by category, price range, and search
- **User Authentication**: Secure JWT-based login with refresh tokens
- **Shopping Cart**: Add, remove, and manage items in cart
- **Secure Payments**: Integrated Razorpay payment gateway
- **Order Tracking**: Track order status in real-time
- **Notifications**: Real-time notifications via Socket.IO
- **Profile Management**: Update profile and change password

### Admin Features

- **Dashboard**: Overview of sales, orders, and user statistics
- **Products Management**: CRUD operations for sweets with image upload
- **Orders Management**: Update order status and track deliveries
- **Users Management**: View and manage user roles and status
- **Analytics**: Revenue reports and top-selling products

## 🛠️ Tech Stack

### Backend

- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (Access + Refresh tokens)
- **File Upload**: Cloudinary for media storage
- **Payments**: Razorpay integration
- **Real-time**: Socket.IO
- **Email**: Nodemailer with Gmail OAuth2
- **Job Queue**: BullMQ with Redis
- **Validation**: Zod

### Frontend

- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **UI Library**: Material UI (MUI)
- **State Management**: Zustand
- **Server State**: TanStack React Query
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios with interceptors
- **Routing**: React Router v6
- **Notifications**: react-hot-toast

## 📦 Project Structure

```
SweetSellingPlatform/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic services
│   │   ├── sockets/        # Socket.IO setup
│   │   ├── queues/         # BullMQ job queues
│   │   └── utils/          # Utility functions
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/            # API client and endpoints
│   │   ├── components/     # Reusable components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand stores
│   │   └── types/          # TypeScript types
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB
- Redis
- Razorpay account
- Cloudinary account
- Gmail OAuth2 credentials

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/SweetSellingPlatform.git
   cd SweetSellingPlatform
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your credentials
   npm run dev
   ```

3. **Frontend Setup**

   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your credentials
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

### Docker Deployment

1. **Copy environment file**

   ```bash
   cp .env.example .env
   # Edit .env with your production credentials
   ```

2. **Build and run**

   ```bash
   docker-compose up -d --build
   ```

3. **Access the application**
   - Web App: http://localhost
   - API: http://localhost:5000

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Sweets

- `GET /api/sweets` - Get all sweets (with filters)
- `GET /api/sweets/:id` - Get sweet by ID
- `POST /api/sweets` - Create sweet (Admin)
- `PUT /api/sweets/:id` - Update sweet (Admin)
- `DELETE /api/sweets/:id` - Delete sweet (Admin)

### Orders

- `GET /api/orders` - Get all orders (Admin)
- `GET /api/orders/my` - Get user's orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create order
- `POST /api/orders/:id/verify` - Verify payment
- `PATCH /api/orders/:id/status` - Update status (Admin)
- `POST /api/orders/:id/cancel` - Cancel order

### Users

- `GET /api/users` - Get all users (Admin)
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/password` - Change password
- `PATCH /api/users/:id/role` - Update user role (Admin)
- `PATCH /api/users/:id/status` - Toggle user status (Admin)

### Notifications

- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Analytics (Admin)

- `GET /api/analytics/stats` - Get dashboard stats
- `GET /api/analytics/revenue` - Get revenue data
- `GET /api/analytics/top-sweets` - Get top selling sweets
- `GET /api/analytics/recent-orders` - Get recent orders

## 🔐 Environment Variables

### Backend (.env)

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/sugarsphere
REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

GMAIL_CLIENT_ID=your-client-id
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token
GMAIL_USER=your-email@gmail.com

FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
