
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const rawGrades = {"100-Second Semester-CHM102":{"grade":"C","ca":17,"exam":38},"100-Second Semester-GEY102":{"grade":"C","ca":17,"exam":38},"100-Second Semester-PHY108":{"grade":"A","ca":26,"exam":59},"100-Second Semester-GST112":{"grade":"B","ca":20,"exam":45},"100-Second Semester-PHY102":{"grade":"A","ca":26,"exam":59},"100-Second Semester-GPH103":{"grade":"B"},"100-Second Semester-GPH101":{"grade":"B"},"100-Second Semester-FUTM-GPH101":{"grade":"B","ca":20,"exam":45},"100-Second Semester-FUTM-GPH103":{"grade":"B","ca":20,"exam":45},"100-Second Semester-MTH102":{"grade":"A","ca":26,"exam":59},"200-Second Semester-GST212":{"grade":"B","ca":20,"exam":45},"200-Second Semester-PHY208":{"grade":"A","ca":26,"exam":59},"200-Second Semester-GEY210":{"grade":"E","ca":13,"exam":29},"200-Second Semester-FUTM-GPH223":{"grade":"D","ca":14,"exam":33},"200-Second Semester-FUTM-GPH221":{"grade":"B","ca":20,"exam":45},"200-Second Semester-GEY212":{"grade":"C","ca":17,"exam":38},"200-Second Semester-PHY204":{"grade":"D","ca":14,"exam":33},"200-First Semester-FUTM-GPH203":{"grade":"B","ca":20,"exam":45},"100-First Semester-GEY101":{"grade":"D","ca":14,"exam":33},"100-First Semester-CHM101":{"grade":"C","ca":17,"exam":38},"100-First Semester-FUTM-GPH112":{"grade":"B","ca":20,"exam":45},"100-First Semester-COS101":{"grade":"A","ca":26,"exam":59},"100-First Semester-PHY101":{"grade":"B","ca":20,"exam":45},"100-First Semester-MTH101":{"grade":"D","ca":14,"exam":33},"100-First Semester-PHY107":{"grade":"B","ca":20,"exam":45},"100-First Semester-CHM107":{"grade":"C","ca":17,"exam":38},"200-First Semester-FUTM-GPH213":{"grade":"A","ca":26,"exam":59},"200-First Semester-GPH211":{"grade":"E","ca":13,"exam":29},"200-First Semester-PHY205":{"grade":"C","ca":17,"exam":38},"200-First Semester-FUTM-GEY211":{"grade":"C","ca":17,"exam":38},"200-First Semester-GPH201":{"grade":"C","ca":17,"exam":38},"200-First Semester-ENT211":{"grade":"B","ca":20,"exam":45},"200-First Semester-PHY207":{"grade":"C","ca":17,"exam":38},"100-First Semester-GST111":{"grade":"B","ca":20,"exam":45},"300-First Semester-FUTM-GPH314":{"ca":0,"grade":"F","exam":0},"300-First Semester-FUTM-GPH311":{"ca":18,"grade":"F","exam":0}};

async function main() {
  const user = await prisma.user.findUnique({ where: { matricNumber: '2023/1/94364PH' } });
  if (!user) throw new Error('User not found');

  console.log('Ingesting grades from backup dump...');
  
  const gradePoints = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'F': 0 };

  for (const [key, info] of Object.entries(rawGrades)) {
    const parts = key.split('-');
    // Key format can be messy, let's target CourseCode
    const courseCode = parts.length > 2 ? parts[2] : parts[parts.length-1];
    
    const semesterPart = key.includes('First Semester') ? 'First Semester' : 'Second Semester';
    const levelPart = parseInt(key.split('-')[0]);

    const existing = await prisma.result.findFirst({
        where: { userId: user.id, courseCode, level: levelPart, semester: semesterPart }
    });

    if (existing) {
        await prisma.result.update({
            where: { id: existing.id },
            data: {
                grade: info.grade,
                gradePoint: gradePoints[info.grade] || 0,
                caScore: info.ca || null,
                examScore: info.exam || null
            }
        });
        console.log('Restored: ' + courseCode + ' (' + info.grade + ')');
    }
  }
  console.log('High-fidelity Grade Restore Complete.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
