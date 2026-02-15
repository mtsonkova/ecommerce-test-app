# E-commerce Test Automation Platform

A full-featured e-commerce application built with Next.js and PostgreSQL specifically designed for practicing test automation (UI, API, Performance, and Database testing).

## 🎯 Purpose

This application is built **exclusively for testing purposes** and includes:
- Complete e-commerce functionality
- Exposed REST API endpoints
- Fake payment system with test credit cards
- Admin dashboard
- User management
- Order management with cancellations and returns
- PostgreSQL database for direct SQL testing

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ running locally
- Git

### Installation

1. **Clone and setup:**
```bash
cd ecommerce-test-app
npm install
```

2. **Setup PostgreSQL:**

Create a PostgreSQL database:
```bash
createdb ecommerce_test
```

Or using psql:
```sql
CREATE DATABASE ecommerce_test;
CREATE USER testuser WITH PASSWORD 'testpass';
GRANT ALL PRIVILEGES ON DATABASE ecommerce_test TO testuser;
```

3. **Configure environment:**

Edit `.env` file if needed (default values should work):
```env
DATABASE_URL="postgresql://testuser:testpass@localhost:5432/ecommerce_test?schema=public"
JWT_SECRET="test-secret-key-change-in-production"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

4. **Initialize database:**
```bash
npm run db:push
npm run db:seed
```

5. **Start the application:**
```bash
npm run dev
```

Visit: http://localhost:3000

## 🧪 Test Accounts

### Admin Account
- **Email:** admin@test.com
- **Password:** admin123
- **Permissions:** Full access to admin dashboard

### Client Accounts
- **Email:** client1@test.com / client2@test.com
- **Password:** client123
- **Permissions:** Can shop, place orders, view order history

## 💳 Test Credit Cards

### Successful Payments
| Card Number | CVV | Expiry | Result |
|-------------|-----|--------|---------|
| 4532015112830366 | 123 | 12/2025 | ✅ Success |
| 5425233430109903 | 456 | 06/2026 | ✅ Success |
| 2221000000000009 | 789 | 09/2025 | ✅ Success |

### Failed Payments
| Card Number | CVV | Expiry | Result |
|-------------|-----|--------|---------|
| 4000000000000002 | 789 | 03/2025 | ❌ Card Declined |
| 4000000000009995 | 321 | 09/2025 | 💰 Insufficient Funds |
| 4000000000000069 | 654 | 01/2020 | 📅 Card Expired |
| 4100000000000001 | 654 | 11/2025 | 🚫 Fraud Detection |

## 📚 API Documentation

Base URL: `http://localhost:3000/api`

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "client"
  },
  "token": "jwt-token"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": { ... },
  "token": "jwt-token"
}
```

#### Logout
```http
POST /api/auth/logout
```

#### Get Current User
```http
GET /api/auth/me
Cookie: auth-token=<token>
```

### Product Endpoints

#### Get All Products
```http
GET /api/products?page=1&limit=20&categoryId=<uuid>&search=laptop&minPrice=100&maxPrice=1000
```

**Response (200):**
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Laptop Pro 15",
      "description": "High-performance laptop",
      "price": 1299.99,
      "discount": 10,
      "finalPrice": 1169.99,
      "stock": 50,
      "category": {
        "id": "uuid",
        "name": "Electronics"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### Get Single Product
```http
GET /api/products/:id
```

### Category Endpoints

#### Get All Categories
```http
GET /api/categories
```

**Response (200):**
```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "Electronics",
      "description": "Electronic devices",
      "_count": {
        "products": 25
      }
    }
  ]
}
```

### Order Endpoints (Requires Authentication)

#### Get User Orders
```http
GET /api/orders?page=1&limit=10&status=pending
Cookie: auth-token=<token>
```

**Response (200):**
```json
{
  "orders": [
    {
      "id": "uuid",
      "status": "pending",
      "totalAmount": 1299.99,
      "paymentStatus": "paid",
      "shippingAddress": "123 Main St",
      "orderItems": [
        {
          "id": "uuid",
          "quantity": 1,
          "price": 1299.99,
          "product": {
            "id": "uuid",
            "name": "Laptop Pro 15"
          }
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

#### Create Order
```http
POST /api/orders
Cookie: auth-token=<token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "uuid",
      "quantity": 2
    }
  ],
  "shippingAddress": "123 Main St, City, Country",
  "paymentDetails": {
    "cardNumber": "4532015112830366",
    "cvv": "123",
    "expiryMonth": "12",
    "expiryYear": "2025",
    "cardholderName": "John Doe",
    "cardType": "credit_card"
  }
}
```

**Response (201):**
```json
{
  "message": "Order created successfully",
  "order": { ... },
  "paymentResult": {
    "success": true,
    "message": "Payment successful",
    "transactionId": "TXN_..."
  }
}
```

#### Cancel Order
```http
POST /api/orders/:id/cancel
Cookie: auth-token=<token>
```

**Response (200):**
```json
{
  "message": "Order cancelled successfully",
  "order": { ... }
}
```

#### Request Return/Refund
```http
POST /api/orders/:id/return
Cookie: auth-token=<token>
Content-Type: application/json

{
  "reason": "Product defective"
}
```

**Response (200):**
```json
{
  "message": "Return request submitted successfully",
  "order": { ... },
  "refund": {
    "id": "uuid",
    "amount": 1299.99,
    "status": "pending",
    "reason": "Product defective"
  }
}
```

### Admin Endpoints (Requires Admin Role)

#### Get All Users
```http
GET /api/admin/users?page=1&limit=20&role=client&isBlocked=false&search=john
Cookie: auth-token=<admin-token>
```

#### Block/Unblock User
```http
PATCH /api/admin/users/:id/block
Cookie: auth-token=<admin-token>
Content-Type: application/json

{
  "isBlocked": true
}
```

#### Create Category
```http
POST /api/admin/categories
Cookie: auth-token=<admin-token>
Content-Type: application/json

{
  "name": "New Category",
  "description": "Category description"
}
```

#### Update Category
```http
PUT /api/admin/categories/:id
Cookie: auth-token=<admin-token>
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description"
}
```

#### Delete Category
```http
DELETE /api/admin/categories/:id
Cookie: auth-token=<admin-token>
```

#### Create Product
```http
POST /api/admin/products
Cookie: auth-token=<admin-token>
Content-Type: application/json

{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "stock": 100,
  "categoryId": "uuid",
  "discount": 10,
  "imageUrl": "https://example.com/image.jpg"
}
```

#### Update Product
```http
PUT /api/admin/products/:id
Cookie: auth-token=<admin-token>
Content-Type: application/json

{
  "price": 89.99,
  "stock": 150,
  "discount": 15
}
```

#### Delete Product
```http
DELETE /api/admin/products/:id
Cookie: auth-token=<admin-token>
```

#### Get All Orders (Admin)
```http
GET /api/admin/orders?page=1&limit=20&status=pending&userId=uuid
Cookie: auth-token=<admin-token>
```

#### Update Order Status
```http
PATCH /api/admin/orders/:id/status
Cookie: auth-token=<admin-token>
Content-Type: application/json

{
  "status": "processing"
}
```

Valid statuses: `pending`, `processing`, `shipped`, `delivered`, `cancelled`, `returned`

#### Get All Refunds
```http
GET /api/admin/refunds?page=1&limit=20&status=pending
Cookie: auth-token=<admin-token>
```

#### Process Refund
```http
PATCH /api/admin/refunds/:id/process
Cookie: auth-token=<admin-token>
Content-Type: application/json

{
  "status": "approved"
}
```

Valid statuses: `approved`, `rejected`

## 🗄️ Database Schema

### Tables
- **User** - User accounts with role-based access
- **Category** - Product categories
- **Product** - Product catalog with pricing and stock
- **Order** - Customer orders with status tracking
- **OrderItem** - Individual items in orders
- **Refund** - Return/refund requests

### Direct Database Access

```bash
# Connect to database
psql -U testuser -d ecommerce_test

# View Prisma Studio (GUI)
npm run db:studio
```

## 🧪 Testing Scenarios

### UI Testing
- Registration and login flows
- Product browsing and filtering
- Shopping cart functionality
- Checkout process
- Order management (view, cancel, return)
- Admin dashboard operations

### API Testing
- All endpoints listed above
- Authentication flows
- CRUD operations
- Error handling
- Status code validation
- Response payload verification

### Performance Testing
- Load testing product listings
- Concurrent order creation
- Database query performance
- API response times

### Database Testing
- Direct SQL queries
- Data integrity verification
- Transaction testing
- Constraint validation

## 📁 Project Structure

```
ecommerce-test-app/
├── pages/
│   ├── api/              # API endpoints
│   │   ├── auth/         # Authentication
│   │   ├── products/     # Product APIs
│   │   ├── orders/       # Order APIs
│   │   ├── categories/   # Category APIs
│   │   └── admin/        # Admin APIs
│   ├── index.js          # Home page
│   ├── login.js          # Login page
│   ├── register.js       # Registration page
│   ├── products/         # Product pages
│   ├── orders/           # Order pages
│   └── admin/            # Admin dashboard
├── lib/
│   ├── prisma.js         # Database client
│   ├── auth.js           # Authentication utilities
│   └── payment.js        # Fake payment processor
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.js           # Seed data
└── README.md             # This file
```

## 🔧 Useful Commands

```bash
# Development
npm run dev                # Start development server

# Database
npm run db:push            # Push schema changes
npm run db:seed            # Seed database
npm run db:studio          # Open Prisma Studio

# Build
npm run build              # Build for production
npm start                  # Start production server
```

## 🐛 Common Issues

### Permission Denied to Create Database
**Error:** `permission denied to create database`

**Quick Fix:** Create database manually in DBeaver
1. See detailed guide: **`FIX_PERMISSIONS.md`**
2. Or run the SQL script: **`setup-database.sql`**
3. Or follow visual guide: **`DBEAVER_GUIDE.md`**

**Fastest solution:**
```sql
-- In DBeaver SQL Editor:
CREATE DATABASE ecommerce_test;
GRANT ALL ON SCHEMA public TO your_username;
```
Then: `npm run db:push && npm run db:seed`

### Database Connection Error
- Ensure PostgreSQL is running
- Verify DATABASE_URL in `.env` has YOUR credentials
- Check database exists: See **`QUICK_FIX.md`**
- See **`TROUBLESHOOTING.md`** for detailed help

### Port Already in Use
- Change port: `PORT=3001 npm run dev`
- Kill process: `lsof -ti:3000 | xargs kill`

### Prisma Schema Sync
- Reset database: `npx prisma db push --force-reset`
- Regenerate client: `npx prisma generate`

### Need Help?
1. Check **`QUICK_FIX.md`** - Fast solutions
2. Check **`FIX_PERMISSIONS.md`** - Permission issues
3. Check **`DBEAVER_GUIDE.md`** - Step-by-step DBeaver setup
4. Check **`TROUBLESHOOTING.md`** - Complete troubleshooting

## 📝 Notes

- This is a **testing application only** - do not use in production
- All payment transactions are fake
- Database resets can be done anytime with seed script
- JWT tokens are for testing - not production-grade security
- CORS is enabled for API testing tools

## 🎓 Learning Resources

Use this application to practice:
- Selenium/Playwright UI automation
- Postman/REST Assured API testing
- JMeter/K6 performance testing
- SQL queries and database validation
- Test framework design (Page Object Model, etc.)
- CI/CD pipeline integration

## 📄 License

MIT - Free to use for educational and testing purposes.

---

**Happy Testing! 🧪**
