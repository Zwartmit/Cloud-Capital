import prisma from '../config/database.js';

async function main() {
  const email = 'admin@cloudcapital.com';
  const referralCode = 'ADMIN123';

  console.log(`Updating user ${email} with referral code ${referralCode}...`);

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { referralCode },
    });
    console.log('User updated:', user);
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
