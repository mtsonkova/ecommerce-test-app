# 📘 DBeaver Setup - Step by Step Visual Guide

## 🎯 Goal
Create the database and set permissions so `npm run db:push` works.

---

## 📋 Steps

### Step 1: Open DBeaver and Find Your Username

1. Open **DBeaver**
2. Connect to your PostgreSQL server
3. Click **SQL Editor** button (or press `Ctrl+]`)
4. Run this command:

```sql
SELECT current_user;
```

5. **Write down the username** - you'll need it!

---

### Step 2: Create the Database

Still in the SQL Editor, run:

```sql
CREATE DATABASE ecommerce_test;
```

You should see: ✅ `Query executed successfully`

---

### Step 3: Switch to the New Database

**Option A - Using Dropdown:**
1. Look at the top toolbar in DBeaver
2. Find the database dropdown (shows current database)
3. Click it and select **ecommerce_test**

**Option B - Using SQL:**
```sql
\c ecommerce_test
```

---

### Step 4: Grant Permissions

⚠️ **IMPORTANT:** Replace `your_username` with the username from Step 1!

```sql
-- Replace 'your_username' with YOUR actual username!
GRANT ALL ON SCHEMA public TO your_username;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_username;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_username;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO your_username;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO your_username;
```

**Example:** If your username is `john`, it would be:
```sql
GRANT ALL ON SCHEMA public TO john;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO john;
-- etc...
```

---

### Step 5: Verify Database Exists

```sql
SELECT datname FROM pg_database WHERE datname = 'ecommerce_test';
```

You should see:
```
datname
-----------------
ecommerce_test
```

---

### Step 6: Update .env File

Open the `.env` file in your project and update:

```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/ecommerce_test?schema=public"
JWT_SECRET="test-secret-key-change-in-production"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

**Example:**
- If username is `john` and password is `password123`:
```env
DATABASE_URL="postgresql://john:password123@localhost:5432/ecommerce_test?schema=public"
```

---

### Step 7: Run Setup Commands

Open terminal in your project folder:

```bash
# Generate Prisma client
npx prisma generate

# Create tables
npm run db:push

# Add test data
npm run db:seed

# Start the app
npm run dev
```

---

## ✅ Success Checklist

After completing all steps:

- [ ] Database `ecommerce_test` exists in DBeaver
- [ ] You can see it in the database list
- [ ] `.env` file has your correct username and password
- [ ] `npm run db:push` completes without errors
- [ ] `npm run db:seed` completes without errors
- [ ] App starts with `npm run dev`
- [ ] You can visit http://localhost:3000
- [ ] You can login with admin@test.com / admin123

---

## 🐛 Troubleshooting

### "permission denied" when running GRANT commands
**Solution:** You need to connect as a superuser (usually `postgres`)

1. In DBeaver, create a new connection
2. Use username: `postgres`
3. Use the password you set during PostgreSQL installation
4. Retry Step 4

---

### "database already exists"
**Solution:** That's fine! Skip to Step 3.

---

### Can't find the database dropdown
**Solution:** Look for:
- Top toolbar in DBeaver
- Usually near the connection name
- Shows current database name
- Looks like: `[database_name ▼]`

---

### npm run db:push still fails
**Run this diagnostic:**

```sql
-- In DBeaver SQL Editor:
SELECT 
    has_database_privilege(current_user, 'ecommerce_test', 'CONNECT') as can_connect,
    has_schema_privilege(current_user, 'public', 'CREATE') as can_create,
    has_schema_privilege(current_user, 'public', 'USAGE') as can_use;
```

All should return `true`. If any are `false`, you need more permissions.

---

## 🎬 Quick Reference

**Create database:**
```sql
CREATE DATABASE ecommerce_test;
```

**Grant permissions (replace your_username!):**
```sql
GRANT ALL ON SCHEMA public TO your_username;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_username;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_username;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO your_username;
```

**Check it worked:**
```sql
SELECT datname FROM pg_database WHERE datname = 'ecommerce_test';
```

**Update .env:**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce_test?schema=public"
```

**Run setup:**
```bash
npx prisma generate && npm run db:push && npm run db:seed && npm run dev
```

---

## 💡 Why This Works

Prisma needs two things:
1. **Database exists** ← We create this in DBeaver
2. **Permissions to create tables** ← We grant this with GRANT commands

By doing it this way, you don't need CREATEDB permission on your user!

---

## 🆘 Still Stuck?

Check these common issues:

1. **Wrong password in .env** 
   - Test: `psql -U your_username -d ecommerce_test`
   
2. **Wrong host/port in .env**
   - Check in DBeaver connection settings
   
3. **PostgreSQL not running**
   - Check in DBeaver if you can connect

4. **Firewall blocking**
   - Usually not an issue for localhost

Need more help? Share the exact error message!
