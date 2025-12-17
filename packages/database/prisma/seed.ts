import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed Banks
  const banks = [
    { name: 'Banco Pichincha' },
    { name: 'Banco Guayaquil' },
    { name: 'Produbanco' },
    { name: 'Banco del Pacífico' },
    { name: 'Banco Bolivariano' },
    { name: 'Banco Internacional' },
    { name: 'Cooperativa JEP' },
  ];

  for (const bank of banks) {
    await prisma.bank.upsert({
      where: { name: bank.name },
      update: {},
      create: { name: bank.name, isActive: true },
    });
  }
  console.log('✅ Seeded banks');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cloudcapital.com' },
    update: {
      whatsappNumber: '+593999999999',
      btcDepositAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      btcWithdrawAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      collaboratorConfig: {
        commission: 2,
        processingTime: '5-15 minutos',
        minAmount: 10,
        maxAmount: 50000
      },
      contactEmail: 'soporte@cloudcapital.com',
      contactTelegram: '@cloudcapitalsupport'
    },
    create: {
      email: 'admin@cloudcapital.com',
      password: adminPassword,
      name: 'Super Admin',
      username: 'superadmin',
      role: 'SUPERADMIN',
      referralCode: 'ADMIN123',
      whatsappNumber: '+593999999999',
      btcDepositAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      btcWithdrawAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      collaboratorConfig: {
        commission: 2,
        processingTime: '5-15 minutos',
        minAmount: 10,
        maxAmount: 50000
      },
      contactEmail: 'soporte@cloudcapital.com',
      contactTelegram: '@cloudcapitalsupport'
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create subadmin user
  const subadminPassword = await bcrypt.hash('subadmin123', 10);
  const subadmin = await prisma.user.upsert({
    where: { email: 'subadmin@cloudcapital.com' },
    update: {
      whatsappNumber: '+593988888888',
      btcDepositAddress: 'bc1q5d7rjq7g6ratdwq2n0yrf2493p83kkfj923kjs',
      btcWithdrawAddress: 'bc1q5d7rjq7g6ratdwq2n0yrf2493p83kkfj923kjs',
      collaboratorConfig: {
        commission: 3.5,
        processingTime: '10-30 minutos',
        minAmount: 20,
        maxAmount: 10000
      }
    },
    create: {
      email: 'subadmin@cloudcapital.com',
      password: subadminPassword,
      name: 'Sub Admin',
      username: 'subadmin',
      role: 'SUBADMIN',
      referralCode: 'SUBADMIN123',
      whatsappNumber: '+593988888888',
      btcDepositAddress: 'bc1q5d7rjq7g6ratdwq2n0yrf2493p83kkfj923kjs',
      btcWithdrawAddress: 'bc1q5d7rjq7g6ratdwq2n0yrf2493p83kkfj923kjs',
      collaboratorConfig: {
        commission: 3.5,
        processingTime: '10-30 minutos',
        minAmount: 20,
        maxAmount: 10000
      }
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
      {
        userId: user.id,
        type: 'WITHDRAWAL',
        amountUSDT: 300,
        netAmount: 291, // 3% fee
        status: 'COMPLETED',
        createdAt: new Date('2024-01-20'),
      },
      {
        userId: user.id,
        type: 'REINVEST',
        amountUSDT: 50,
        status: 'COMPLETED',
        createdAt: new Date('2024-02-10'),
      },
    ],
  });
  console.log('✅ Created sample transactions (Deposit, Profit, Withdrawal, Reinvest)');

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

  await prisma.task.createMany({
    data: [
      {
        userId: user.id,
        type: 'WITHDRAWAL',
        amountUSD: 200,
        status: 'REJECTED',
        rejectionReason: 'Dirección de billetera incorrecta / Red no soportada',
        createdAt: new Date('2024-02-01')
      },
      {
        userId: user.id,
        type: 'DEPOSIT_MANUAL',
        amountUSD: 1500,
        reference: 'TXID_PENDING_APP',
        status: 'PRE_APPROVED',
        proof: 'https://example.com/proof2.jpg',
        createdAt: new Date('2024-02-05')
      }
    ]
  });
  console.log('✅ Created sample tasks (Pending, Rejected, Pre-Approved)');

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

  // 1. Transaction for Referred User
  const refDeposit = await prisma.transaction.create({
    data: {
      userId: referredUser.id,
      type: 'DEPOSIT',
      amountUSDT: 2000,
      status: 'COMPLETED',
      createdAt: new Date(),
    }
  });

  // 2. Commission for Test User
  await prisma.referralCommission.create({
    data: {
      referrerId: user.id,
      referredUserId: referredUser.id,
      depositAmount: 2000,
      commissionRate: 0.05,
      commissionAmount: 100,
      transactionId: refDeposit.id
    }
  });
  console.log('✅ Created referral commission for Test User');

  // Seed Daily Profit Rates (Last 30 days)
  console.log('🌱 Seeding Daily Profit Rates history...');
  const today = new Date();
  const dailyRatesData: any[] = [];
  const investmentClasses = ['BASIC', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    for (const className of investmentClasses) {
      // Random rate between 0.5% and 2.0%
      const rate = parseFloat((Math.random() * (2.0 - 0.5) + 0.5).toFixed(2));
      dailyRatesData.push({
        date: date,
        investmentClass: className,
        rate: rate,
        processed: true
      });
    }
  }

  // Use createMany but since we might run seed multiple times, we use skipDuplicates
  // Note: createMany is not supported in all usage with SQLite, but here we use MySQL.
  await prisma.dailyProfitRate.createMany({
    data: dailyRatesData,
    skipDuplicates: true
  });
  console.log('✅ Created 30 days of profit rate history');

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
