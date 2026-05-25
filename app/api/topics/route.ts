import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const courseCode = searchParams.get('courseCode');
  const level = searchParams.get('level');
  const semester = searchParams.get('semester');
  
  try {
    const whereClause: any = {};
    if (courseCode) whereClause.courseCode = courseCode;
    if (level) whereClause.level = parseInt(level);
    if (semester) whereClause.semester = semester;

    const topics = await prisma.topic.findMany({
      where: whereClause,
      orderBy: { title: 'asc' }
    });
    return NextResponse.json(topics);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;
    
    const updated = await prisma.topic.update({
      where: { id },
      data: { status, lastStudiedAt: new Date() }
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
