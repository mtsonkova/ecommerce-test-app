#!/bin/bash

# E-commerce Test App - Manual Database Setup
# Use this when you've created the database manually

echo "🔧 E-commerce Test App - Manual Database Setup"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get database credentials
echo -e "${BLUE}Please provide your PostgreSQL credentials:${NC}"
echo ""

read -p "Database Host (default: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Database Port (default: 5432): " DB_PORT
DB_PORT=${DB_PORT:-5432}

read -p "Database Name (default: ecommerce_test): " DB_NAME
DB_NAME=${DB_NAME:-ecommerce_test}

read -p "Username: " DB_USER
read -s -p "Password: " DB_PASS
echo ""
echo ""

# Create .env file
echo -e "${BLUE}Creating .env file...${NC}"
cat > .env << EOF
# Database Configuration
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"

# JWT Secret (for testing only)
JWT_SECRET="test-secret-key-change-in-production"

# Next.js
NEXT_PUBLIC_API_URL="http://localhost:3000"
EOF

echo -e "${GREEN}✓ .env file created${NC}"
echo ""

# Test connection
echo -e "${BLUE}Testing database connection...${NC}"
PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
else
    echo -e "${YELLOW}⚠ Could not verify connection (psql not installed or connection failed)${NC}"
    echo "Please verify your credentials manually"
fi
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
    echo ""
fi

# Generate Prisma client
echo -e "${BLUE}Generating Prisma client...${NC}"
npx prisma generate
echo -e "${GREEN}✓ Prisma client generated${NC}"
echo ""

# Push schema
echo -e "${BLUE}Pushing database schema...${NC}"
npm run db:push

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database schema created${NC}"
else
    echo -e "${RED}✗ Schema push failed${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting steps:${NC}"
    echo "1. Verify your credentials are correct"
    echo "2. Check if database exists in DBeaver"
    echo "3. Grant permissions with:"
    echo "   GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"
    echo "   GRANT ALL ON SCHEMA public TO ${DB_USER};"
    echo ""
    exit 1
fi
echo ""

# Seed database
echo -e "${BLUE}Seeding database with test data...${NC}"
npm run db:seed

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database seeded${NC}"
else
    echo -e "${RED}✗ Seeding failed${NC}"
    exit 1
fi
echo ""

# Success
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Setup completed successfully!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Test Accounts:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Admin:  admin@test.com / admin123"
echo "Client: client1@test.com / client123"
echo ""
echo -e "${BLUE}To start the application:${NC}"
echo "  npm run dev"
echo ""
echo -e "${BLUE}Then visit:${NC}"
echo "  http://localhost:3000"
echo ""
