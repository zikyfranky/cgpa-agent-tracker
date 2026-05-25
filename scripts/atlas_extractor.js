const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

async function extractFromMd(filePath, userId, courseCode) {
    const content = fs.readFileSync(filePath, 'utf8');
    const headers = content.match(/^#+\s+.+$/gm) || [];
    for (const header of headers) {
        const title = header.replace(/^#+\s+/, '').trim();
        await prisma.topic.upsert({
            where: { id: `${filePath}-${title}` },
            update: { status: 'UNSEEN' },
            create: {
                id: `${filePath}-${title}`,
                userId,
                courseCode,
                title,
                sourceFile: filePath,
                status: 'UNSEEN'
            }
        });
    }
}

async function extractFromPdf(filePath, userId, courseCode) {
    const dataBuffer = fs.readFileSync(filePath);
    try {
        const data = await pdf(dataBuffer, { max: 1 }); // Just the first page for metadata
        const text = data.text;
        // Search for lines like "Lecture 1", "Module 1", or first bold line
        const lines = text.split('\n').filter(l => l.trim().length > 5).slice(0, 5);
        for (const line of lines) {
            const title = line.trim().substring(0, 100);
            await prisma.topic.upsert({
                where: { id: `${filePath}-${title}` },
                update: {},
                create: {
                    id: `${filePath}-${title}`,
                    userId,
                    courseCode,
                    title,
                    sourceFile: filePath,
                    status: 'UNSEEN'
                }
            });
        }
    } catch (e) {
        console.log(`Failed PDF: ${filePath}`);
    }
}

async function run() {
    const user = await prisma.user.findFirst();
    const topics = await prisma.topic.findMany({ where: { status: 'UNSEEN' } });
    
    console.log(`Processing ${topics.length} source documents for deep extraction...`);

    for (const topic of topics) {
        const ext = path.extname(topic.sourceFile).toLowerCase();
        if (ext === '.md') await extractFromMd(topic.sourceFile, user.id, topic.courseCode);
        // else if (ext === '.pdf') await extractFromPdf(topic.sourceFile, user.id, topic.courseCode); // Enable if pdf-parse is ready
    }
    console.log('Extraction complete.');
}

run().catch(console.error).finally(() => prisma.$disconnect());
