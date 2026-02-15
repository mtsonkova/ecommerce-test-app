# Database Setup Troubleshooting

## Issue: `npm run db:push` fails after creating database in DBeaver

### Solution Steps:

## Step 1: Update .env with Your Database Credentials

Edit the `.env` file and replace with your actual credentials:

```env
# Database - UPDATE THESE VALUES
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/ecommerce_test?schema=public"

# JWT Secret (for testing only)
JWT_SECRET="test-secret-key-change-in-production"

# Next.js
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

**Common credential patterns:**

If you're using default PostgreSQL installation:
```
postgresql://postgres:postgres@localhost:5432/ecommerce_test?schema=public
```

If you created a specific user:
```
postgresql://your_username:your_password@localhost:5432/ecommerce_test?schema=public
```

If using different port:
```
postgresql://postgres:postgres@localhost:5433/ecommerce_test?schema=public
```

## Step 2: Verify Database Connection

Test if you can connect to the database:

### Using psql:
```bash
psql -U your_username -d ecommerce_test -h localhost
```

### Using DBeaver:
1. Open DBeaver
2. Right-click on your connection → Edit Connection
3. Note down:
   - Host (usually localhost)
   - Port (usually 5432)
   - Database name (ecommerce_test)
   - Username
   - Password

## Step 3: Grant Permissions

If you get permission errors, run these SQL commands in DBeaver:

```sql
-- Connect to ecommerce_test database
-- Then run:

-- Grant all privileges to your user
GRANT ALL PRIVILEGES ON DATABASE ecommerce_test TO your_username;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO your_username;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_username;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_username;

-- If using postgres user, this is usually not needed
ALTER DATABASE ecommerce_test OWNER TO your_username;
```

## Step 4: Clean and Retry

After updating .env:

```bash
# Delete any existing Prisma client
rm -rf node_modules/.prisma

# Generate Prisma client
npx prisma generate

# Push schema to database
npm run db:push

# Seed the database
npm run db:seed
```

## Step 5: Alternative - Reset Database

If still having issues, completely reset:

### In DBeaver:
```sql
-- Drop all tables if they exist
DROP TABLE IF EXISTS "Refund" CASCADE;
DROP TABLE IF EXISTS "OrderItem" CASCADE;
DROP TABLE IF EXISTS "Order" CASCADE;
DROP TABLE IF EXISTS "Product" CASCADE;
DROP TABLE IF EXISTS "Category" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
```

Then retry:
```bash
npm run db:push
npm run db:seed
```

## Common Error Messages and Solutions

### Error: "password authentication failed"
**Solution:** Check your username and password in .env

### Error: "database does not exist"
**Solution:** Create database in DBeaver:
```sql
CREATE DATABASE ecommerce_test;
```

### Error: "permission denied"
**Solution:** Grant permissions (see Step 3 above)

### Error: "connection refused"
**Solution:** 
- Check PostgreSQL is running
- Check port number (5432 is default)
- Check if firewall is blocking

### Error: "relation already exists"
**Solution:** Tables already exist. Either:
1. Use `npm run db:push -- --force-reset` to reset
2. Or manually drop tables (see Step 5)

## Verify Everything Works

After successful setup:

```bash
# Should show your database tables
npx prisma studio
```

This opens a GUI where you can see:
- User table (should have admin and client accounts)
- Product table (should have 8 products)
- Category table (should have 3 categories)

## Quick Fix Script

Run this if you just need to update credentials:

```bash
# Replace YOUR_USERNAME and YOUR_PASSWORD
export DB_USER="YOUR_USERNAME"
export DB_PASS="YOUR_PASSWORD"

echo "DATABASE_URL=\"postgresql://${DB_USER}:${DB_PASS}@localhost:5432/ecommerce_test?schema=public\"" > .env
echo "JWT_SECRET=\"test-secret-key-change-in-production\"" >> .env
echo "NEXT_PUBLIC_API_URL=\"http://localhost:3000\"" >> .env

npm run db:push
npm run db:seed
```

## Still Not Working?

Check the actual error message and look for:
1. **Connection errors** → Check DATABASE_URL
2. **Permission errors** → Grant privileges (Step 3)
3. **Schema errors** → Reset database (Step 5)

Or provide the full error message for more specific help.
