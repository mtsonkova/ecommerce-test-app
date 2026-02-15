# Testing Guide

This guide provides examples and scenarios for testing the e-commerce application.

## 🧪 Test Types

### 1. UI/E2E Testing

#### Recommended Tools
- Selenium WebDriver
- Playwright
- Cypress
- TestCafe

#### Test Scenarios

**User Registration**
```
Given I am on the registration page
When I enter valid details:
  - Email: newuser@test.com
  - Password: password123
  - First Name: New
  - Last Name: User
And I click Register
Then I should be redirected to the home page
And I should see "Hello, New"
```

**User Login**
```
Given I am on the login page
When I enter:
  - Email: client1@test.com
  - Password: client123
And I click Login
Then I should be logged in
And I should see my name in the navigation
```

**Product Search**
```
Given I am on the products page
When I search for "laptop"
Then I should see products containing "laptop"
And each product should display price and stock
```

**Place Order**
```
Given I am logged in as a client
And I am on the products page
When I click "Add to Cart" on a product
And I proceed to checkout
And I enter shipping address
And I enter payment details:
  - Card: 4532015112830366
  - CVV: 123
  - Expiry: 12/2025
And I submit the order
Then I should see order confirmation
And order status should be "pending"
```

**Cancel Order**
```
Given I have a pending order
When I navigate to "My Orders"
And I click "Cancel" on the order
Then order status should change to "cancelled"
And product stock should be restored
```

**Request Return**
```
Given I have a delivered order
When I navigate to "My Orders"
And I click "Return" on the order
And I enter return reason
Then order status should change to "returned"
And a refund request should be created with status "pending"
```

**Admin - Block User**
```
Given I am logged in as admin
When I navigate to Users page
And I click "Block" on a user
Then user should be blocked
When that user tries to login
Then login should fail with "Account is blocked" message
```

**Admin - Add Product**
```
Given I am logged in as admin
When I navigate to Products page
And I click "Add Product"
And I fill in:
  - Name: New Product
  - Price: 99.99
  - Stock: 50
  - Category: Electronics
And I submit
Then product should appear in the list
And should be visible on the public products page
```

**Admin - Set Discount**
```
Given I am logged in as admin
When I edit a product
And I set discount to 20%
And I save
Then the product's final price should be 20% less
And discount should be visible to customers
```

### 2. API Testing

#### Recommended Tools
- Postman
- REST Assured
- Axios (JavaScript)
- requests (Python)

#### Test Scenarios

**Authentication Flow**
```javascript
// 1. Register
POST /api/auth/register
Body: { email, password, firstName, lastName }
Assert: Status 201
Assert: Response contains user object and token

// 2. Login with same credentials
POST /api/auth/login
Body: { email, password }
Assert: Status 200
Assert: Response contains token
Store: token for subsequent requests

// 3. Get current user
GET /api/auth/me
Header: Cookie: auth-token={token}
Assert: Status 200
Assert: Response contains user details
```

**Product CRUD**
```javascript
// 1. List products
GET /api/products?page=1&limit=10
Assert: Status 200
Assert: Response contains products array
Assert: Response contains pagination object

// 2. Get single product
GET /api/products/{id}
Assert: Status 200
Assert: Product has finalPrice calculated correctly

// 3. Filter products
GET /api/products?categoryId={id}&minPrice=100&maxPrice=1000
Assert: Status 200
Assert: All products match filter criteria
```

**Order Creation and Management**
```javascript
// 1. Create order with valid card
POST /api/orders
Header: Cookie: auth-token={clientToken}
Body: { items, shippingAddress, paymentDetails }
Assert: Status 201
Assert: Order created with status "pending"
Assert: Payment status is "paid"
Assert: Product stock decreased

// 2. Create order with declined card
POST /api/orders
Body: { ..., paymentDetails: { cardNumber: "4000000000000002" } }
Assert: Status 400
Assert: Error contains "Payment failed"

// 3. Cancel order
POST /api/orders/{orderId}/cancel
Assert: Status 200
Assert: Order status changed to "cancelled"
Assert: Product stock restored

// 4. Request return
POST /api/orders/{orderId}/return
Body: { reason: "Defective product" }
Assert: Status 200
Assert: Order status changed to "returned"
Assert: Refund created with status "pending"
```

**Admin Operations**
```javascript
// 1. Block user
PATCH /api/admin/users/{userId}/block
Header: Cookie: auth-token={adminToken}
Body: { isBlocked: true }
Assert: Status 200
Assert: User is blocked

// 2. Verify blocked user cannot login
POST /api/auth/login
Body: { email: blockedUserEmail, password }
Assert: Status 403
Assert: Error contains "blocked"

// 3. Create category
POST /api/admin/categories
Body: { name: "New Category", description }
Assert: Status 201
Assert: Category created

// 4. Add product
POST /api/admin/products
Body: { name, price, stock, categoryId, discount }
Assert: Status 201
Assert: Product created with correct finalPrice

// 5. Process refund
PATCH /api/admin/refunds/{refundId}/process
Body: { status: "approved" }
Assert: Status 200
Assert: Refund status is "approved"
Assert: Order payment status is "refunded"
Assert: Product stock restored
```

