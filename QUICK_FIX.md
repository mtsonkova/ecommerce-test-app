# Quick Fix for Database Issues

## ⚡ Fast Solution

### Step 1: Update your .env file
Open `.env` and replace with YOUR credentials:

```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/ecommerce_test?schema=public"
JWT_SECRET="test-secret-key-change-in-production"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

**Common examples:**
- Default PostgreSQL: `postgresql://postgres:postgres@localhost:5432/ecommerce_test?schema=public`
- Custom user: `postgresql://myuser:mypass@localhost:5432/ecommerce_test?schema=public`

### Step 2: Run these commands

```bash
# For Mac/Linux
./setup-manual.sh

# For Windows
setup-manual.bat

# OR manually:
npx prisma generate
npm run db:push
npm run db:seed
npm run dev
```

## 🔍 Common Issues

### "password authentication failed"
→ Wrong username/password in .env

### "database does not exist"  
→ Create database in DBeaver:
```sql
CREATE DATABASE ecommerce_test;
```

### "permission denied for schema public"
→ Run in DBeaver SQL editor:
```sql
GRANT ALL ON SCHEMA public TO your_username;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_username;
```

### "relation already exists"
→ Tables already exist. Reset:
```bash
npm run db:push -- --force-reset
```

## 🎯 What You Need from DBeaver

1. Open your PostgreSQL connection in DBeaver
2. Find these values:
   - **Host:** Usually `localhost`
   - **Port:** Usually `5432`
   - **Database:** `ecommerce_test` (you created this)
   - **Username:** Your PostgreSQL username
   - **Password:** Your PostgreSQL password

3. Put them in .env like this:
```
postgresql://username:password@host:port/database?schema=public
```

## ✅ Verify Setup Worked

After successful setup, test:

```bash
# Open database GUI
npm run db:studio

# Start app
npm run dev

# Visit http://localhost:3000
```

You should see:
- 3 users in database (admin, client1, client2)
- 8 products
- 3 categories

## 🆘 Still Stuck?

Run this diagnostic:

```bash
# Test if database exists
psql -U your_username -l | grep ecommerce_test

# Test connection
psql -U your_username -d ecommerce_test -c "SELECT version();"

# Check Prisma can connect
npx prisma db pull
```

If these fail → database connection issue
If these work → problem is with Prisma schema

## 📞 Quick Support Checklist

When asking for help, provide:
1. Your PostgreSQL version
2. The full error message
3. Your .env (without password!)
4. Output of: `psql -U your_username -d ecommerce_test -c "SELECT 1;"`
