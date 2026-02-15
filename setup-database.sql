-- ================================================
-- Run this script in DBeaver to set up the database
-- ================================================

-- Step 1: Create the database
-- (Run this while connected to any database, like 'postgres')
CREATE DATABASE ecommerce_test;

-- Step 2: Connect to the new database
-- (In DBeaver: Use the database dropdown and select 'ecommerce_test')
-- Or uncomment and run: \c ecommerce_test

-- Step 3: Grant permissions to your user
-- IMPORTANT: Replace 'your_username' with your actual PostgreSQL username
-- To find your username, run: SELECT current_user;

GRANT ALL PRIVILEGES ON DATABASE ecommerce_test TO your_username;
GRANT ALL ON SCHEMA public TO your_username;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_username;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_username;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO your_username;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO your_username;

-- ================================================
-- After running this script:
-- 1. Update your .env file with your credentials
-- 2. Run: npm run db:push
-- 3. Run: npm run db:seed
-- 4. Run: npm run dev
-- ================================================

-- To verify: Check if database was created
SELECT datname FROM pg_database WHERE datname = 'ecommerce_test';

-- To verify: Check your permissions
SELECT 
    grantee,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
    AND grantee = current_user;
