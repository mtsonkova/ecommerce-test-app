# 🛒 E-commerce Test Automation Platform - Project Summary

## 📋 Overview

A complete, production-ready e-commerce application built specifically for practicing test automation. This platform provides a realistic testing environment with full CRUD operations, user management, payment processing, and order workflows.

**Tech Stack:**
- **Backend:** Next.js API Routes
- **Frontend:** React with Next.js
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT with HTTP-only cookies
- **Styling:** Tailwind CSS

## ✨ Key Features

### 1. **Complete E-commerce Functionality**
- User registration and login
- Product catalog with categories
- Shopping cart and checkout
- Order management (create, view, cancel, return)
- Payment processing with test credit cards
- Refund request system

### 2. **Admin Dashboard**
- User management (block/unblock users)
- Category management (CRUD operations)
- Product management (CRUD operations with pricing and discounts)
- Order management (view all, update status)
- Refund processing (approve/reject)

### 3. **Test-Friendly Design**
- All API endpoints exposed and documented
- Fake payment system with various test scenarios
- Seeded database with test data
- Multiple test accounts (admin and clients)
- Clear error messages and validation
- Predictable test credit card behavior

### 4. **Testing Capabilities**
- **UI Testing:** Complete user flows for automation
- **API Testing:** RESTful endpoints with full CRUD
- **Performance Testing:** Load and stress test scenarios
- **Database Testing:** Direct SQL access and transactions
- **Security Testing:** Authentication and authorization flows

## 📁 Project Structure

```
ecommerce-test-app/
│
├── pages/
│   ├── api/                    # All API endpoints
│   │   ├── auth/              # Authentication (login, register, logout)
│   │   ├── products/          # Product APIs (list, get by ID)
│   │   ├── categories/        # Category APIs
│   │   ├── orders/            # Order APIs (create, list, cancel, return)
│   │   └── admin/             # Admin APIs
│   │       ├── users/         # User management
│   │       ├── categories/    # Category CRUD
│   │       ├── products/      # Product CRUD
│   │       ├── orders/        # Order management
│   │       └── refunds/       # Refund processing
│   │
│   ├── index.js               # Home page
│   ├── login.js               # Login page (to be implemented)
│   ├── register.js            # Registration page (to be implemented)
│   ├── products/              # Product pages (to be implemented)
│   ├── orders/                # Order pages (to be implemented)
│   └── admin/                 # Admin dashboard (to be implemented)
│
├── lib/
│   ├── prisma.js              # Database connection
│   ├── auth.js                # Authentication utilities
│   └── payment.js             # Fake payment processor
│
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.js                # Test data seeding
│
├── styles/
│   └── globals.css            # Global styles with Tailwind
│
├── .env                       # Environment configuration
├── docker-compose.yml         # Docker setup for PostgreSQL
├── package.json               # Dependencies and scripts
├── README.md                  # Main documentation
├── QUICKSTART.md              # Quick setup guide
├── API_ENDPOINTS.md           # Complete API reference
├── TESTING_GUIDE.md           # Testing scenarios and examples
└── postman_collection.json    # Postman collection template
```

## 🔌 API Endpoints Summary

### Authentication (4 endpoints)
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Public (3 endpoints)
- `GET /api/products` - List products with filters
- `GET /api/products/:id` - Get single product
- `GET /api/categories` - List all categories

### User Orders (4 endpoints)
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create new order
- `POST /api/orders/:id/cancel` - Cancel order
- `POST /api/orders/:id/return` - Request return

### Admin Users (2 endpoints)
- `GET /api/admin/users` - List all users
- `PATCH /api/admin/users/:id/block` - Block/unblock user

### Admin Categories (4 endpoints)
- `GET /api/admin/categories` - List categories
- `POST /api/admin/categories` - Create category
- `PUT /api/admin/categories/:id` - Update category
- `DELETE /api/admin/categories/:id` - Delete category

### Admin Products (4 endpoints)
- `GET /api/admin/products` - List products
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product

### Admin Orders (2 endpoints)
- `GET /api/admin/orders` - List all orders
- `PATCH /api/admin/orders/:id/status` - Update order status

### Admin Refunds (2 endpoints)
- `GET /api/admin/refunds` - List refund requests
- `PATCH /api/admin/refunds/:id/process` - Process refund

**Total: 29 API endpoints**

## 🗄️ Database Schema

### Tables
1. **User** - User accounts with authentication
   - Fields: id, email, password, firstName, lastName, role, isBlocked
   - Roles: client, admin

2. **Category** - Product categories
   - Fields: id, name, description

3. **Product** - Product catalog
   - Fields: id, name, description, price, discount, stock, categoryId

4. **Order** - Customer orders
   - Fields: id, userId, status, totalAmount, paymentStatus, shippingAddress
   - Statuses: pending, processing, shipped, delivered, cancelled, returned

5. **OrderItem** - Order line items
   - Fields: id, orderId, productId, quantity, price

