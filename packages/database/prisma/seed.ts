import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cloudcapital.com' },
    update: {
      whatsappNumber: '+593999999999',
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
      const rate = parseFloat((Math.random() * (2.0 - 0.5) + 0.5).toFixed(2));
      dailyRatesData.push({
        date: date,
        investmentClass: className,
        rate: rate,
        processed: true
      });
    }
  }

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

  // System Configuration
  console.log('\\n⚙️ Creating system configuration...');
  await prisma.systemConfig.upsert({
    where: { key: 'REFERRAL_COMMISSION_RATE' },
    update: {},
    create: {
      key: 'REFERRAL_COMMISSION_RATE',
      value: '0.10',
      description: 'Porcentaje de comisión por primer aporte de referido (0.05 = 5%, 0.10 = 10%)'
    }
  });
  console.log('✅ System configuration created');

  // ========================================
  // TEST USERS FOR COMPREHENSIVE TESTING
  // ========================================
  console.log('\\n🧪 Creating test users...');

  const testPassword = await bcrypt.hash('test123', 10);

  // Test User 1: Normal user with 50% progress (no withdrawals)
  const testUser1 = await prisma.user.upsert({
    where: { email: 'test1@example.com' },
    update: {},
    create: {
      email: 'test1@example.com',
      password: testPassword,
      name: 'Test User 1 - 50% Progress',
      username: 'testuser1',
      role: 'USER',
      capitalUSDT: 100,
      currentBalanceUSDT: 150, // $50 profit = 50% progress
      investmentClass: 'BASIC',
      contractStatus: 'ACTIVE',
      cycleCompleted: false,
      currentPlanStartDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      currentPlanExpiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      referralCode: 'TEST1',
      hasFirstDeposit: true,
      passiveIncomeRate: 0.00,
      hasSeenWelcomeModal: true,
      hasSuccessfulReferral: false,
    },
  });

  await prisma.transaction.createMany({
    data: [
      {
        userId: testUser1.id,
        type: 'DEPOSIT',
        amountUSDT: 100,
        status: 'COMPLETED',
        reference: 'Depósito inicial',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        userId: testUser1.id,
        type: 'PROFIT',
        amountUSDT: 50,
        status: 'COMPLETED',
        reference: 'Ganancia acumulada',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ],
  });
  console.log('✅ Created Test User 1 (50% progress):', testUser1.email);

  // Test User 2: User at 150% progress (no withdrawals)
  const testUser2 = await prisma.user.upsert({
    where: { email: 'test2@example.com' },
    update: {},
    create: {
      email: 'test2@example.com',
      password: testPassword,
      name: 'Test User 2 - 150% Progress',
      username: 'testuser2',
      role: 'USER',
      capitalUSDT: 200,
      currentBalanceUSDT: 500, // $300 profit = 150% progress
      investmentClass: 'GOLD',
      contractStatus: 'ACTIVE',
      cycleCompleted: false,
      currentPlanStartDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      currentPlanExpiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      referralCode: 'TEST2',
      hasFirstDeposit: true,
      passiveIncomeRate: 0.00,
      hasSeenWelcomeModal: true,
      hasSuccessfulReferral: false,
    },
  });

  await prisma.transaction.createMany({
    data: [
      {
        userId: testUser2.id,
        type: 'DEPOSIT',
        amountUSDT: 200,
        status: 'COMPLETED',
        reference: 'Depósito inicial',
        createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      },
      {
        userId: testUser2.id,
        type: 'PROFIT',
        amountUSDT: 300,
        status: 'COMPLETED',
        reference: 'Ganancia acumulada',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    ],
  });
  console.log('✅ Created Test User 2 (150% progress):', testUser2.email);

  // Test User 3: CYCLE COMPLETED (200%) with withdrawal history
  const testUser3 = await prisma.user.upsert({
    where: { email: 'test3@example.com' },
    update: {},
    create: {
      email: 'test3@example.com',
      password: testPassword,
      name: 'Test User 3 - Cycle Completed',
      username: 'testuser3',
      role: 'USER',
      capitalUSDT: 100,
      currentBalanceUSDT: 300, // $100 + $150 - $50 + $100 = $300
      investmentClass: 'SILVER',
      contractStatus: 'COMPLETED',
      cycleCompleted: true,
      cycleCompletedAt: new Date(),
      currentPlanStartDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      currentPlanExpiryDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      referralCode: 'TEST3',
      hasFirstDeposit: true,
      passiveIncomeRate: 0.00,
      hasSeenWelcomeModal: true,
      hasSuccessfulReferral: false,
    },
  });

  await prisma.transaction.createMany({
    data: [
      {
        userId: testUser3.id,
        type: 'DEPOSIT',
        amountUSDT: 100,
        status: 'COMPLETED',
        reference: 'Depósito inicial',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      },
      {
        userId: testUser3.id,
        type: 'PROFIT',
        amountUSDT: 150,
        status: 'COMPLETED',
        reference: 'Ganancia acumulada (primera mitad)',
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      },
      {
        userId: testUser3.id,
        type: 'WITHDRAWAL',
        amountUSDT: 50,
        status: 'COMPLETED',
        reference: 'Retiro parcial durante el ciclo',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        userId: testUser3.id,
        type: 'PROFIT',
        amountUSDT: 100,
        status: 'COMPLETED',
        reference: 'Ganancia para alcanzar 200%',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
  });
  console.log('✅ Created Test User 3 (CYCLE COMPLETED with withdrawal history):', testUser3.email);

  // Test User 4: Pending plan selection
  const testUser4 = await prisma.user.upsert({
    where: { email: 'test4@example.com' },
    update: {},
    create: {
      email: 'test4@example.com',
      password: testPassword,
      name: 'Test User 4 - Pending Plan',
      username: 'testuser4',
      role: 'USER',
      capitalUSDT: 75,
      currentBalanceUSDT: 75,
      investmentClass: null,
      contractStatus: 'PENDING_PLAN_SELECTION',
      cycleCompleted: false,
      currentPlanStartDate: null,
      currentPlanExpiryDate: null,
      referralCode: 'TEST4',
      hasFirstDeposit: true,
      passiveIncomeRate: 0.03,
      lastDailyProfitDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      hasSeenWelcomeModal: true,
      hasSuccessfulReferral: false,
    },
  });

  await prisma.transaction.create({
    data: {
      userId: testUser4.id,
      type: 'REINVEST',
      amountUSDT: 75,
      status: 'COMPLETED',
      reference: 'Reinversión - Nuevo ciclo iniciado',
      createdAt: new Date(),
    },
  });
  console.log('✅ Created Test User 4 (Pending plan selection):', testUser4.email);

  // Test User 5: Plan expiring soon
  const testUser5 = await prisma.user.upsert({
    where: { email: 'test5@example.com' },
    update: {},
    create: {
      email: 'test5@example.com',
      password: testPassword,
      name: 'Test User 5 - Plan Expiring',
      username: 'testuser5',
      role: 'USER',
      capitalUSDT: 500,
      currentBalanceUSDT: 650,
      investmentClass: 'PLATINUM',
      contractStatus: 'ACTIVE',
      cycleCompleted: false,
      currentPlanStartDate: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000),
      currentPlanExpiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      lastCommissionChargeDate: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000),
      referralCode: 'TEST5',
      hasFirstDeposit: true,
      passiveIncomeRate: 0.00,
      hasSeenWelcomeModal: true,
      hasSuccessfulReferral: false,
    },
  });

  await prisma.transaction.createMany({
    data: [
      {
        userId: testUser5.id,
        type: 'DEPOSIT',
        amountUSDT: 500,
        status: 'COMPLETED',
        reference: 'Depósito inicial',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        userId: testUser5.id,
        type: 'PROFIT',
        amountUSDT: 150,
        status: 'COMPLETED',
        reference: 'Ganancia acumulada (30% de progreso)',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ],
  });
  console.log('✅ Created Test User 5 (Plan expiring in 3 days):', testUser5.email);

  // ========================================
  // ADDITIONAL TEST USERS FOR SPECIFIC SCENARIOS
  // ========================================

  // Test User: Main test user with GOLD plan and higher capital
  const testUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: testPassword,
      name: 'Test User',
      username: 'maintestuser',
      role: 'USER',
      capitalUSDT: 1000,
      currentBalanceUSDT: 1150,
      investmentClass: 'GOLD',
      contractStatus: 'ACTIVE',
      cycleCompleted: false,
      currentPlanStartDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      currentPlanExpiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      referralCode: 'MAINTEST',
      hasFirstDeposit: true,
      passiveIncomeRate: 0.00,
      hasSeenWelcomeModal: true,
      hasSuccessfulReferral: true, // Has referred someone
    },
  });

  await prisma.transaction.createMany({
    data: [
      {
        userId: testUser.id,
        type: 'DEPOSIT',
        amountUSDT: 1000,
        status: 'COMPLETED',
        reference: 'Depósito inicial',
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      },
      {
        userId: testUser.id,
        type: 'PROFIT',
        amountUSDT: 150,
        status: 'COMPLETED',
        reference: 'Ganancia acumulada',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    ],
  });
  console.log('✅ Created Test User (GOLD plan):', testUser.email);

  // Referred User: User referred by Test User
  const referredUser = await prisma.user.upsert({
    where: { email: 'referred@example.com' },
    update: {},
    create: {
      email: 'referred@example.com',
      password: await bcrypt.hash('referred123', 10),
      name: 'Referred User',
      username: 'referreduser',
      role: 'USER',
      capitalUSDT: 0,
      currentBalanceUSDT: 0,
      investmentClass: null,
      contractStatus: 'PENDING_PLAN_SELECTION',
      cycleCompleted: false,
      referralCode: 'REFUSER',
      referrer: { connect: { id: testUser.id } }, // Referred by Test User
      hasFirstDeposit: false,
      passiveIncomeRate: 0.03,
      hasSeenWelcomeModal: true,
      hasSuccessfulReferral: false,
    },
  });
  console.log('✅ Created Referred User (referred by Test User):', referredUser.email);

  // Collaborator Demo: SUBADMIN user for testing collaborator features
  const collaboratorPassword = await bcrypt.hash('collab123', 10);
  const collaborator = await prisma.user.upsert({
    where: { email: 'collaborator@cloudcapital.com' },
    update: {
      whatsappNumber: '+593977777777',
      btcWithdrawAddress: 'bc1qcollaborator1234567890abcdefghijk',
      collaboratorConfig: {
        commission: 4.0,
        processingTime: '15-45 minutos',
        minAmount: 50,
        maxAmount: 5000
      }
    },
    create: {
      email: 'collaborator@cloudcapital.com',
      password: collaboratorPassword,
      name: 'Collaborator Demo',
      username: 'collaborator',
      role: 'SUBADMIN',
      referralCode: 'COLLAB123',
      whatsappNumber: '+593977777777',
      btcWithdrawAddress: 'bc1qcollaborator1234567890abcdefghijk',
      collaboratorConfig: {
        commission: 4.0,
        processingTime: '15-45 minutos',
        minAmount: 50,
        maxAmount: 5000
      }
    },
  });
  console.log('✅ Created Collaborator Demo:', collaborator.email);

  console.log('\\n🎉 Seeding completed!');
  console.log('\\n📝 Test credentials:');
  console.log('Admin: admin@cloudcapital.com / admin123');
  console.log('Subadmin: subadmin@cloudcapital.com / subadmin123');
  console.log('\\n🧪 Test Users (password: test123):');
  console.log('Test 1 (50% progress): test1@example.com');
  console.log('Test 2 (150% progress): test2@example.com');
  console.log('Test 3 (COMPLETED - 200% with withdrawals): test3@example.com ⭐');
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
