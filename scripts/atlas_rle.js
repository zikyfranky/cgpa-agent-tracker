const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

const COURSES_ROOT = '/opt/data/courses/';

// 1. Recursive crawler focused strictly on valid study paths
function getStudyPaths(dir) {
    let results = [];
    const stats = fs.statSync(dir);
    if (!stats.isDirectory()) return results;
    
    const items = fs.readdirSync(dir);
    for (const item of items) {
        if (item === '.DS_Store' || item.startsWith('.')) continue;
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        // We only care about: /LevelL/Semester/CourseCode/
        if (stat.isDirectory()) {
            if (dir === COURSES_ROOT) { // Level level
                 results = results.concat(getStudyPaths(fullPath));
            } else {
                 const depth = fullPath.split('/').filter(Boolean).length;
                 const rootDepth = COURSES_ROOT.split('/').filter(Boolean).length;
                 if (depth - rootDepth <= 3) { // Inside Level/Semester/CourseCode
                    results = results.concat(getStudyPaths(fullPath));
                 }
            }
        } else {
            if (['.pdf', '.docx', '.md'].includes(path.extname(fullPath).toLowerCase())) {
                results.push(fullPath);
            }
        }
    }
    return results;
}

// 2. Intelligence: Concept Extraction
async function extractConcepts(filePath) {
    let text = "";
    const ext = path.extname(filePath).toLowerCase();
    
    try {
        if (ext === '.pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            text = data.text;
        } else if (ext === '.docx') {
            const res = await mammoth.extractRawText({ path: filePath });
            text = res.value;
        } else if (ext === '.md') {
            text = fs.readFileSync(filePath, 'utf8');
        }

        // Logic: Find large blocks of text or headers to use as "Concepts"
        // For physics/geophysics, topics are often numbered or start with capitalized words
        const lines = text.split('\n')
            .map(l => l.trim())
            .filter(l => l.length > 20 && l.length < 150) // Filter for header-like sentences
            .filter(l => /^[A-Z]/.test(l)); // Must start with capital letter

        // Pick distinct key concepts (Max 8 per file to prevent noise)
        const concepts = Array.from(new Set(lines)).slice(0, 8);
        return concepts;
    } catch (e) {
        console.error(`Parsing failed for ${filePath}`);
        return [];
    }
}

async function run() {
    const user = await prisma.user.findFirst();
    const files = getStudyPaths(COURSES_ROOT);
    console.log(`Crawl phase complete. Analyzing ${files.length} documents...`);

    for (const file of files) {
        const parts = file.split('/');
        const courseCode = parts[parts.length - 2];
        const concepts = await extractConcepts(file);
        
        console.log(`Course: ${courseCode} | Found ${concepts.length} concepts in ${path.basename(file)}`);

        for (const concept of concepts) {
            await prisma.topic.upsert({
                where: { id: `${courseCode}-${concept}`.substring(0, 190) },
                update: {},
                create: {
                   id: `${courseCode}-${concept}`.substring(0, 190),
                   userId: user.id,
                   courseCode: courseCode,
                   title: concept,
                   sourceFile: file,
                   status: 'UNSEEN',
                   difficulty: 3
                }
            });
        }
    }
    console.log('Atlas Recursive Learning Engine has mapped the core concepts.');
}

run().catch(console.error).finally(() => prisma.$disconnect());
