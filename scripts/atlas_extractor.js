     1|const { PrismaClient } = require('@prisma/client');
     2|const prisma = new PrismaClient();
     3|const fs = require('fs');
     4|const path = require('path');
     5|const mammoth = require('mammoth');
     6|const officeParser = require('officeparser');
     7|
     8|const COURSES_ROOT = '/opt/data/courses';
     9|
    10|function normalizeCourseCode(dirName) {
    11|  return dirName.replace('FUTM-', '').replace('FUTMINNA-', '').trim().toUpperCase();
    12|}
    13|
    14|async function extractFromMd(filePath, userId, courseCode, level, semester) {
    15|    const content = fs.readFileSync(filePath, 'utf8');
    16|    const sections = content.split(/^#+\s+/gm).filter(s => s.trim().length > 0);
    17|    
    18|    for (const section of sections) {
    19|        const lines = section.split('\n');
    20|        const title = lines[0].trim();
    21|        const body = lines.slice(1).join('\n').trim();
    22|        if (!title) continue;
    23|
    24|        await prisma.topic.upsert({
    25|            where: { id: `${filePath}-${title}` },
    26|            update: { content: body, level, semester },
    27|            create: {
    28|                id: `${filePath}-${title}`,
    29|                userId,
    30|                courseCode,
    31|                title,
    32|                content: body,
    33|                sourceFile: filePath,
    34|                status: 'UNSEEN',
    35|                level,
    36|                semester
    37|            }
    38|        });
    39|    }
    40|}
    41|
    42|async function extractFromPdf(filePath, userId, courseCode, level, semester) {
    43|    try {
    44|        const data = await officeParser.parseOffice(filePath);
    45|        let text = "";
    46|        if (typeof data === 'string') {
    47|            text = data;
    48|        } else if (data && data.content) {
    49|            text = data.content.map(page => page.text).join('\n');
    50|        } else {
    51|            text = JSON.stringify(data);
    52|        }
    53|        
    54|        const title = path.basename(filePath, '.pdf');
    55|        
    56|        await prisma.topic.upsert({
    57|            where: { id: `${filePath}-${title}` },
    58|            update: { content: text, level, semester },
    59|            create: {
    60|                id: `${filePath}-${title}`,
    61|                userId,
    62|                courseCode,
    63|                title,
    64|                content: text,
    65|                sourceFile: filePath,
    66|                status: 'UNSEEN',
    67|                level,
    68|                semester
    69|            }
    70|        });
    71|    } catch (e) {
    72|        console.error(`Failed PDF: ${filePath}`, e.message);
    73|    }
    74|}
    75|
    76|async function extractFromDocx(filePath, userId, courseCode, level, semester) {
    77|    try {
    78|        const result = await mammoth.extractRawText({path: filePath});
    79|        const text = result.value;
    80|        const title = path.basename(filePath, '.docx');
    81|        
    82|        await prisma.topic.upsert({
    83|            where: { id: `${filePath}-${title}` },
    84|            update: { content: text, level, semester },
    85|            create: {
    86|                id: `${filePath}-${title}`,
    87|                userId,
    88|                courseCode,
    89|                title,
    90|                content: text,
    91|                sourceFile: filePath,
    92|                status: 'UNSEEN',
    93|                level,
    94|                semester
    95|            }
    96|        });
    97|    } catch (e) {
    98|        console.error(`Failed DOCX: ${filePath}`, e.message);
    99|    }
   100|}
   101|
   102|async function walk(dir, callback) {
   103|    const files = fs.readdirSync(dir);
   104|    for (const file of files) {
   105|        const filepath = path.join(dir, file);
   106|        const stat = fs.statSync(filepath);
   107|        if (stat.isDirectory()) {
   108|            await walk(filepath, callback);
   109|        } else {
   110|            await callback(filepath);
   111|        }
   112|    }
   113|}
   114|
   115|async function run() {
   116|    const user = await prisma.user.findFirst();
   117|    if (!user) throw new Error("No user found");
   118|
   119|    console.log("Compounding Knowledge from /opt/data/courses...");
   120|    const levels = fs.readdirSync(COURSES_ROOT).filter(d => d.match(/\d+L/));
   121|    
   122|    for (const level of levels) {
   123|        const levelPath = path.join(COURSES_ROOT, level);
   124|        const semesterDirs = fs.readdirSync(levelPath).filter(d => d.includes('st') || d.includes('nd') || d.toLowerCase().includes('semester'));
   125|        
   126|        for (const semesterDir of semesterDirs) {
   127|            const semPath = path.join(levelPath, semesterDir);
   128|            if (!fs.statSync(semPath).isDirectory()) continue;
   129|            
   130|            // Normalize semester string for DB matching
   131|            let semester = "First Semester";
   132|            if (semesterDir.includes('2') || semesterDir.includes('nd') || semesterDir.toLowerCase().includes('second')) {
   133|                semester = "Second Semester";
   134|            }
   135|
   136|            const courses = fs.readdirSync(semPath);
   137|            for (const courseDir of courses) {
   138|                const coursePath = path.join(semPath, courseDir);
   139|                if (!fs.statSync(coursePath).isDirectory()) continue;
   140|                
   141|                const courseCode = normalizeCourseCode(courseDir);
   142|                const levelInt = parseInt(level.replace('L', ''));
   143|                process.stdout.write(`Index: ${courseCode} (${levelInt} ${semester}) `);
   144|                
   145|                await walk(coursePath, async (filePath) => {
   146|                    const ext = path.extname(filePath).toLowerCase();
   147|                    if (ext === '.md') await extractFromMd(filePath, user.id, courseCode, levelInt, semester);
   148|                    else if (ext === '.pdf') await extractFromPdf(filePath, user.id, courseCode, levelInt, semester);
   149|                    else if (ext === '.docx') await extractFromDocx(filePath, user.id, courseCode, levelInt, semester);
   150|                });
   151|            }
   152|            console.log("");
   153|        }
   154|    }
   155|    console.log('Knowledge Compounding complete.');
   156|}
   157|
   158|run().catch(console.error).finally(() => prisma.$disconnect());
   159|