import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Try to connect
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Count users
    const userCount = await prisma.user.count();
    console.log(`📊 Users in database: ${userCount}`);
    
    // Disconnect
    await prisma.$disconnect();
    console.log('👋 Disconnected from database');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('\n💡 Make sure:');
    console.error('   1. PostgreSQL is running');
    console.error('   2. DATABASE_URL is set in .env file');
    console.error('   3. Database migrations have been run (npx prisma migrate dev)');
    process.exit(1);
  }
}

testConnection();