### 3. Performance Testing

#### Recommended Tools
- JMeter
- K6
- Artillery
- Gatling

#### Test Scenarios

**Load Test - Product Listing**
```
Scenario: Concurrent users browsing products
Virtual Users: 100
Duration: 5 minutes
Ramp-up: 30 seconds

Request: GET /api/products?page=1&limit=20

Success Criteria:
- Response time p95 < 500ms
- Response time p99 < 1000ms
- Error rate < 1%
- Throughput > 50 req/sec
```

**Stress Test - Order Creation**
```
Scenario: Peak shopping period
Virtual Users: Start with 50, increase by 10 every minute
Duration: 10 minutes

Workflow:
1. Login (reuse token)
2. GET /api/products (random selection)
3. POST /api/orders (create order)

Success Criteria:
- No 500 errors
- Response time < 2s under load
- Database connections stable
- No deadlocks
```

**Spike Test**
```
Scenario: Flash sale
Normal Load: 20 VUs for 2 minutes
Spike: 200 VUs for 1 minute
Recovery: 20 VUs for 2 minutes

Monitor:
- Response times during spike
- Error rate during spike
- Recovery time to normal
```

### 4. Database Testing

#### Direct SQL Queries

**Data Integrity Tests**
```sql
-- Test: Order total matches sum of items
SELECT o.id, o.totalAmount, SUM(oi.price * oi.quantity) as calculated
FROM "Order" o
JOIN "OrderItem" oi ON o.id = oi."orderId"
GROUP BY o.id, o.totalAmount
HAVING o.totalAmount != SUM(oi.price * oi.quantity);
-- Should return 0 rows

-- Test: Product stock is never negative
SELECT * FROM "Product" WHERE stock < 0;
-- Should return 0 rows

-- Test: All orders have associated items
SELECT o.* FROM "Order" o
LEFT JOIN "OrderItem" oi ON o.id = oi."orderId"
WHERE oi.id IS NULL;
-- Should return 0 rows

-- Test: Refund amount matches order total
SELECT r.id, r.amount, o.totalAmount
FROM "Refund" r
JOIN "Order" o ON r."orderId" = o.id
WHERE r.amount != o.totalAmount;
-- Should return 0 rows
```

**Transaction Tests**
```sql
-- Test: Order cancellation restores stock
-- 1. Record product stock before order
-- 2. Create order (stock should decrease)
-- 3. Cancel order (stock should be restored)
-- 4. Verify stock matches original
```

**Performance Tests**
```sql
-- Test: Index usage on product search
EXPLAIN ANALYZE
SELECT * FROM "Product"
WHERE name ILIKE '%laptop%'
  AND price BETWEEN 100 AND 2000
  AND "categoryId" = 'category-uuid';

-- Should use indexes, execution time < 50ms

-- Test: Complex query performance
EXPLAIN ANALYZE
SELECT u.email, COUNT(o.id) as order_count, SUM(o.totalAmount) as total_spent
FROM "User" u
LEFT JOIN "Order" o ON u.id = o."userId"
WHERE u.role = 'client'
GROUP BY u.id, u.email
ORDER BY total_spent DESC
LIMIT 10;
```

## 🎯 Test Data Management

### Reset Database
```bash
npm run db:push -- --force-reset
npm run db:seed
```

### Create Custom Test Data
```javascript
// Use Prisma Client
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create test user
const user = await prisma.user.create({
  data: {
    email: 'testuser@example.com',
    password: hashedPassword,
    firstName: 'Test',
    lastName: 'User',
    role: 'client'
  }
});

// Create test product
const product = await prisma.product.create({
  data: {
    name: 'Test Product',
    price: 99.99,
    stock: 100,
    categoryId: categoryId
  }
});
```

## 📊 Test Metrics to Track

### Functional Tests
- Test pass rate
- Defect detection rate
- Code coverage
- Test execution time

### Performance Tests
- Response time (avg, p95, p99)
- Throughput (requests/second)
- Error rate
- Resource utilization (CPU, memory, DB connections)

### API Tests
- Endpoint coverage
- Status code validation
- Response schema validation
- Business logic validation

## 🚀 CI/CD Integration

### Example GitHub Actions Workflow
```yaml
name: E-commerce Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: testpass
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
    
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm run db:push
      - run: npm run db:seed
      - run: npm run test:api
      - run: npm run test:e2e
```

## 📝 Best Practices

1. **Test Isolation**: Each test should be independent
2. **Data Cleanup**: Reset or cleanup test data after each test
3. **Assertions**: Use meaningful assertions with clear error messages
4. **Naming**: Use descriptive test names
5. **Organization**: Group related tests together
6. **Reporting**: Generate detailed test reports
7. **Maintenance**: Keep tests updated with application changes

## 🔍 Debugging Tips

1. **Enable Prisma Logging**: Check database queries
2. **Use Browser DevTools**: Inspect network requests
3. **API Response Logging**: Log full responses for failed tests
4. **Screenshots**: Capture on test failure (UI tests)
5. **Database State**: Query database to verify state changes

---

Happy Testing! 🧪
