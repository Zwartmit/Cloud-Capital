import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cloudcapital.com' },
    update: {},
    create: {
      email: 'admin@cloudcapital.com',
      password: adminPassword,
      name: 'Super Admin',
      username: 'superadmin',
      role: 'SUPERADMIN',
      capitalUSDT: 0,
      currentBalanceUSDT: 0,
      investmentClass: 'DIAMOND',
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create subadmin user
  const subadminPassword = await bcrypt.hash('subadmin123', 10);
  const subadmin = await prisma.user.upsert({
    where: { email: 'subadmin@cloudcapital.com' },
    update: {},
    create: {
      email: 'subadmin@cloudcapital.com',
      password: subadminPassword,
      name: 'Sub Admin',
      username: 'subadmin',
      role: 'SUBADMIN',
      capitalUSDT: 0,
      currentBalanceUSDT: 0,
      investmentClass: 'PLATINUM',
    },
  });
  console.log('✅ Created subadmin user:', subadmin.email);

  // Create test user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      name: 'Test User',
      username: 'testuser',
      role: 'USER',
      capitalUSDT: 1000,
      currentBalanceUSDT: 1150,
      investmentClass: 'GOLD',
    },
  });
  console.log('✅ Created test user:', user.email);

  // Create some sample transactions for test user
  await prisma.transaction.createMany({
    data: [
      {
        userId: user.id,
        type: 'DEPOSIT',
        amountUSDT: 1000,
        amountBTC: 0.025,
        btcPrice: 40000,
        reference: 'TXID123456',
        status: 'COMPLETED',
        createdAt: new Date('2024-01-01'),
      },
      {
        userId: user.id,
        type: 'PROFIT',
        amountUSDT: 150,
        status: 'COMPLETED',
        createdAt: new Date('2024-01-15'),
      },
    ],
  });
  console.log('✅ Created sample transactions');

  // Create a pending task
  await prisma.task.create({
    data: {
      userId: user.id,
      type: 'DEPOSIT_MANUAL',
      amountUSD: 500,
      reference: 'TXID789012',
      proof: 'https://example.com/proof.jpg',
      status: 'PENDING',
    },
  });
  console.log('✅ Created sample pending task');

  console.log('🎉 Seeding completed!');
  console.log('\n📝 Test credentials:');
  console.log('Admin: admin@cloudcapital.com / admin123');
  console.log('Subadmin: subadmin@cloudcapital.com / subadmin123');
  console.log('User: user@example.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
