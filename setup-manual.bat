@echo off
REM E-commerce Test App - Manual Database Setup (Windows)

echo ================================================
echo E-commerce Test App - Manual Database Setup
echo ================================================
echo.

REM Get database credentials
set /p DB_HOST="Database Host (default: localhost): "
if "%DB_HOST%"=="" set DB_HOST=localhost

set /p DB_PORT="Database Port (default: 5432): "
if "%DB_PORT%"=="" set DB_PORT=5432

set /p DB_NAME="Database Name (default: ecommerce_test): "
if "%DB_NAME%"=="" set DB_NAME=ecommerce_test

set /p DB_USER="Username: "
set /p DB_PASS="Password: "

echo.
echo Creating .env file...

REM Create .env file
(
echo # Database Configuration
echo DATABASE_URL="postgresql://%DB_USER%:%DB_PASS%@%DB_HOST%:%DB_PORT%/%DB_NAME%?schema=public"
echo.
echo # JWT Secret ^(for testing only^)
echo JWT_SECRET="test-secret-key-change-in-production"
echo.
echo # Next.js
echo NEXT_PUBLIC_API_URL="http://localhost:3000"
) > .env

echo [OK] .env file created
echo.

REM Install dependencies
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo [OK] Dependencies installed
    echo.
)

REM Generate Prisma client
echo Generating Prisma client...
call npx prisma generate
echo [OK] Prisma client generated
echo.

REM Push schema
echo Pushing database schema...
call npm run db:push

if %ERRORLEVEL% neq 0 (
    echo [ERROR] Schema push failed
    echo.
    echo Troubleshooting steps:
    echo 1. Verify your credentials are correct
    echo 2. Check if database exists in DBeaver
    echo 3. Grant permissions in DBeaver SQL editor:
    echo    GRANT ALL PRIVILEGES ON DATABASE %DB_NAME% TO %DB_USER%;
    echo    GRANT ALL ON SCHEMA public TO %DB_USER%;
    echo.
    pause
    exit /b 1
)

echo [OK] Database schema created
echo.

REM Seed database
echo Seeding database with test data...
call npm run db:seed

if %ERRORLEVEL% neq 0 (
    echo [ERROR] Seeding failed
    pause
    exit /b 1
)

echo [OK] Database seeded
echo.

REM Success
echo ================================================
echo Setup completed successfully!
echo ================================================
echo.
echo Test Accounts:
echo Admin:  admin@test.com / admin123
echo Client: client1@test.com / client123
echo.
echo To start the application:
echo   npm run dev
echo.
echo Then visit:
echo   http://localhost:3000
echo.
pause
