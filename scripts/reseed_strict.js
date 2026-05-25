
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function main() {
  const data = JSON.parse(fs.readFileSync('data/academic_records.json', 'utf8'));
  
  const user = await prisma.user.upsert({
    where: { matricNumber: 'ISAAC-001' },
    update: {},
    create: { matricNumber: 'ISAAC-001', role: 'STUDENT', targetCgpa: 3.5 }
  });

  // Wipe current results to ensure zero contamination from previous mock grades
  await prisma.result.deleteMany({ where: { userId: user.id } });

  console.log('Seeding strict course list (no results/grades)...');

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
            grade: 'PENDING',
            gradePoint: 0,
            caScore: null,
            examScore: null
          }
        });
      }
    }
  }
  console.log('Database now reflects the course list strictly.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
