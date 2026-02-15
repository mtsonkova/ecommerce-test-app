#!/bin/bash

echo "🚀 Setting up E-commerce Test Application..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${BLUE}Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v) found${NC}"
echo ""

# Check PostgreSQL
echo -e "${BLUE}Checking PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}PostgreSQL is not installed.${NC}"
    echo "You can either:"
    echo "1. Install PostgreSQL locally"
    echo "2. Use Docker: docker-compose up -d"
    exit 1
fi
echo -e "${GREEN}✓ PostgreSQL found${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Setup database
echo -e "${BLUE}Setting up database...${NC}"
echo "Creating database if it doesn't exist..."

# Try to create database (will fail if exists, which is fine)
createdb ecommerce_test 2>/dev/null || echo "Database already exists"

# Push schema
echo "Pushing database schema..."
npm run db:push

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database schema created${NC}"
else
    echo -e "${YELLOW}⚠ Database schema push failed. Check your DATABASE_URL in .env${NC}"
    exit 1
fi
echo ""

# Seed database
echo -e "${BLUE}Seeding database with test data...${NC}"
npm run db:seed

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database seeded${NC}"
else
    echo -e "${YELLOW}⚠ Database seeding failed${NC}"
    exit 1
fi
echo ""

# Success message
echo -e "${GREEN}✅ Setup completed successfully!${NC}"
echo ""
echo -e "${BLUE}Test Accounts:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Admin:  admin@test.com / admin123"
echo "Client: client1@test.com / client123"
echo ""
echo -e "${BLUE}Test Credit Cards:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Success: 4532015112830366 (CVV: 123)"
echo "Decline: 4000000000000002 (CVV: 789)"
echo ""
echo -e "${BLUE}To start the application:${NC}"
echo "  npm run dev"
echo ""
echo -e "${BLUE}Then visit:${NC}"
echo "  http://localhost:3000"
echo ""
echo -e "${BLUE}Database GUI (optional):${NC}"
echo "  npm run db:studio"
echo ""