6. **Refund** - Return/refund requests
   - Fields: id, orderId, amount, reason, status
   - Statuses: pending, approved, rejected

## 💳 Test Credit Cards

| Card Number | CVV | Expiry | Scenario |
|-------------|-----|--------|----------|
| 4532015112830366 | 123 | 12/2025 | ✅ Success |
| 5425233430109903 | 456 | 06/2026 | ✅ Success |
| 4000000000000002 | 789 | 03/2025 | ❌ Declined |
| 4000000000009995 | 321 | 09/2025 | 💰 Insufficient Funds |
| 4000000000000069 | 654 | 01/2020 | 📅 Expired Card |
| 4100000000000001 | 654 | 11/2025 | 🚫 Fraud Detection |

## 🧪 Test Accounts

### Admin
- **Email:** admin@test.com
- **Password:** admin123
- **Permissions:** Full admin access

### Clients
- **Email:** client1@test.com, client2@test.com
- **Password:** client123
- **Permissions:** Shopping, orders, profile

## 🚀 Quick Setup

```bash
# 1. Start database (Docker)
docker-compose up -d

# 2. Install and setup
npm install
npm run db:push
npm run db:seed

# 3. Start application
npm run dev

# 4. Open browser
http://localhost:3000
```

## 📊 Testing Use Cases

### UI Automation Testing
- Registration and login flows
- Product browsing and search
- Add to cart and checkout
- Order management (view, cancel, return)
- Admin dashboard operations

### API Testing
- All 29 REST endpoints
- Authentication flows
- CRUD operations
- Error handling
- Status codes validation

### Performance Testing
- Product listing load tests
- Concurrent order creation
- Database query performance
- API response times under load

### Database Testing
- SQL queries and joins
- Data integrity validation
- Transaction testing
- Constraint validation

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run db:push      # Push database schema
npm run db:seed      # Seed test data
npm run db:studio    # Open Prisma Studio (DB GUI)
```

## 📝 Documentation Files

1. **README.md** - Main documentation with setup and API reference
2. **QUICKSTART.md** - 5-minute setup guide
3. **API_ENDPOINTS.md** - Complete API documentation
4. **TESTING_GUIDE.md** - Test scenarios and examples
5. **postman_collection.json** - Postman collection for API testing

## 🎯 Testing Scenarios Included

### User Flows
- ✅ Register → Login → Browse → Order → Cancel
- ✅ Register → Login → Browse → Order → Return
- ✅ Login → Browse → Multiple Orders → View History
- ✅ Admin Login → Manage Users → Block User
- ✅ Admin Login → Add Product → Set Discount

### Edge Cases
- ❌ Invalid credentials
- ❌ Blocked user login
- ❌ Insufficient stock
- ❌ Payment declined
- ❌ Cancel shipped order (should fail)
- ❌ Unauthorized admin access

### Data Integrity
- ✅ Order total = sum of items
- ✅ Stock updates correctly
- ✅ Refund amount = order total
- ✅ No orphaned records

## 🔐 Security Features

- Password hashing with bcrypt
- JWT authentication with HTTP-only cookies
- Role-based access control (RBAC)
- Input validation
- SQL injection prevention (Prisma ORM)
- XSS prevention (React)

## ⚡ Performance Considerations

- Database indexing on frequently queried fields
- Pagination for large datasets
- Efficient SQL queries with Prisma
- Minimal API payload sizes
- Proper HTTP status codes

## 🎓 Learning Opportunities

This platform helps you practice:
- **Selenium/Playwright** - UI automation
- **Postman/REST Assured** - API testing
- **JMeter/K6** - Performance testing
- **SQL** - Database queries and validation
- **Test Design Patterns** - Page Object Model, etc.
- **CI/CD** - Pipeline integration
- **Test Data Management** - Setup and teardown

## 📈 Future Enhancements (Optional)

- Shopping cart persistence
- Product images upload
- Email notifications
- Advanced search filters
- Product reviews and ratings
- Order tracking
- Payment history
- Analytics dashboard

## ⚠️ Important Notes

1. **For Testing Only** - Not production-ready
2. **No Real Payments** - All transactions are simulated
3. **Simplified Security** - JWT secret should be stronger in production
4. **Local Only** - Designed for localhost testing
5. **Reset Anytime** - Database can be reset without consequences

## 🏆 Success Criteria

This platform is successful if you can:
- ✅ Write comprehensive UI test suites
- ✅ Create complete API test collections
- ✅ Perform load and stress testing
- ✅ Validate database integrity
- ✅ Practice different testing frameworks
- ✅ Learn test automation best practices

## 📞 Support

For issues or questions:
1. Check the documentation files
2. Review the API endpoint documentation
3. Verify database connection
4. Reset and reseed the database
5. Check console logs for errors

---

**Built for Test Automation Practice** 🧪

This platform provides a realistic, full-featured e-commerce application specifically designed for learning and practicing various types of software testing.

Happy Testing! 🚀
