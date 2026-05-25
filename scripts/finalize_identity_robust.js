
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  
  const oldUser = users.find(u => u.matricNumber === '2023/1/94364PH');
  const newUser = users.find(u => u.matricNumber === 'ISAAC-001');

  if (oldUser && newUser) {
    console.log('Robust cleanup: purging old user results...');
    await prisma.result.deleteMany({ where: { userId: oldUser.id } });
    await prisma.userState.deleteMany({ where: { userId: oldUser.id } });
    await prisma.timetable.deleteMany({ where: { userId: oldUser.id } });
    await prisma.topic.deleteMany({ where: { userId: oldUser.id } });
    
    console.log('Purging old user account...');
    await prisma.user.delete({ where: { id: oldUser.id } });
    
    console.log('Switching newUser to official matric...');
    await prisma.user.update({
      where: { id: newUser.id },
      data: { matricNumber: '2023/1/94364PH' }
    });
    console.log('Data Stabilization Complete.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
