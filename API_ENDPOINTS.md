# API Endpoints Reference

Complete list of all exposed API endpoints for testing.

Base URL: `http://localhost:3000/api`

## Authentication Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login user |
| POST | `/auth/logout` | No | Logout user |
| GET | `/auth/me` | Yes | Get current user |

## Public Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/products` | No | Get all products with filters |
| GET | `/products/:id` | No | Get single product |
| GET | `/categories` | No | Get all categories |

## User Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/orders` | Yes (Client) | Get user's orders |
| POST | `/orders` | Yes (Client) | Create new order |
| POST | `/orders/:id/cancel` | Yes (Client) | Cancel pending order |
| POST | `/orders/:id/return` | Yes (Client) | Request return/refund |

## Admin Endpoints - Users

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/admin/users` | Yes (Admin) | Get all users |
| PATCH | `/admin/users/:id/block` | Yes (Admin) | Block/unblock user |

## Admin Endpoints - Categories

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/admin/categories` | Yes (Admin) | Get all categories |
| POST | `/admin/categories` | Yes (Admin) | Create category |
| PUT | `/admin/categories/:id` | Yes (Admin) | Update category |
| DELETE | `/admin/categories/:id` | Yes (Admin) | Delete category |

## Admin Endpoints - Products

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/admin/products` | Yes (Admin) | Get all products |
| POST | `/admin/products` | Yes (Admin) | Create product |
| PUT | `/admin/products/:id` | Yes (Admin) | Update product |
| DELETE | `/admin/products/:id` | Yes (Admin) | Delete product |

## Admin Endpoints - Orders

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/admin/orders` | Yes (Admin) | Get all orders |
| PATCH | `/admin/orders/:id/status` | Yes (Admin) | Update order status |

## Admin Endpoints - Refunds

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/admin/refunds` | Yes (Admin) | Get all refunds |
| PATCH | `/admin/refunds/:id/process` | Yes (Admin) | Approve/reject refund |

## Response Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (not logged in) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 405 | Method Not Allowed |
| 500 | Internal Server Error |

## Authentication

The API uses JWT tokens stored in HTTP-only cookies. After login, the `auth-token` cookie is automatically set and sent with subsequent requests.

For API testing tools (Postman, etc.):
1. Login via `/api/auth/login`
2. Copy the `token` from response
3. Set header: `Cookie: auth-token=<token>`

Or use the cookie directly from the login response headers.

## Query Parameters

### Products
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `categoryId` (uuid): Filter by category
- `search` (string): Search in name/description
- `minPrice` (number): Minimum price
- `maxPrice` (number): Maximum price

### Orders
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by status

### Admin Users
- `page` (number): Page number
- `limit` (number): Items per page
- `role` (string): Filter by role (client/admin)
- `isBlocked` (boolean): Filter by blocked status
- `search` (string): Search in email/name

### Admin Orders
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by status
- `paymentStatus` (string): Filter by payment status
- `userId` (uuid): Filter by user

### Admin Refunds
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by status (pending/approved/rejected)

## Example Requests

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "admin@test.com",
    "password": "admin123"
  }'
```

### Get Products
```bash
curl http://localhost:3000/api/products?page=1&limit=10
```

### Create Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "items": [
      {
        "productId": "product-uuid",
        "quantity": 2
      }
    ],
    "shippingAddress": "123 Main St, City, Country",
    "paymentDetails": {
      "cardNumber": "4532015112830366",
      "cvv": "123",
      "expiryMonth": "12",
      "expiryYear": "2025",
      "cardholderName": "John Doe"
    }
  }'
```

### Block User (Admin)
```bash
curl -X PATCH http://localhost:3000/api/admin/users/user-uuid/block \
  -H "Content-Type: application/json" \
  -b admin-cookies.txt \
  -d '{"isBlocked": true}'
```

### Create Product (Admin)
```bash
curl -X POST http://localhost:3000/api/admin/products \
  -H "Content-Type: application/json" \
  -b admin-cookies.txt \
  -d '{
    "name": "New Product",
    "description": "Product description",
    "price": 99.99,
    "stock": 100,
    "categoryId": "category-uuid",
    "discount": 10
  }'
```

## Postman Collection

Import these endpoints into Postman for easy testing. Create environment variables:
- `baseUrl`: http://localhost:3000
- `adminToken`: (set after admin login)
- `clientToken`: (set after client login)

Then use `{{baseUrl}}/api/...` for endpoints and `Cookie: auth-token={{adminToken}}` for headers.
