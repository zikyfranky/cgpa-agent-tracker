const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { matricNumber: '2023/1/94364PH' } });
  if (!user) return console.log('User not found');

  const schedule = [
    { code: 'GPH312', day: 'Monday', start: '09:00', end: '11:00', loc: 'LT1' },
    { code: 'FUTM-GPH321', day: 'Monday', start: '11:00', end: '13:00', loc: 'LT1' },
    { code: 'GPH308', day: 'Tuesday', start: '09:00', end: '11:00', loc: 'LT1' },
    { code: 'GPH322', day: 'Tuesday', start: '11:00', end: '13:00', loc: 'LT1' },
    { code: 'GPH398', day: 'Wednesday', start: '09:00', end: '11:00', loc: 'Field' },
    { code: 'ENT312', day: 'Thursday', start: '11:00', end: '13:00', loc: 'ENT' }
  ];

  for (const item of schedule) {
    await prisma.timetable.create({
      data: {
        userId: user.id,
        courseCode: item.code,
        day: item.day,
        startTime: item.start,
        endTime: item.end,
        location: item.loc
      }
    });
  }
  console.log('Timetable seeded.');
}
main().catch(console.error).finally(() => prisma.$disconnect());
