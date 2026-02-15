const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    },
  });
  console.log('Created admin user:', admin.email);

  // Create test client users
  const clientPassword = await bcrypt.hash('client123', 10);
  const client1 = await prisma.user.upsert({
    where: { email: 'client1@test.com' },
    update: {},
    create: {
      email: 'client1@test.com',
      password: clientPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'client',
    },
  });
  console.log('Created client user:', client1.email);

  const client2 = await prisma.user.upsert({
    where: { email: 'client2@test.com' },
    update: {},
    create: {
      email: 'client2@test.com',
      password: clientPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'client',
    },
  });
  console.log('Created client user:', client2.email);

  // Create categories
  const electronics = await prisma.category.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: {
      name: 'Electronics',
      description: 'Electronic devices and accessories',
    },
  });

  const clothing = await prisma.category.upsert({
    where: { name: 'Clothing' },
    update: {},
    create: {
      name: 'Clothing',
      description: 'Fashion and apparel',
    },
  });

  const books = await prisma.category.upsert({
    where: { name: 'Books' },
    update: {},
    create: {
      name: 'Books',
      description: 'Books and literature',
    },
  });

  console.log('Created categories');

  // Create products
  const products = [
    {
      name: 'Laptop Pro 15',
      description: 'High-performance laptop for professionals',
      price: 1299.99,
      stock: 50,
      categoryId: electronics.id,
      discount: 10,
    },
    {
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse',
      price: 29.99,
      stock: 200,
      categoryId: electronics.id,
      discount: 0,
    },
    {
      name: 'USB-C Cable',
      description: 'Fast charging USB-C cable',
      price: 19.99,
      stock: 500,
      categoryId: electronics.id,
      discount: 15,
    },
    {
      name: 'T-Shirt Classic',
      description: 'Comfortable cotton t-shirt',
      price: 24.99,
      stock: 300,
      categoryId: clothing.id,
      discount: 0,
    },
    {
      name: 'Jeans Slim Fit',
      description: 'Modern slim fit jeans',
      price: 59.99,
      stock: 150,
      categoryId: clothing.id,
      discount: 20,
    },
    {
      name: 'Winter Jacket',
      description: 'Warm winter jacket',
      price: 129.99,
      stock: 80,
      categoryId: clothing.id,
      discount: 25,
    },
    {
      name: 'JavaScript Guide',
      description: 'Complete guide to JavaScript',
      price: 39.99,
      stock: 100,
      categoryId: books.id,
      discount: 0,
    },
    {
      name: 'Python Mastery',
      description: 'Master Python programming',
      price: 44.99,
      stock: 120,
      categoryId: books.id,
      discount: 10,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.name },
      update: {},
      create: product,
    }).catch(() => prisma.product.create({ data: product }));
  }
  console.log('Created products');

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
