
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  
  const oldUser = users.find(u => u.matricNumber === '2023/1/94364PH');
  const newUser = users.find(u => u.matricNumber === 'ISAAC-001');

  if (oldUser && newUser) {
    console.log('Finalizing cleanup sequence...');
    // Delete the old one because results were already merged into newUser in previous step
    await prisma.user.delete({ where: { id: oldUser.id } });
    
    // Now update the newUser to the correct matric (unique constraint will pass now)
    await prisma.user.update({
      where: { id: newUser.id },
      data: { matricNumber: '2023/1/94364PH' }
    });
    console.log('User identity stabilized: 2023/1/94364PH');
  } else if (newUser) {
    // If old was already deleted, just ensure matric is correct
    await prisma.user.update({
      where: { id: newUser.id },
      data: { matricNumber: '2023/1/94364PH' }
    });
    console.log('User identity verified.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
