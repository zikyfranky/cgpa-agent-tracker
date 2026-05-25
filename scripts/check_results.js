
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const results = await prisma.result.findMany({
    orderBy: [
      { level: 'asc' },
      { semester: 'asc' }
    ]
  });
  console.log(JSON.stringify(results));
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
