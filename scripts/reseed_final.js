
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function main() {
  const data = JSON.parse(fs.readFileSync('data/course_catalog.json', 'utf8'));
  const user = await prisma.user.upsert({
    where: { matricNumber: 'ISAAC-001' },
    update: {},
    create: { matricNumber: 'ISAAC-001', role: 'STUDENT', targetCgpa: 3.5 }
  });

  // Wiping current results for a clean fresh start from catalog
  await prisma.result.deleteMany({ where: { userId: user.id } });

  console.log('Seeding strict 100L-500L catalog into DB...');

  for (const [levelStr, levelData] of Object.entries(data.levels)) {
    const level = parseInt(levelStr);
    for (const [semester, semData] of Object.entries(levelData.semesters)) {
      for (const course of semData.courses) {
        await prisma.result.create({
          data: {
            userId: user.id,
            courseCode: course.code,
            courseName: course.title,
            level: level,
            semester: semester,
            units: course.units, // Added units field
            grade: 'PENDING',
            gradePoint: 0
          }
        });
      }
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
