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
    26|            update: { content: body },
    27|            create: {
                level,
                semester,
    28|                id: `${filePath}-${title}`,
    29|                userId,
    30|                courseCode,
    31|                title,
    32|                content: body,
    33|                sourceFile: filePath,
    34|                status: 'UNSEEN'
    35|            }
    36|        });
    37|    }
    38|}
    39|
    40|async function extractFromPdf(filePath, userId, courseCode, level, semester) {
    41|    try {
    42|        const data = await officeParser.parseOffice(filePath);
    43|        // officeParser returns a complex object when parsing PDF sometimes, let's reach for the text
    44|        let text = "";
    45|        if (typeof data === 'string') {
    46|            text = data;
    47|        } else if (data && data.content) {
    48|            // It's the rich object from the log
    49|            text = data.content.map(page => page.text).join('\n');
    50|        } else {
    51|            text = JSON.stringify(data);
    52|        }
    53|        
    54|        const title = path.basename(filePath, '.pdf');
    55|        
    56|        await prisma.topic.upsert({
    57|            where: { id: `${filePath}-${title}` },
    58|            update: { content: text },
    59|            create: {
                level,
                semester,
    60|                id: `${filePath}-${title}`,
    61|                userId,
    62|                courseCode,
    63|                title,
    64|                content: text,
    65|                sourceFile: filePath,
    66|                status: 'UNSEEN'
    67|            }
    68|        });
    69|    } catch (e) {
    70|        console.error(`Failed PDF: ${filePath}`, e.message);
    71|    }
    72|}
    73|
    74|async function extractFromDocx(filePath, userId, courseCode, level, semester) {
    75|    try {
    76|        const result = await mammoth.extractRawText({path: filePath});
    77|        const text = result.value;
    78|        const title = path.basename(filePath, '.docx');
    79|        
    80|        await prisma.topic.upsert({
    81|            where: { id: `${filePath}-${title}` },
    82|            update: { content: text },
    83|            create: {
                level,
                semester,
    84|                id: `${filePath}-${title}`,
    85|                userId,
    86|                courseCode,
    87|                title,
    88|                content: text,
    89|                sourceFile: filePath,
    90|                status: 'UNSEEN'
    91|            }
    92|        });
    93|    } catch (e) {
    94|        console.error(`Failed DOCX: ${filePath}`, e.message);
    95|    }
    96|}
    97|
    98|async function walk(dir, callback) {
    99|    const files = fs.readdirSync(dir);
   100|    for (const file of files) {
   101|        const filepath = path.join(dir, file);
   102|        const stat = fs.statSync(filepath);
   103|        if (stat.isDirectory()) {
   104|            await walk(filepath, callback);
   105|        } else {
   106|            await callback(filepath);
   107|        }
   108|    }
   109|}
   110|
   111|async function run() {
   112|    const user = await prisma.user.findFirst();
   113|    if (!user) throw new Error("No user found");
   114|
   115|    console.log("Compounding Knowledge from /opt/data/courses...");
   116|    const levels = fs.readdirSync(COURSES_ROOT).filter(d => d.match(/\d+L/));
   117|    
   118|    for (const level of levels) {
   119|        const levelPath = path.join(COURSES_ROOT, level);
   120|        const semesters = fs.readdirSync(levelPath).filter(d => d.includes('st') || d.includes('nd') || d.toLowerCase().includes('semester'));
   121|        
   122|        for (const semester of semesters) {
   123|            const semPath = path.join(levelPath, semester);
   124|            if (!fs.statSync(semPath).isDirectory()) continue;
   125|            
   126|            const courses = fs.readdirSync(semPath);
   127|            for (const courseDir of courses) {
   128|                const coursePath = path.join(semPath, courseDir);
   129|                if (!fs.statSync(coursePath).isDirectory()) continue;
   130|                
   131|                
                const levelInt = parseInt(level.replace('L', ''));
                console.log(`Processing: ${courseCode} (${levelInt} ${semester})`);
                
                await walk(coursePath, async (filePath) => {
                    const ext = path.extname(filePath).toLowerCase();
                    if (ext === '.md') await extractFromMd(filePath, user.id, courseCode, levelInt, semester);
                    else if (ext === '.pdf') await extractFromPdf(filePath, user.id, courseCode, levelInt, semester);
                    else if (ext === '.docx') await extractFromDocx(filePath, user.id, courseCode, levelInt, semester);
                });

   140|            }
   141|            console.log("");
   142|        }
   143|    }
   144|    console.log('Knowledge Compounding complete.');
   145|}
   146|
   147|run().catch(console.error).finally(() => prisma.$disconnect());
   148|