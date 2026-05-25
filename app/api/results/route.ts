import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const results = await prisma.result.findMany({
      orderBy: [
        { level: 'asc' },
        { semester: 'asc' },
        { courseCode: 'asc' }
      ]
    });
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, grade, gradePoint, caScore, examScore } = body;
    
    const updated = await prisma.result.update({
      where: { id },
      data: {
        grade,
        gradePoint: parseInt(gradePoint),
        caScore: caScore !== null ? parseFloat(caScore) : null,
        examScore: examScore !== null ? parseFloat(examScore) : null,
      },
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update result' }, { status: 500 });
  }
}
