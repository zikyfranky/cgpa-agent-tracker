
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function main() {
  const rawData = fs.readFileSync(path.join(__dirname, '../data/academic_records.json'), 'utf8');
  const data = JSON.parse(rawData);
  
  const user = await prisma.user.upsert({
    where: { matricNumber: 'ISAAC-001' },
    update: {},
    create: { matricNumber: 'ISAAC-001', role: 'STUDENT', targetCgpa: 3.5 }
  });

  console.log('Seeding courses from 100L to 500L...');

  for (const [levelStr, levelData] of Object.entries(data.levels)) {
    const level = parseInt(levelStr);
    for (const [semester, semData] of Object.entries(levelData.semesters)) {
      for (const course of semData.courses) {
        // Upsert course result placeholders
        await prisma.result.upsert({
          where: {
            userId_courseCode_level_semester: {
              userId: user.id,
              courseCode: course.code,
              level: level,
              semester: semester
            }
          },
          update: {
            courseName: course.title,
            grade: 'PENDING',
            gradePoint: 0
          },
          create: {
            userId: user.id,
            courseCode: course.code,
            courseName: course.title,
            level: level,
            semester: semester,
            grade: 'PENDING',
            gradePoint: 0
          }
        });
      }
    }
  }

  // Restore the historical grades I know about from the previous DB check
  const history = [
    { code: 'GEY101', grade: 'D', gp: 2, ca: 14, exam: 33 },
    { code: 'CHM101', grade: 'C', gp: 3, ca: 17, exam: 38 },
    { code: 'FUTM-GPH112', grade: 'B', gp: 4, ca: 20, exam: 45 },
    { code: 'COS101', grade: 'A', gp: 5, ca: 26, exam: 59 },
    { code: 'PHY101', grade: 'B', gp: 4, ca: 20, exam: 45 },
    { code: 'MTH101', grade: 'D', gp: 2, ca: 14, exam: 33 },
    { code: 'CHM107', grade: 'C', gp: 3, ca: 17, exam: 38 },
    { code: 'PHY107', grade: 'B', gp: 4, ca: 20, exam: 45 },
    { code: 'MTH102', grade: 'A', gp: 5, ca: 26, exam: 59 },
    { code: 'PHY102', grade: 'A', gp: 5, ca: 26, exam: 59 },
    { code: 'PHY108', grade: 'A', gp: 5, ca: 26, exam: 59 },
    { code: 'GST112', grade: 'B', gp: 4, ca: 20, exam: 45 },
    { code: 'CHM102', grade: 'C', gp: 3, ca: 17, exam: 38 },
    { code: 'GEY102', grade: 'C', gp: 3, ca: 17, exam: 38 },
    { code: 'FUTM-GPH101', grade: 'B', gp: 4, ca: 20, exam: 45 },
    { code: 'FUTM-GPH103', grade: 'B', gp: 4, ca: 20, exam: 45 },
    { code: 'FUTM-GPH203', grade: 'F', gp: 0, ca: 6, exam: 14 },
    { code: 'FUTM-GPH213', grade: 'A', gp: 5, ca: 26, exam: 59 },
    { code: 'GPH211', grade: 'E', gp: 1, ca: 13, exam: 29 },
    { code: 'PHY205', grade: 'C', gp: 3, ca: 17, exam: 38 },
    { code: 'FUTM-GEY211', grade: 'C', gp: 3, ca: 17, exam: 38 },
    { code: 'GPH201', grade: 'C', gp: 3, ca: 17, exam: 38 },
    { code: 'ENT211', grade: 'B', gp: 4, ca: 20, exam: 45 },
    { code: 'PHY207', grade: 'C', gp: 3, ca: 17, exam: 38 },
    { code: 'GST212', grade: 'B', gp: 4, ca: 20, exam: 45 },
    { code: 'PHY208', grade: 'A', gp: 5, ca: 26, exam: 59 },
    { code: 'GEY210', grade: 'E', gp: 1, ca: 13, exam: 29 },
    { code: 'FUTM-GPH223', grade: 'D', gp: 2, ca: 14, exam: 33 },
    { code: 'FUTM-GPH221', grade: 'B', gp: 4, ca: 20, exam: 45 },
    { code: 'GEY212', grade: 'C', gp: 3, ca: 17, exam: 38 },
    { code: 'PHY204', grade: 'D', gp: 2, ca: 14, exam: 33 }
  ];

  for (const h of history) {
    await prisma.result.updateMany({
      where: { userId: user.id, courseCode: h.code },
      data: {
        grade: h.grade,
        gradePoint: h.gp,
        caScore: h.ca,
        examScore: h.exam
      }
    });
  }

  console.log('Database synced with full course list and historical grades.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
