const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

const COURSES_ROOT = '/opt/data/courses/';

// Walk through directories recursively
function walk(dir, filelist = []) {
  if (!fs.existsSync(dir)) return filelist;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      filelist = walk(filepath, filelist);
    } else {
      if (file.endsWith('.pdf') || file.endsWith('.docx') || file.endsWith('.md')) {
        filelist.push(filepath);
      }
    }
  });
  return filelist;
}

async function run() {
  const user = await prisma.user.findFirst();
  if (!user) return console.log('User not found.');

  console.log('Starting Atlas Crawl...');
  const allFiles = walk(COURSES_ROOT);
  console.log(`Found ${allFiles.length} relevant documents.`);

  for (const filePath of allFiles) {
    const parts = filePath.split('/');
    const fileName = parts.pop();
    // Assuming structure .../CourseCode/fileName.ext
    const courseCode = parts[parts.length - 1];
    
    // Create topic node for each file
    await prisma.topic.upsert({
      where: { id: filePath }, 
      update: { title: fileName, sourceFile: filePath },
      create: {
        id: filePath,
        userId: user.id,
        courseCode: courseCode,
        title: fileName,
        sourceFile: filePath,
        status: 'UNSEEN',
        difficulty: 3
      }
    });
  }

  console.log('Atlas Seeding Complete.');
}

run().catch(console.error).finally(() => prisma.$disconnect());
