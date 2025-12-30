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


  // Create another subadmin acting as "Collaborator"
  const collaboratorPassword = await bcrypt.hash('collab123', 10);
  const collaborator = await prisma.user.upsert({
    where: { email: 'collaborator@cloudcapital.com' },
    update: {},
    create: {
      email: 'collaborator@cloudcapital.com',
      password: collaboratorPassword,
      name: 'Collaborator Demo',
      username: 'collab_demo',
      role: 'SUBADMIN',
      referralCode: 'COLLAB123',
      whatsappNumber: '+593977777777',
      // ... default config
    },
  });
  console.log('✅ Created collaborator user:', collaborator.email);


  console.log('✅ Created collaborator user:', collaborator.email);



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

  // Seed BTC Address Pool
  await prisma.btcAddressPool.createMany({
    data: [
      { address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', uploadedBy: admin.id },
      { address: 'bc1q5d7rjq7g6ratdwq2n0yrf2493p83kkfj923kjs', uploadedBy: admin.id },
      { address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', uploadedBy: admin.id },
      { address: 'bc1q42lja79lem0ankyj4lgw5rj7q4s04p82935j83', uploadedBy: admin.id },
      { address: 'bc1qza3j230005d5t67890abcdef1234567890abcd', uploadedBy: admin.id },
      { address: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', uploadedBy: admin.id },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Seeded 6 BTC addresses to the pool');

  // ========================================
  // FASE 4: TEST USERS FOR CYCLE TESTING
  // ========================================
  console.log('\n🧪 Creating test users for cycle testing...');

  const testPassword = await bcrypt.hash('test123', 10);

  // Test User 1: Normal user with 50% progress
  const testUser1 = await prisma.user.upsert({
    where: { email: 'test1@example.com' },
    update: {},
    create: {
      email: 'test1@example.com',
      password: testPassword,
      name: 'Test User - 50% Progress',
      username: 'testuser1',
      role: 'USER',
      capitalUSDT: 100,
      currentBalanceUSDT: 150, // $50 profit = 50% progress
      investmentClass: 'BASIC',
      contractStatus: 'ACTIVE',
      cycleCompleted: false,
      currentPlanStartDate: new Date(),
      currentPlanExpiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
      referralCode: 'TEST1',
      hasFirstDeposit: true,
    },
  });

  // Create transactions for test user 1
  await prisma.transaction.createMany({
    data: [
      {
        userId: testUser1.id,
        type: 'DEPOSIT',
        amountUSDT: 100,
        status: 'COMPLETED',
        reference: 'Initial deposit',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      },
      {
        userId: testUser1.id,
        type: 'PROFIT',
        amountUSDT: 50,
        status: 'COMPLETED',
        reference: 'Accumulated profit',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
    ],
  });
  console.log('✅ Created Test User 1 (50% progress):', testUser1.email);

  // Test User 2: User at 150% progress (close to completion)
  const testUser2 = await prisma.user.upsert({
    where: { email: 'test2@example.com' },
    update: {},
    create: {
      email: 'test2@example.com',
      password: testPassword,
      name: 'Test User - 150% Progress',
      username: 'testuser2',
      role: 'USER',
      capitalUSDT: 200,
      currentBalanceUSDT: 500, // $300 profit = 150% progress
      investmentClass: 'GOLD',
      contractStatus: 'ACTIVE',
      cycleCompleted: false,
      currentPlanStartDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      currentPlanExpiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days remaining
      referralCode: 'TEST2',
      hasFirstDeposit: true,
    },
  });

  await prisma.transaction.createMany({
    data: [
      {
        userId: testUser2.id,
        type: 'DEPOSIT',
        amountUSDT: 200,
        status: 'COMPLETED',
        reference: 'Initial deposit',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        userId: testUser2.id,
        type: 'PROFIT',
        amountUSDT: 300,
        status: 'COMPLETED',
        reference: 'Accumulated profit',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    ],
  });
  console.log('✅ Created Test User 2 (150% progress):', testUser2.email);

  // Test User 3: User with COMPLETED cycle (200% reached) ⭐ IMPORTANT FOR MODAL TESTING
  const testUser3 = await prisma.user.upsert({
    where: { email: 'test3@example.com' },
    update: {},
    create: {
      email: 'test3@example.com',
      password: testPassword,
      name: 'Test User - Cycle Completed',
      username: 'testuser3',
      role: 'USER',
      capitalUSDT: 100,
      currentBalanceUSDT: 300, // $200 profit = 200% (COMPLETED!)
      investmentClass: 'SILVER',
      contractStatus: 'COMPLETED', // ⭐ This will trigger the modal!
      cycleCompleted: true,
      cycleCompletedAt: new Date(),
      currentPlanStartDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      currentPlanExpiryDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Expired
      referralCode: 'TEST3',
      hasFirstDeposit: true,
    },
  });

  await prisma.transaction.createMany({
    data: [
      {
        userId: testUser3.id,
        type: 'DEPOSIT',
        amountUSDT: 100,
        status: 'COMPLETED',
        reference: 'Initial deposit',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      },
      {
        userId: testUser3.id,
        type: 'PROFIT',
        amountUSDT: 200,
        status: 'COMPLETED',
        reference: 'Profit to reach 200%',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
  });
  console.log('✅ Created Test User 3 (CYCLE COMPLETED - 200%):', testUser3.email);

  // Test User 4: User pending plan selection (after reinvestment)
  const testUser4 = await prisma.user.upsert({
    where: { email: 'test4@example.com' },
    update: {},
    create: {
      email: 'test4@example.com',
      password: testPassword,
      name: 'Test User - Pending Plan',
      username: 'testuser4',
      role: 'USER',
      capitalUSDT: 75,
      currentBalanceUSDT: 75,
      investmentClass: null, // No plan selected
      contractStatus: 'PENDING_PLAN_SELECTION',
      cycleCompleted: false,
      currentPlanStartDate: null,
      currentPlanExpiryDate: null,
      referralCode: 'TEST4',
      hasFirstDeposit: true,
    },
  });

  await prisma.transaction.create({
    data: {
      userId: testUser4.id,
      type: 'REINVEST',
      amountUSDT: 75,
      status: 'COMPLETED',
      reference: 'Reinvestment - Nuevo ciclo iniciado',
      createdAt: new Date(),
    },
  });
  console.log('✅ Created Test User 4 (Pending plan selection):', testUser4.email);

  // Test User 5: User with plan about to expire (for commission testing)
  const testUser5 = await prisma.user.upsert({
    where: { email: 'test5@example.com' },
    update: {},
    create: {
      email: 'test5@example.com',
      password: testPassword,
      name: 'Test User - Plan Expiring',
      username: 'testuser5',
      role: 'USER',
      capitalUSDT: 500,
      currentBalanceUSDT: 650,
      investmentClass: 'PLATINUM',
      contractStatus: 'ACTIVE',
      cycleCompleted: false,
      currentPlanStartDate: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000), // 27 days ago
      currentPlanExpiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Expires in 3 days
      lastCommissionChargeDate: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000),
      referralCode: 'TEST5',
      hasFirstDeposit: true,
    },
  });

  await prisma.transaction.create({
    data: {
      userId: testUser5.id,
      type: 'DEPOSIT',
      amountUSDT: 500,
      status: 'COMPLETED',
      reference: 'Initial deposit',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('✅ Created Test User 5 (Plan expiring in 3 days):', testUser5.email);

  console.log('\n🎉 Seeding completed!');
  console.log('\n📝 Test credentials:');
  console.log('Admin: admin@cloudcapital.com / admin123');
  console.log('Subadmin: subadmin@cloudcapital.com / subadmin123');
  console.log('User: user@example.com / user123');
  console.log('Referred User: referred@example.com / referred123');
  console.log('\n🧪 Cycle Testing Users (password: test123):');
  console.log('Test 1 (50% progress): test1@example.com');
  console.log('Test 2 (150% progress): test2@example.com');
  console.log('Test 3 (COMPLETED - 200%): test3@example.com ⭐ USE THIS TO SEE MODAL');
  console.log('Test 4 (Pending plan): test4@example.com');
  console.log('Test 5 (Plan expiring): test5@example.com');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
