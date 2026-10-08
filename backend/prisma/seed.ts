import 'dotenv/config';
import { PrismaClient, Role, OrderStatus, PaymentStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

import bcrypt from 'bcrypt';

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean the database (in reverse order of dependencies)
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing records.');

  // 2. Seed Users
  const defaultPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@ecommerce.com',
      password: defaultPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: 'customer@ecommerce.com',
      password: defaultPassword,
      firstName: 'Jane',
      lastName: 'Doe',
      role: Role.USER,
    },
  });

  console.log('👤 Created Users: admin@ecommerce.com & customer@ecommerce.com');

  // 3. Seed Categories
  const electronics = await prisma.category.create({
    data: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Gadgets, phones, and accessories',
      imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661',
    },
  });

  const clothing = await prisma.category.create({
    data: {
      name: 'Clothing',
      slug: 'clothing',
      description: 'Apparel and fashion accessories',
      imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f',
    },
  });

  console.log('📁 Created Categories: Electronics & Clothing');

  // 4. Seed Products
  const headphones = await prisma.product.create({
    data: {
      name: 'Wireless Noise-Canceling Headphones',
      description: 'High-fidelity audio with active noise cancellation.',
      price: 199.99,
      stock: 45,
      sku: 'ELEC-WNC-001',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
      categoryId: electronics.id,
      isActive: true,
    },
  });

  const smartwatch = await prisma.product.create({
    data: {
      name: 'Fitness Smartwatch v2',
      description: 'Heart rate tracker, waterproof, 7-day battery life.',
      price: 129.5,
      stock: 30,
      sku: 'ELEC-FSW-002',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
      categoryId: electronics.id,
      isActive: true,
    },
  });

  const hoodie = await prisma.product.create({
    data: {
      name: 'Classic Pullover Hoodie',
      description: '100% organic cotton fleece pullover hoodie.',
      price: 49.99,
      stock: 100,
      sku: 'CLOTH-HOOD-001',
      imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2',
      categoryId: clothing.id,
      isActive: true,
    },
  });

  console.log('📦 Created sample Products');

  // 5. Seed an Active Cart for Customer
  const cart = await prisma.cart.create({
    data: {
      userId: customer.id,
      checkedOut: false,
      cartItems: {
        create: [
          {
            productId: headphones.id,
            quantity: 1,
          },
        ],
      },
    },
  });

  console.log('🛒 Created Cart with items');

  // 6. Seed a Completed Order with Payment
  const order = await prisma.order.create({
    data: {
      userId: customer.id,
      status: OrderStatus.DELIVERED,
      totalAmount: 179.49,
      shippingAddress: '123 Main Street, New York, NY 10001',
      orderItems: {
        create: [
          {
            productId: smartwatch.id,
            quantity: 1,
            price: 129.5,
          },
          {
            productId: hoodie.id,
            quantity: 1,
            price: 49.99,
          },
        ],
      },
      payment: {
        create: {
          userId: customer.id,
          amount: 179.49,
          status: PaymentStatus.COMPLETED,
          currency: 'usd',
          paymentMethod: 'card',
          transactionId: 'txn_mock_1234567890',
        },
      },
    },
  });

  console.log(`🧾 Created sample Order (${order.orderNumber}) with Payment`);
  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });