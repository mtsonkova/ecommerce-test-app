# Fix: Permission Denied to Create Database

## 🔴 Error: "permission denied to create database"

This means your PostgreSQL user doesn't have the CREATEDB permission.

## ✅ Solutions (Choose One)

### Solution 1: Create Database Manually in DBeaver (Easiest)

1. **Open DBeaver**
2. **Connect to PostgreSQL**
3. **Right-click on "Databases" → Create New Database**
4. **Database name:** `ecommerce_test`
5. **Owner:** Your username (or leave default)
6. **Click OK**

Then run:
```bash
npm run db:push
npm run db:seed
```

---

### Solution 2: Grant CREATEDB Permission to Your User

#### Using DBeaver:

1. **Open SQL Editor** (Ctrl+] or click SQL Editor icon)
2. **Connect as superuser** (usually `postgres`)
3. **Run this SQL:**

```sql
-- Replace 'your_username' with your actual PostgreSQL username
ALTER USER your_username CREATEDB;
```

4. **Close and reconnect**
5. **Now run:**
```bash
npm run db:push
npm run db:seed
```

#### Using psql (Command Line):

```bash
# Connect as postgres superuser
psql -U postgres

# Then run:
ALTER USER your_username CREATEDB;

# Exit
\q
```

---

### Solution 3: Use postgres Superuser in .env

**Update your .env file to use the postgres superuser:**

```env
# Use postgres superuser (has all permissions)
DATABASE_URL="postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/ecommerce_test?schema=public"

JWT_SECRET="test-secret-key-change-in-production"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

**Note:** You need to know the postgres user password. If you don't know it:

#### On Mac (if installed via Homebrew):
```bash
psql -U postgres
# If it works, there's no password or password is 'postgres'
```

#### On Windows:
- Default password is usually what you set during PostgreSQL installation
- Common defaults: `postgres`, `admin`, or blank

#### On Linux:
```bash
sudo -u postgres psql
# Then set password:
ALTER USER postgres PASSWORD 'newpassword';
```

---

## 🎯 Recommended Approach (Step by Step)

### Step 1: Create Database in DBeaver
```sql
-- In DBeaver SQL Editor, run:
CREATE DATABASE ecommerce_test;
```

### Step 2: Grant All Permissions
```sql
-- Replace 'your_username' with your PostgreSQL username
GRANT ALL PRIVILEGES ON DATABASE ecommerce_test TO your_username;
```

### Step 3: Connect to the new database
```sql
-- Click the database selector dropdown and choose 'ecommerce_test'
-- Or run:
\c ecommerce_test
```

### Step 4: Grant Schema Permissions
```sql
GRANT ALL ON SCHEMA public TO your_username;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_username;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_username;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO your_username;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO your_username;
```

### Step 5: Update .env with Your Credentials
```env
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/ecommerce_test?schema=public"
JWT_SECRET="test-secret-key-change-in-production"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### Step 6: Run Setup
```bash
npx prisma generate
npm run db:push
npm run db:seed
npm run dev
```

---

## 🔍 Check Your Current User and Permissions

Run this in DBeaver SQL Editor to see what user you're using:

```sql
-- See current user
SELECT current_user;

-- See current database
SELECT current_database();

-- Check if you can create databases
SELECT rolname, rolcreatedb 
FROM pg_roles 
WHERE rolname = current_user;
```

If `rolcreatedb` is `false` (f), you don't have CREATEDB permission.

---

## 🆘 Quick Decision Tree

**Q: Do you know the postgres superuser password?**
- ✅ **YES** → Use Solution 3 (update .env to use postgres user)
- ❌ **NO** → Use Solution 1 (create database manually in DBeaver)

**Q: Can you run commands as superuser in DBeaver?**
- ✅ **YES** → Use Solution 2 (grant CREATEDB permission)
- ❌ **NO** → Use Solution 1 (create database manually)

---

## 💡 What's Actually Happening

Prisma is trying to:
1. Create the database `ecommerce_test`
2. But your user doesn't have CREATEDB permission
3. So PostgreSQL rejects it

**The fix:** Either give your user permission, or create the database yourself and let Prisma just create the tables (which requires less permissions).

---

## ✅ Verify Everything Works

After setup, test:

```bash
# Should open GUI with data
npm run db:studio

# Should start app
npm run dev

# Visit and login with:
# admin@test.com / admin123
http://localhost:3000
```

---

## 📝 Summary: Fastest Fix

```sql
-- In DBeaver SQL Editor:
CREATE DATABASE ecommerce_test;
GRANT ALL PRIVILEGES ON DATABASE ecommerce_test TO your_username;

-- Switch to ecommerce_test database, then:
GRANT ALL ON SCHEMA public TO your_username;
```

Then:
```bash
npm run db:push
npm run db:seed
```

Done! 🎉
