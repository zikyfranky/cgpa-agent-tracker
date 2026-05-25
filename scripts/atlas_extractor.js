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

async function extractFromMd(filePath, userId, courseCode, level, semester) {
    const content = fs.readFileSync(filePath, 'utf8');
    const sections = content.split(/^#+\s+/gm).filter(s => s.trim().length > 0);
    
    for (const section of sections) {
        const lines = section.split('\n');
        const title = lines[0].trim();
        const body = lines.slice(1).join('\n').trim();
        if (!title) continue;

        await prisma.topic.upsert({
            where: { id: `${filePath}-${title}` },
            update: { content: body, level, semester },
            create: {
                id: `${filePath}-${title}`,
                userId,
                courseCode,
                title,
                content: body,
                sourceFile: filePath,
                status: 'UNSEEN',
                level,
                semester
            }
        });
    }
}

async function extractFromPdf(filePath, userId, courseCode, level, semester) {
    try {
        const data = await officeParser.parseOffice(filePath);
        let text = "";
        if (typeof data === 'string') {
            text = data;
        } else if (data && data.content) {
            text = data.content.map(page => page.text).join('\n');
        } else {
            text = JSON.stringify(data);
        }
        
        const title = path.basename(filePath, '.pdf');
        
        await prisma.topic.upsert({
            where: { id: `${filePath}-${title}` },
            update: { content: text, level, semester },
            create: {
                id: `${filePath}-${title}`,
                userId,
                courseCode,
                title,
                content: text,
                sourceFile: filePath,
                status: 'UNSEEN',
                level,
                semester
            }
        });
    } catch (e) {
        console.error(`Failed PDF: ${filePath}`, e.message);
    }
}

async function extractFromDocx(filePath, userId, courseCode, level, semester) {
    try {
        const result = await mammoth.extractRawText({path: filePath});
        const text = result.value;
        const title = path.basename(filePath, '.docx');
        
        await prisma.topic.upsert({
            where: { id: `${filePath}-${title}` },
            update: { content: text, level, semester },
            create: {
                id: `${filePath}-${title}`,
                userId,
                courseCode,
                title,
                content: text,
                sourceFile: filePath,
                status: 'UNSEEN',
                level,
                semester
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
        const semesterDirs = fs.readdirSync(levelPath).filter(d => d.includes('st') || d.includes('nd') || d.toLowerCase().includes('semester'));
        
        for (const semesterDir of semesterDirs) {
            const semPath = path.join(levelPath, semesterDir);
            if (!fs.statSync(semPath).isDirectory()) continue;
            
            let semester = "First Semester";
            if (semesterDir.includes('2') || semesterDir.includes('nd') || semesterDir.toLowerCase().includes('second')) {
                semester = "Second Semester";
            }

            const courses = fs.readdirSync(semPath);
            for (const courseDir of courses) {
                const coursePath = path.join(semPath, courseDir);
                if (!fs.statSync(coursePath).isDirectory()) continue;
                
                const courseCode = normalizeCourseCode(courseDir);
                const levelInt = parseInt(level.replace('L', ''));
                process.stdout.write(`Index: ${courseCode} (${levelInt} ${semester}) `);
                
                let fileCount = 0;
                await walk(coursePath, async (filePath) => {
                    const ext = path.extname(filePath).toLowerCase();
                    if (['.md', '.pdf', '.docx'].includes(ext)) {
                        fileCount++;
                        if (ext === '.md') await extractFromMd(filePath, user.id, courseCode, levelInt, semester);
                        else if (ext === '.pdf') await extractFromPdf(filePath, user.id, courseCode, levelInt, semester);
                        else if (ext === '.docx') await extractFromDocx(filePath, user.id, courseCode, levelInt, semester);
                    }
                });

                if (fileCount === 0) {
                    await prisma.topic.upsert({
                        where: { id: `GHOST-${courseCode}-${levelInt}-${semester}` },
                        update: { level: levelInt, semester: semester },
                        create: {
                            id: `GHOST-${courseCode}-${levelInt}-${semester}`,
                            userId: user.id,
                            courseCode,
                            title: "Course Directory Initialized",
                            content: null,
                            status: "UNSEEN",
                            level: levelInt,
                            semester: semester
                        }
                    });
                }
            }
            console.log("");
        }
    }
    console.log('Knowledge Compounding complete.');
}

run().catch(console.error).finally(() => prisma.$disconnect());
