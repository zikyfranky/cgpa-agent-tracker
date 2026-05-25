const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const officeParser = require('officeparser');

const COURSES_ROOT = '/opt/data/courses';

function normalizeCourseCode(dirName) {
  return dirName.replace('FUTM-', '').replace('FUTMINNA-', '').trim().toUpperCase();
}

async function extractFromMd(filePath, userId, courseCode) {
    const content = fs.readFileSync(filePath, 'utf8');
    const sections = content.split(/^#+\s+/gm).filter(s => s.trim().length > 0);
    
    for (const section of sections) {
        const lines = section.split('\n');
        const title = lines[0].trim();
        const body = lines.slice(1).join('\n').trim();
        if (!title) continue;

        await prisma.topic.upsert({
            where: { id: `${filePath}-${title}` },
            update: { content: body },
            create: {
                id: `${filePath}-${title}`,
                userId,
                courseCode,
                title,
                content: body,
                sourceFile: filePath,
                status: 'UNSEEN'
            }
        });
    }
}

async function extractFromPdf(filePath, userId, courseCode) {
    try {
        const data = await officeParser.parseOffice(filePath);
        // officeParser returns a complex object when parsing PDF sometimes, let's reach for the text
        let text = "";
        if (typeof data === 'string') {
            text = data;
        } else if (data && data.content) {
            // It's the rich object from the log
            text = data.content.map(page => page.text).join('\n');
        } else {
            text = JSON.stringify(data);
        }
        
        const title = path.basename(filePath, '.pdf');
        
        await prisma.topic.upsert({
            where: { id: `${filePath}-${title}` },
            update: { content: text },
            create: {
                id: `${filePath}-${title}`,
                userId,
                courseCode,
                title,
                content: text,
                sourceFile: filePath,
                status: 'UNSEEN'
            }
        });
    } catch (e) {
        console.error(`Failed PDF: ${filePath}`, e.message);
    }
}

async function extractFromDocx(filePath, userId, courseCode) {
    try {
        const result = await mammoth.extractRawText({path: filePath});
        const text = result.value;
        const title = path.basename(filePath, '.docx');
        
        await prisma.topic.upsert({
            where: { id: `${filePath}-${title}` },
            update: { content: text },
            create: {
                id: `${filePath}-${title}`,
                userId,
                courseCode,
                title,
                content: text,
                sourceFile: filePath,
                status: 'UNSEEN'
            }
        });
    } catch (e) {
        console.error(`Failed DOCX: ${filePath}`, e.message);
    }
}

async function walk(dir, callback) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        const stat = fs.statSync(filepath);
        if (stat.isDirectory()) {
            await walk(filepath, callback);
        } else {
            await callback(filepath);
        }
    }
}

async function run() {
    const user = await prisma.user.findFirst();
    if (!user) throw new Error("No user found");

    console.log("Compounding Knowledge from /opt/data/courses...");
    const levels = fs.readdirSync(COURSES_ROOT).filter(d => d.match(/\d+L/));
    
    for (const level of levels) {
        const levelPath = path.join(COURSES_ROOT, level);
        const semesters = fs.readdirSync(levelPath).filter(d => d.includes('st') || d.includes('nd') || d.toLowerCase().includes('semester'));
        
        for (const semester of semesters) {
            const semPath = path.join(levelPath, semester);
            if (!fs.statSync(semPath).isDirectory()) continue;
            
            const courses = fs.readdirSync(semPath);
            for (const courseDir of courses) {
                const coursePath = path.join(semPath, courseDir);
                if (!fs.statSync(coursePath).isDirectory()) continue;
                
                const courseCode = normalizeCourseCode(courseDir);
                process.stdout.write(`Index: ${courseCode} `);
                
                await walk(coursePath, async (filePath) => {
                    const ext = path.extname(filePath).toLowerCase();
                    if (ext === '.md') await extractFromMd(filePath, user.id, courseCode);
                    else if (ext === '.pdf') await extractFromPdf(filePath, user.id, courseCode);
                    else if (ext === '.docx') await extractFromDocx(filePath, user.id, courseCode);
                });
            }
            console.log("");
        }
    }
    console.log('Knowledge Compounding complete.');
}

run().catch(console.error).finally(() => prisma.$disconnect());
