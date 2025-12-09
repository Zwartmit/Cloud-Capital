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
      referralCode: 'ADMIN123',
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
      referralCode: 'SUBADMIN123',
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
      referralCode: 'USER123',
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

  // Seed Investment Plans
  const plans = [
    {
      name: 'BASIC',
      minCapital: 50,
      minDailyReturn: 1.3,
      maxDailyReturn: 1.6,
      dailyAverage: 1.45,
      monthlyCommission: 0.50,
      referralCommissionRate: 0.05,
      doublingTime: '6 meses',
    },
    {
      name: 'SILVER',
      minCapital: 50,
      minDailyReturn: 1.4,
      maxDailyReturn: 1.7,
      dailyAverage: 1.55,
      monthlyCommission: 0.45,
      referralCommissionRate: 0.05,
      doublingTime: '5.5 meses',
    },
    {
      name: 'GOLD',
      minCapital: 350,
      minDailyReturn: 1.5,
      maxDailyReturn: 1.9,
      dailyAverage: 1.70,
      monthlyCommission: 0.40,
      referralCommissionRate: 0.05,
      doublingTime: '5 meses',
    },
    {
      name: 'PLATINUM',
      minCapital: 800,
      minDailyReturn: 1.9,
      maxDailyReturn: 2.3,
      dailyAverage: 2.10,
      monthlyCommission: 0.35,
      referralCommissionRate: 0.10,
      doublingTime: '4.5 meses',
    },
    {
      name: 'DIAMOND',
      minCapital: 5000,
      minDailyReturn: 2.8,
      maxDailyReturn: 3.2,
      dailyAverage: 3.00,
      monthlyCommission: 0.20,
      referralCommissionRate: 0.10,
      doublingTime: '3 meses',
    },
  ];

  // Seed Investment Plans logic using findFirst to avoid duplicates
  for (const plan of plans) {
    const existingPlan = await prisma.investmentPlan.findFirst({
        where: { name: plan.name }
    });

    if (existingPlan) {
        await prisma.investmentPlan.update({
            where: { id: existingPlan.id },
            data: plan
        });
        console.log(`🔄 Updated plan: ${plan.name}`);
    } else {
        await prisma.investmentPlan.create({
            data: plan
        });
        console.log(`✅ Created plan: ${plan.name}`);
    }
  }

  // Create a Referred User (Referred by 'Test User')
  const referredUserPassword = await bcrypt.hash('referred123', 10);
  const referredUser = await prisma.user.upsert({
    where: { email: 'referred@example.com' },
    update: {},
    create: {
      email: 'referred@example.com',
      password: referredUserPassword,
      name: 'Referred User',
      username: 'referreduser',
      role: 'USER',
      // No capital/balance yet (simulating new user)
      capitalUSDT: 0,
      currentBalanceUSDT: 0,
      referralCode: 'REF456',
      referrerId: user.id, // Referred by Test User
    },
  });
  console.log('✅ Created referred user:', referredUser.email, '(Referred by Test User)');

  console.log('🎉 Seeding completed!');
  console.log('\n📝 Test credentials:');
  console.log('Admin: admin@cloudcapital.com / admin123');
  console.log('Subadmin: subadmin@cloudcapital.com / subadmin123');
  console.log('User: user@example.com / user123');
  console.log('Referred User: referred@example.com / referred123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
