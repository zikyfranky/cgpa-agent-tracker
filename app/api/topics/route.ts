import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const courseCode = searchParams.get('courseCode');
  
  try {
    const topics = await prisma.topic.findMany({
      where: courseCode ? { courseCode } : {},
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
