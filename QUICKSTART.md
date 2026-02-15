# Quick Start Guide

Get the e-commerce testing platform up and running in 5 minutes!

## Option 1: Using Docker (Recommended)

### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ installed

### Steps

1. **Clone the repository**
```bash
cd ecommerce-test-app
```

2. **Start PostgreSQL with Docker**
```bash
docker-compose up -d
```
This starts PostgreSQL on port 5432.

3. **Install dependencies and setup**
```bash
npm install
npm run db:push
npm run db:seed
```

4. **Start the application**
```bash
npm run dev
```

5. **Open your browser**
```
http://localhost:3000
```

**Done!** 🎉

---

## Option 2: Local PostgreSQL

### Prerequisites
- PostgreSQL 14+ installed and running
- Node.js 18+ installed

### Steps

1. **Create database**
```bash
createdb ecommerce_test
```

Or using psql:
```sql
CREATE DATABASE ecommerce_test;
```

2. **Run setup script**
```bash
chmod +x setup.sh
./setup.sh
```

3. **Start the application**
```bash
npm run dev
```

4. **Open your browser**
```
http://localhost:3000
```

---

## 🧪 Test Login Credentials

### Admin Account
- **Email:** admin@test.com
- **Password:** admin123
- **Access:** Full admin dashboard access

### Client Account
- **Email:** client1@test.com
- **Password:** client123
- **Access:** Shopping and orders

---

## 💳 Test Credit Cards

### Successful Payment
```
Card: 4532015112830366
CVV: 123
Expiry: 12/2025
```

### Failed Payment
```
Card: 4000000000000002
CVV: 789
Expiry: 03/2025
```

### Insufficient Funds
```
Card: 4000000000009995
CVV: 321
Expiry: 09/2025
```

---

## 🎯 What to Test First

### 1. User Registration & Login ✅
```
1. Go to http://localhost:3000/register
2. Create a new account
3. Login with your credentials
```

### 2. Browse Products 🛍️
```
1. Click "Products" in navigation
2. Try search and filters
3. View product details
```

### 3. Place an Order 📦
```
1. Add products to cart
2. Go to checkout
3. Use test credit card
4. View order in "My Orders"
```

### 4. Admin Dashboard 👨‍💼
```
1. Logout and login as admin
2. Go to Admin Dashboard
3. Try managing products, users, and orders
```

---

## 🔧 Useful Commands

```bash
# Start development server
npm run dev

# View database in GUI
npm run db:studio

# Reset and reseed database
npm run db:push -- --force-reset
npm run db:seed

# Stop Docker database
docker-compose down
```

---

## 🚨 Troubleshooting

### Port 3000 already in use
```bash
# Kill the process
lsof -ti:3000 | xargs kill

# Or use different port
PORT=3001 npm run dev
```

### Database connection error
```bash
# Check PostgreSQL is running
docker-compose ps
# or
pg_isready

# Check .env file has correct DATABASE_URL
cat .env
```

### "Module not found" errors
```bash
npm install
npx prisma generate
```

---

## 📚 Next Steps

1. **Read API Documentation**: Check `API_ENDPOINTS.md`
2. **Review Testing Guide**: Check `TESTING_GUIDE.md`
3. **Start Testing**: Use Postman, Selenium, or your preferred tool

---

## 💡 Pro Tips

- Use `npm run db:studio` to visually browse and edit database
- Check browser console for frontend errors
- Check terminal logs for backend errors
- Use Postman collection for quick API testing
- Reset database anytime if data gets messy

---

## 🆘 Need Help?

Common issues:
1. **Database errors**: Check PostgreSQL is running and DATABASE_URL is correct
2. **Login fails**: Verify you're using correct test credentials
3. **Orders fail**: Check you're using valid test credit cards
4. **Admin access denied**: Login with admin@test.com account

---

**Happy Testing!** 🧪
