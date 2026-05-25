
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ include: { results: true } });
  
  const oldUser = users.find(u => u.matricNumber === '2023/1/94364PH');
  const newUser = users.find(u => u.matricNumber === 'ISAAC-001');

  if (!oldUser || !newUser) {
    console.log('User source missing. Old:', !!oldUser, 'New:', !!newUser);
    return;
  }

  console.log('Merging ' + oldUser.results.length + ' historical records into catalog user...');

  for (const gradeEntry of oldUser.results) {
    // Find the matching course in the new catalog user's record
    const catalogMatch = newUser.results.find(r => r.courseCode === gradeEntry.courseCode);
    
    if (catalogMatch) {
      console.log('Updating ' + gradeEntry.courseCode + ' with grade ' + gradeEntry.grade);
      await prisma.result.update({
        where: { id: catalogMatch.id },
        data: {
          grade: gradeEntry.grade,
          gradePoint: gradeEntry.gradePoint,
          caScore: gradeEntry.caScore,
          examScore: gradeEntry.examScore
        }
      });
    } else {
      // If a historical course isn't in the catalog, add it anyway to preserve history
      console.log('Legacy course found: ' + gradeEntry.courseCode + '. Adding to catalog...');
      await prisma.result.create({
        data: {
          userId: newUser.id,
          courseCode: gradeEntry.courseCode,
          courseName: gradeEntry.courseName || 'Legacy Course',
          level: gradeEntry.level,
          semester: gradeEntry.semester,
          units: 2, // Default for unseen historical credits
          grade: gradeEntry.grade,
          gradePoint: gradeEntry.gradePoint,
          caScore: gradeEntry.caScore,
          examScore: gradeEntry.examScore
        }
      });
    }
  }

  // Final Cleanup: Update new user to your real matric and wipe old account
  console.log('Finalizing single user identity...');
  await prisma.user.update({
    where: { id: newUser.id },
    data: { matricNumber: '2023/1/94364PH' }
  });

  await prisma.user.delete({ where: { id: oldUser.id } });
  
  console.log('Data cleanup and migration complete.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
